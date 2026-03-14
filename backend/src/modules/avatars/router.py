import asyncio
import base64
import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, AsyncIterator, Dict, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.database import AsyncSessionLocal, get_db
from src.core.security import get_current_user
from src.modules.automations.models import AutomationBinding, AutomationBindingStatus
from src.modules.avatars.models import (
    Avatar,
    AvatarAttachment,
    AvatarBuildState,
    AvatarDeploymentSummary,
    AvatarFieldLock,
    AvatarPersonalitySnapshot,
    AvatarReactionAsset,
    AvatarReactionStatus,
    AvatarTrainingStatus,
    AvatarVisualProfile,
    ReferenceSlot,
    VisualVersion,
)
from src.modules.avatars.schemas import (
    AttachmentResponse,
    AvatarAllResponse,
    AvatarCardResponse,
    AvatarDetailResponse,
    AvatarDraftCreate,
    AvatarFieldLockResponse,
    AvatarTrainingSummary,
    AvatarUpdate,
    AvatarsHubResponse,
    BindingActionResponse,
    CloneResponse,
    DeployRequest,
    ExploreAvatarResponse,
    ExploreResponse,
    EditBaseRequest,
    GenerateBaseRequest,
    GenerateReferencesResponse,
    GenerationResponse,
    PauseRequest,
    ReferenceSlotResponse,
    RetryLoraResponse,
    ToggleVisibilityRequest,
    ToggleVisibilityResponse,
    VisualVersionResponse,
)
from src.services.ai.fal_service import FalService, FalServiceError
from src.services.ai.media_service import MediaStorageService
from src.services.ai.prompt_templates import PromptTemplateService

router = APIRouter()

DRAFT_STATES = {
    AvatarBuildState.DRAFT_VISUAL,
    AvatarBuildState.DRAFT_APPEARANCE,
    AvatarBuildState.TRAINING_LORA,
    AvatarBuildState.FAILED_TRAINING,
    AvatarBuildState.DRAFT_PERSONALITY,
}
AVATAR_LIMIT = 10
MAX_VISUAL_HISTORY = 10
MAX_LORA_AUTO_RETRIES = 3
SOFT_DELETE_RETENTION_DAYS = 10


class AvatarEventBroker:
    def __init__(self) -> None:
        self._subscribers: Dict[int, List[asyncio.Queue[str]]] = {}

    async def publish(self, avatar_id: int, event_type: str, payload: Dict[str, Any]) -> None:
        payload_with_event = {"event": event_type, **payload}
        message = f"event: {event_type}\ndata: {json.dumps(payload_with_event)}\n\n"
        for queue in self._subscribers.get(avatar_id, []):
            await queue.put(message)

    def subscribe(self, avatar_id: int) -> asyncio.Queue[str]:
        queue: asyncio.Queue[str] = asyncio.Queue()
        self._subscribers.setdefault(avatar_id, []).append(queue)
        return queue

    def unsubscribe(self, avatar_id: int, queue: asyncio.Queue[str]) -> None:
        subscribers = self._subscribers.get(avatar_id)
        if not subscribers:
            return
        if queue in subscribers:
            subscribers.remove(queue)
        if not subscribers:
            self._subscribers.pop(avatar_id, None)


fal_service = FalService()
media_service = MediaStorageService()
event_broker = AvatarEventBroker()
training_tasks: Dict[int, asyncio.Task[Any]] = {}
reaction_tasks: Dict[int, asyncio.Task[Any]] = {}


def _json_load_list(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(item) for item in parsed]
    except json.JSONDecodeError:
        pass
    return []


def _json_dump_list(values: Optional[List[str]]) -> Optional[str]:
    if values is None:
        return None
    return json.dumps(values)


def _derive_deployment_summary(avatar: Avatar) -> Optional[AvatarDeploymentSummary]:
    return _derive_deployment_summary_from_bindings(
        avatar.build_state, avatar.automation_bindings or []
    )


def _derive_deployment_summary_from_bindings(
    build_state: AvatarBuildState, bindings: List[AutomationBinding]
) -> Optional[AvatarDeploymentSummary]:
    if build_state != AvatarBuildState.READY:
        return None

    if not bindings:
        return AvatarDeploymentSummary.NOT_IN_USE

    active_count = sum(1 for b in bindings if b.status == AutomationBindingStatus.ACTIVE)
    paused_count = len(bindings) - active_count

    if active_count == len(bindings):
        return AvatarDeploymentSummary.IN_USE
    if paused_count == len(bindings):
        return AvatarDeploymentSummary.FULLY_PAUSED
    return AvatarDeploymentSummary.PARTIALLY_PAUSED


def _training_summary(avatar: Avatar) -> Optional[AvatarTrainingSummary]:
    profile = avatar.visual_profile
    if not profile:
        return None
    return AvatarTrainingSummary(
        status=profile.training_status.value,
        training_attempt_count=profile.training_attempt_count,
        training_error_code=profile.training_error_code,
        training_started_at=profile.training_started_at,
        training_completed_at=profile.training_completed_at,
    )


def _avatar_card_response(avatar: Avatar) -> AvatarCardResponse:
    deployment_summary = _derive_deployment_summary(avatar)
    return AvatarCardResponse(
        id=avatar.id,
        name=avatar.name,
        age=avatar.age,
        description=avatar.description,
        role_paragraph=avatar.role_paragraph,
        active_card_image_url=avatar.active_card_image_url,
        build_state=avatar.build_state.value,
        deployment_summary=deployment_summary.value if deployment_summary else None,
        ownership_scope=avatar.ownership_scope,
        source_type=avatar.source_type,
        source_avatar_id=avatar.source_avatar_id,
        is_public=avatar.is_public,
        clone_count=avatar.clone_count,
        updated_at=avatar.updated_at,
        training_summary=_training_summary(avatar),
    )


def _latest_personality_payload(avatar: Avatar) -> Optional[Dict[str, Any]]:
    if not avatar.personality_snapshots:
        return None
    latest = sorted(
        avatar.personality_snapshots,
        key=lambda snapshot: snapshot.version_number,
        reverse=True,
    )[0]
    try:
        parsed = json.loads(latest.payload_json)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        return None
    return None


def _avatar_detail_response(avatar: Avatar) -> AvatarDetailResponse:
    deployment_summary = _derive_deployment_summary(avatar)
    return AvatarDetailResponse(
        id=avatar.id,
        owner_id=avatar.owner_id,
        org_id=avatar.org_id,
        name=avatar.name,
        age=avatar.age,
        description=avatar.description,
        backstory=avatar.backstory,
        communication_principles=_json_load_list(avatar.communication_principles),
        industry_id=avatar.industry_id,
        role_paragraph=avatar.role_paragraph,
        active_card_image_url=avatar.active_card_image_url,
        build_state=avatar.build_state.value,
        deployment_summary=deployment_summary.value if deployment_summary else None,
        ownership_scope=avatar.ownership_scope,
        source_type=avatar.source_type,
        source_avatar_id=avatar.source_avatar_id,
        is_public=avatar.is_public,
        clone_count=avatar.clone_count,
        created_at=avatar.created_at,
        updated_at=avatar.updated_at,
        field_locks=[AvatarFieldLockResponse.model_validate(lock) for lock in avatar.field_locks],
        training_summary=_training_summary(avatar),
        personality_payload=_latest_personality_payload(avatar),
    )


def _can_read_avatar(avatar: Avatar, user_id: str) -> bool:
    if avatar.build_state == AvatarBuildState.SOFT_DELETED:
        return avatar.owner_id == user_id
    if avatar.owner_id == user_id:
        return True
    if avatar.ownership_scope == "org":
        return True
    return bool(avatar.is_public)


def _can_edit_avatar(avatar: Avatar, user_id: str) -> bool:
    if avatar.ownership_scope == "org":
        return avatar.owner_id == user_id
    return avatar.owner_id == user_id


def _is_public_eligible(avatar: Avatar) -> bool:
    return (
        avatar.build_state == AvatarBuildState.READY
        and avatar.ownership_scope == "personal"
        and avatar.source_type == "original"
        and avatar.deleted_at is None
    )


async def _fetch_avatar_with_relations(db: AsyncSession, avatar_id: int) -> Optional[Avatar]:
    result = await db.execute(
        select(Avatar)
        .options(
            selectinload(Avatar.industry),
            selectinload(Avatar.owner),
            selectinload(Avatar.automation_bindings),
            selectinload(Avatar.visual_profile),
            selectinload(Avatar.field_locks),
            selectinload(Avatar.personality_snapshots),
        )
        .where(Avatar.id == avatar_id)
    )
    return result.scalar_one_or_none()


async def _ensure_visual_profile(db: AsyncSession, avatar: Avatar) -> AvatarVisualProfile:
    existing_result = await db.execute(
        select(AvatarVisualProfile).where(AvatarVisualProfile.avatar_id == avatar.id)
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        return existing

    profile = AvatarVisualProfile(avatar_id=avatar.id)
    db.add(profile)
    await db.flush()
    return profile


async def _enforce_visual_history_cap(db: AsyncSession, avatar_id: int) -> None:
    result = await db.execute(
        select(VisualVersion)
        .where(VisualVersion.avatar_id == avatar_id)
        .order_by(VisualVersion.version_number.desc())
    )
    versions = result.scalars().all()
    if len(versions) <= MAX_VISUAL_HISTORY:
        return

    for stale in versions[MAX_VISUAL_HISTORY:]:
        await db.delete(stale)


def _cancel_background_task(task_map: Dict[int, asyncio.Task[Any]], avatar_id: int) -> None:
    task = task_map.get(avatar_id)
    if not task:
        return
    if not task.done():
        task.cancel()
    task_map.pop(avatar_id, None)


async def _should_invalidate_step2_outputs(db: AsyncSession, avatar: Avatar) -> bool:
    refs_count_result = await db.execute(
        select(func.count(ReferenceSlot.id)).where(ReferenceSlot.avatar_id == avatar.id)
    )
    refs_count = refs_count_result.scalar_one()
    if refs_count > 0:
        return True

    reactions_count_result = await db.execute(
        select(func.count(AvatarReactionAsset.id)).where(
            AvatarReactionAsset.avatar_id == avatar.id
        )
    )
    reactions_count = reactions_count_result.scalar_one()
    if reactions_count > 0:
        return True

    profile = avatar.visual_profile
    if not profile:
        return False
    return profile.training_status != AvatarTrainingStatus.NOT_STARTED


async def _invalidate_step2_outputs(db: AsyncSession, avatar: Avatar) -> None:
    _cancel_background_task(training_tasks, avatar.id)
    _cancel_background_task(reaction_tasks, avatar.id)

    refs_result = await db.execute(select(ReferenceSlot).where(ReferenceSlot.avatar_id == avatar.id))
    for ref in refs_result.scalars().all():
        await db.delete(ref)

    reactions_result = await db.execute(
        select(AvatarReactionAsset).where(AvatarReactionAsset.avatar_id == avatar.id)
    )
    for reaction in reactions_result.scalars().all():
        await db.delete(reaction)

    profile = await _ensure_visual_profile(db, avatar)
    profile.training_status = AvatarTrainingStatus.NOT_STARTED
    profile.training_error_code = None
    profile.training_started_at = None
    profile.training_completed_at = None
    profile.lora_model_id = None
    profile.training_attempt_count = 0

    avatar.build_state = AvatarBuildState.DRAFT_APPEARANCE


def _validate_completion(avatar: Avatar, references: List[ReferenceSlot]) -> None:
    if not avatar.active_card_image_url:
        raise HTTPException(status_code=400, detail="Active base face is required")

    if len(references) != 15:
        raise HTTPException(status_code=400, detail="Reference set must contain exactly 15 images")

    profile = avatar.visual_profile
    if not profile or profile.training_status != AvatarTrainingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="LoRA training must be completed")

    if not avatar.name or len(avatar.name) < 2:
        raise HTTPException(status_code=400, detail="Name is required")

    if avatar.age is None:
        raise HTTPException(status_code=400, detail="Age is required")

    if not avatar.description or len(avatar.description) < 20:
        raise HTTPException(status_code=400, detail="Description is required")

    if not avatar.backstory or len(avatar.backstory) < 80:
        raise HTTPException(status_code=400, detail="Backstory is required")

    communication_principles = _json_load_list(avatar.communication_principles)
    if not communication_principles:
        raise HTTPException(status_code=400, detail="At least one communication principle is required")

    if avatar.industry_id is None:
        raise HTTPException(status_code=400, detail="Industry is required")

    if not avatar.role_paragraph:
        raise HTTPException(status_code=400, detail="Role is required")


async def _schedule_reaction_generation(avatar_id: int) -> None:
    if avatar_id in reaction_tasks and not reaction_tasks[avatar_id].done():
        return

    async def _run() -> None:
        try:
            async with AsyncSessionLocal() as session:
                avatar = await _fetch_avatar_with_relations(session, avatar_id)
                if not avatar:
                    return

                payload = _latest_personality_payload(avatar) or {}
                reactions = payload.get("reactions", [])
                if not isinstance(reactions, list):
                    reactions = []

                if not reactions:
                    return

                for reaction in reactions:
                    name = str(reaction.get("name") or "Custom Reaction")
                    await event_broker.publish(
                        avatar_id,
                        "avatar.reaction.generation.started",
                        {"avatarId": avatar_id, "name": name},
                    )

                    asset = AvatarReactionAsset(
                        avatar_id=avatar_id,
                        name=name,
                        usage_intent=reaction.get("usage_intent"),
                        hook_description=reaction.get("hook_description"),
                        generation_prompt=reaction.get("generation_prompt"),
                        status=AvatarReactionStatus.GENERATING,
                        is_predefined=bool(reaction.get("is_predefined")),
                    )
                    session.add(asset)
                    await session.commit()
                    await asyncio.sleep(0.15)

                    asset.status = AvatarReactionStatus.READY
                    await session.commit()
                    await event_broker.publish(
                        avatar_id,
                        "avatar.reaction.generation.completed",
                        {"avatarId": avatar_id, "name": name},
                    )
        except Exception:
            await event_broker.publish(
                avatar_id,
                "avatar.reaction.generation.failed",
                {"avatarId": avatar_id, "message": "Reaction generation failed"},
            )

    reaction_tasks[avatar_id] = asyncio.create_task(_run())


async def _start_lora_training(avatar_id: int) -> None:
    if avatar_id in training_tasks and not training_tasks[avatar_id].done():
        return

    async def _run(attempt_index: int = 0) -> None:
        try:
            async with AsyncSessionLocal() as session:
                avatar = await _fetch_avatar_with_relations(session, avatar_id)
                if not avatar:
                    return

                profile = await _ensure_visual_profile(session, avatar)
                profile.training_status = AvatarTrainingStatus.RUNNING
                profile.training_started_at = datetime.now(timezone.utc)
                profile.training_attempt_count = max(profile.training_attempt_count, attempt_index + 1)
                profile.training_error_code = None
                avatar.build_state = AvatarBuildState.TRAINING_LORA
                await session.commit()

                await event_broker.publish(
                    avatar_id,
                    "avatar.training.started",
                    {
                        "avatarId": avatar_id,
                        "status": "running",
                        "progressPercent": 0,
                        "retryAttempt": profile.training_attempt_count,
                        "etaSeconds": 12,
                        "message": "Preparing dataset",
                    },
                )

                progress_frames = [
                    (18, "Preparing dataset", 10),
                    (42, "Training", 7),
                    (67, "Training", 5),
                    (88, "Validating", 3),
                    (100, "Completed", 0),
                ]
                for progress, message, eta in progress_frames:
                    await asyncio.sleep(0.4)
                    await event_broker.publish(
                        avatar_id,
                        "avatar.training.progress",
                        {
                            "avatarId": avatar_id,
                            "status": "running",
                            "progressPercent": progress,
                            "retryAttempt": profile.training_attempt_count,
                            "etaSeconds": eta,
                            "message": message,
                        },
                    )

                profile.training_status = AvatarTrainingStatus.COMPLETED
                profile.training_completed_at = datetime.now(timezone.utc)
                profile.lora_model_id = f"lora-avatar-{avatar_id}-v{profile.training_attempt_count}"
                avatar.build_state = AvatarBuildState.DRAFT_PERSONALITY
                await session.commit()

                await event_broker.publish(
                    avatar_id,
                    "avatar.training.completed",
                    {
                        "avatarId": avatar_id,
                        "status": "completed",
                        "progressPercent": 100,
                        "retryAttempt": profile.training_attempt_count,
                        "etaSeconds": 0,
                        "message": "Completed",
                    },
                )
        except Exception:
            async with AsyncSessionLocal() as session:
                avatar = await _fetch_avatar_with_relations(session, avatar_id)
                if not avatar:
                    return
                profile = await _ensure_visual_profile(session, avatar)
                if profile.training_attempt_count < (MAX_LORA_AUTO_RETRIES + 1):
                    profile.training_status = AvatarTrainingStatus.RETRYING
                    await session.commit()
                    await event_broker.publish(
                        avatar_id,
                        "avatar.training.retrying",
                        {
                            "avatarId": avatar_id,
                            "status": "retrying",
                            "progressPercent": 0,
                            "retryAttempt": profile.training_attempt_count,
                            "etaSeconds": 12,
                            "message": "Retrying",
                        },
                    )
                    await _run(profile.training_attempt_count)
                    return

                profile.training_status = AvatarTrainingStatus.FAILED
                profile.training_error_code = "LORA_TRAINING_FAILED"
                avatar.build_state = AvatarBuildState.FAILED_TRAINING
                await session.commit()

                await event_broker.publish(
                    avatar_id,
                    "avatar.training.failed",
                    {
                        "avatarId": avatar_id,
                        "status": "failed",
                        "progressPercent": 0,
                        "retryAttempt": profile.training_attempt_count,
                        "etaSeconds": 0,
                        "message": "Failed",
                    },
                )

    training_tasks[avatar_id] = asyncio.create_task(_run())


@router.post("/drafts", response_model=AvatarDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_avatar_draft(
    payload: AvatarDraftCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    personal_count_result = await db.execute(
        select(func.count(Avatar.id)).where(
            Avatar.owner_id == current_user["id"],
            Avatar.ownership_scope == "personal",
            Avatar.build_state != AvatarBuildState.SOFT_DELETED,
        )
    )
    personal_count = personal_count_result.scalar() or 0

    if payload.ownership_scope == "personal" and personal_count >= AVATAR_LIMIT:
        raise HTTPException(
            status_code=400,
            detail=f"Avatar limit reached. Maximum {AVATAR_LIMIT} personal avatars allowed.",
        )

    avatar = Avatar(
        owner_id=current_user["id"],
        ownership_scope=payload.ownership_scope,
        org_id=payload.org_id if payload.ownership_scope == "org" else None,
        source_type="original",
        build_state=AvatarBuildState.DRAFT_VISUAL,
    )
    db.add(avatar)
    await db.flush()
    await _ensure_visual_profile(db, avatar)
    await db.commit()

    created = await _fetch_avatar_with_relations(db, avatar.id)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create draft")
    return _avatar_detail_response(created)


@router.get("", response_model=AvatarsHubResponse)
async def get_avatars_hub(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    continue_result = await db.execute(
        select(Avatar)
        .options(selectinload(Avatar.automation_bindings), selectinload(Avatar.visual_profile))
        .where(Avatar.owner_id == user_id, Avatar.build_state.in_(list(DRAFT_STATES)))
        .order_by(Avatar.updated_at.desc())
    )
    continue_creation = continue_result.scalars().all()

    my_result = await db.execute(
        select(Avatar)
        .options(selectinload(Avatar.automation_bindings), selectinload(Avatar.visual_profile))
        .where(
            Avatar.owner_id == user_id,
            Avatar.build_state == AvatarBuildState.READY,
            Avatar.ownership_scope == "personal",
        )
        .order_by(Avatar.updated_at.desc())
    )
    my_avatars = my_result.scalars().all()

    org_result = await db.execute(
        select(Avatar)
        .options(selectinload(Avatar.automation_bindings), selectinload(Avatar.visual_profile))
        .where(
            Avatar.ownership_scope == "org",
            Avatar.build_state == AvatarBuildState.READY,
            Avatar.build_state != AvatarBuildState.SOFT_DELETED,
        )
        .order_by(Avatar.updated_at.desc())
    )
    org_avatars = org_result.scalars().all()

    return AvatarsHubResponse(
        continue_creation=[_avatar_card_response(a) for a in continue_creation],
        my_avatars=[_avatar_card_response(a) for a in my_avatars],
        org_avatars=[_avatar_card_response(a) for a in org_avatars],
    )


@router.get("/all", response_model=AvatarAllResponse)
async def get_all_personal_avatars(
    search: Optional[str] = Query(default=None),
    source_type: Optional[str] = Query(default=None),
    visibility: Optional[str] = Query(default=None),
    deployment_summary: Optional[str] = Query(default=None),
    sort: str = Query(default="newest"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar)
        .options(selectinload(Avatar.automation_bindings), selectinload(Avatar.visual_profile))
        .where(
            Avatar.owner_id == current_user["id"],
            Avatar.ownership_scope == "personal",
            Avatar.build_state == AvatarBuildState.READY,
            Avatar.build_state != AvatarBuildState.SOFT_DELETED,
        )
    )
    avatars = result.scalars().all()

    if search:
        term = search.lower().strip()
        avatars = [
            avatar
            for avatar in avatars
            if term in (avatar.name or "").lower() or term in (avatar.description or "").lower()
        ]

    if source_type:
        avatars = [avatar for avatar in avatars if avatar.source_type == source_type]

    if visibility:
        if visibility == "public":
            avatars = [avatar for avatar in avatars if avatar.is_public]
        elif visibility == "private":
            avatars = [avatar for avatar in avatars if not avatar.is_public]

    if deployment_summary:
        avatars = [
            avatar
            for avatar in avatars
            if (_derive_deployment_summary(avatar) or AvatarDeploymentSummary.NOT_IN_USE).value
            == deployment_summary
        ]

    if sort == "oldest":
        avatars.sort(key=lambda avatar: avatar.created_at)
    elif sort == "recently_edited":
        avatars.sort(key=lambda avatar: avatar.updated_at, reverse=True)
    elif sort == "alphabetical":
        avatars.sort(key=lambda avatar: (avatar.name or "").lower())
    else:
        avatars.sort(key=lambda avatar: avatar.created_at, reverse=True)

    return AvatarAllResponse(
        avatars=[_avatar_card_response(avatar) for avatar in avatars],
        total=len(avatars),
    )


@router.get("/explore", response_model=ExploreResponse)
async def get_explore_avatars(
    search: Optional[str] = Query(None),
    industry_id: Optional[int] = Query(None),
    sort: str = Query("newest", pattern="^(featured|popular|newest)$"),
    cursor: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Avatar)
        .options(selectinload(Avatar.industry), selectinload(Avatar.owner))
        .where(
            Avatar.build_state == AvatarBuildState.READY,
            Avatar.deleted_at.is_(None),
            Avatar.is_public,
            Avatar.ownership_scope == "personal",
            Avatar.source_type == "original",
        )
    )

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(Avatar.name.ilike(search_term), Avatar.description.ilike(search_term))
        )

    if industry_id is not None:
        query = query.where(Avatar.industry_id == industry_id)

    cursor_id = None
    if cursor:
        try:
            cursor_id = int(base64.b64decode(cursor).decode())
        except Exception:
            cursor_id = None

    if cursor_id:
        query = query.where(Avatar.id < cursor_id)

    if sort in {"featured", "popular"}:
        query = query.order_by(Avatar.clone_count.desc(), Avatar.created_at.desc())
    else:
        query = query.order_by(Avatar.created_at.desc())

    query = query.limit(limit + 1)

    result = await db.execute(query)
    avatars = result.scalars().all()

    has_more = len(avatars) > limit
    if has_more:
        avatars = avatars[:limit]

    next_cursor = None
    if has_more and avatars:
        next_cursor = base64.b64encode(str(avatars[-1].id).encode()).decode()

    return ExploreResponse(
        avatars=[
            ExploreAvatarResponse(
                id=avatar.id,
                name=avatar.name,
                age=avatar.age,
                description=avatar.description,
                role_paragraph=avatar.role_paragraph,
                active_card_image_url=avatar.active_card_image_url,
                industry=avatar.industry,
                creator_name=getattr(avatar.owner, "name", None),
                clone_count=avatar.clone_count,
                is_public=avatar.is_public,
                created_at=avatar.created_at,
            )
            for avatar in avatars
        ],
        next_cursor=next_cursor,
        has_more=has_more,
    )


@router.get("/{avatar_id}", response_model=AvatarDetailResponse)
async def get_avatar(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_read_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")
    return _avatar_detail_response(avatar)


@router.patch("/{avatar_id}", response_model=AvatarDetailResponse)
async def update_avatar(
    avatar_id: int,
    payload: AvatarUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    update_data = payload.model_dump(exclude_unset=True)
    locked_paths = {lock.field_path for lock in avatar.field_locks if lock.is_locked}

    changed_fields = set(update_data.keys()) - {"personality_payload", "complete_avatar"}
    if avatar.source_type == "clone":
        locked_hit = [field for field in changed_fields if field in locked_paths]
        if locked_hit:
            raise HTTPException(
                status_code=403,
                detail=f"Field(s) locked for this clone: {', '.join(sorted(locked_hit))}",
            )

    if "communication_principles" in update_data:
        avatar.communication_principles = _json_dump_list(update_data.pop("communication_principles"))

    for field in [
        "name",
        "age",
        "description",
        "backstory",
        "industry_id",
        "role_paragraph",
        "active_card_image_url",
    ]:
        if field in update_data:
            setattr(avatar, field, update_data[field])

    personality_payload = update_data.get("personality_payload")
    if personality_payload:
        parsed_payload = personality_payload
        if parsed_payload.get("backstory"):
            avatar.backstory = parsed_payload["backstory"]
        if parsed_payload.get("communication_principles"):
            avatar.communication_principles = _json_dump_list(parsed_payload["communication_principles"])

        snapshot_result = await db.execute(
            select(func.max(AvatarPersonalitySnapshot.version_number)).where(
                AvatarPersonalitySnapshot.avatar_id == avatar.id
            )
        )
        next_version = (snapshot_result.scalar() or 0) + 1
        snapshot = AvatarPersonalitySnapshot(
            avatar_id=avatar.id,
            version_number=next_version,
            payload_json=json.dumps(parsed_payload),
        )
        db.add(snapshot)

    if payload.complete_avatar:
        refs_result = await db.execute(
            select(ReferenceSlot).where(ReferenceSlot.avatar_id == avatar.id)
        )
        references = refs_result.scalars().all()
        _validate_completion(avatar, references)
        avatar.build_state = AvatarBuildState.READY
        await db.commit()
        await _schedule_reaction_generation(avatar.id)
    else:
        if avatar.build_state in {
            AvatarBuildState.DRAFT_APPEARANCE,
            AvatarBuildState.TRAINING_LORA,
            AvatarBuildState.FAILED_TRAINING,
        }:
            pass
        elif avatar.build_state != AvatarBuildState.READY:
            avatar.build_state = AvatarBuildState.DRAFT_PERSONALITY
        await db.commit()

    refreshed = await _fetch_avatar_with_relations(db, avatar.id)
    if not refreshed:
        raise HTTPException(status_code=500, detail="Failed to load avatar")
    return _avatar_detail_response(refreshed)


@router.delete("/{avatar_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_avatar(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    avatar.build_state = AvatarBuildState.SOFT_DELETED
    avatar.deleted_at = datetime.now(timezone.utc)
    avatar.hard_delete_at = avatar.deleted_at + timedelta(days=SOFT_DELETE_RETENTION_DAYS)
    avatar.is_public = False

    bindings_result = await db.execute(
        select(AutomationBinding).where(AutomationBinding.avatar_id == avatar.id)
    )
    for binding in bindings_result.scalars().all():
        binding.status = AutomationBindingStatus.PAUSED
        await db.delete(binding)

    await db.commit()
    return None


@router.post("/{avatar_id}/toggle-visibility", response_model=ToggleVisibilityResponse)
async def toggle_visibility(
    avatar_id: int,
    payload: ToggleVisibilityRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or avatar.owner_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Avatar not found")

    if payload.is_public and not _is_public_eligible(avatar):
        raise HTTPException(
            status_code=400,
            detail="Avatar is not eligible for public visibility",
        )

    avatar.is_public = payload.is_public

    existing_locks = list(avatar.field_locks)
    for lock in existing_locks:
        await db.delete(lock)

    locks_to_write = payload.field_locks
    if payload.use_as_is_only:
        locks_to_write = [
            {"field_path": "name", "is_locked": True},
            {"field_path": "description", "is_locked": True},
            {"field_path": "backstory", "is_locked": True},
            {"field_path": "communication_principles", "is_locked": True},
            {"field_path": "industry_id", "is_locked": True},
            {"field_path": "role_paragraph", "is_locked": True},
        ]

    for lock in locks_to_write:
        if isinstance(lock, dict):
            field_path = lock["field_path"]
            is_locked = lock.get("is_locked", True)
        else:
            field_path = lock.field_path
            is_locked = lock.is_locked
        db.add(
            AvatarFieldLock(
                avatar_id=avatar.id,
                field_path=field_path,
                is_locked=is_locked,
            )
        )

    await db.commit()
    refreshed = await _fetch_avatar_with_relations(db, avatar.id)
    if not refreshed:
        raise HTTPException(status_code=500, detail="Failed to load avatar")

    return ToggleVisibilityResponse(avatar=_avatar_detail_response(refreshed))


@router.post("/{avatar_id}/clone", response_model=CloneResponse)
async def clone_avatar(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    source_avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not source_avatar:
        raise HTTPException(status_code=404, detail="Source avatar not found")

    if (
        source_avatar.build_state != AvatarBuildState.READY
        or not source_avatar.is_public
        or source_avatar.ownership_scope != "personal"
        or source_avatar.source_type != "original"
        or source_avatar.deleted_at is not None
    ):
        raise HTTPException(status_code=400, detail="Source avatar is not clone-eligible")

    clone = Avatar(
        owner_id=current_user["id"],
        ownership_scope="personal",
        source_type="clone",
        source_avatar_id=source_avatar.id,
        visual_profile_snapshot_id=source_avatar.visual_profile_snapshot_id,
        build_state=AvatarBuildState.READY,
        name=source_avatar.name,
        age=source_avatar.age,
        description=source_avatar.description,
        backstory=source_avatar.backstory,
        communication_principles=source_avatar.communication_principles,
        industry_id=source_avatar.industry_id,
        role_paragraph=source_avatar.role_paragraph,
        active_card_image_url=source_avatar.active_card_image_url,
        is_public=False,
    )
    db.add(clone)
    await db.flush()

    for source_lock in source_avatar.field_locks:
        db.add(
            AvatarFieldLock(
                avatar_id=clone.id,
                field_path=source_lock.field_path,
                is_locked=source_lock.is_locked,
            )
        )

    source_avatar.clone_count += 1

    await db.commit()
    cloned = await _fetch_avatar_with_relations(db, clone.id)
    if not cloned:
        raise HTTPException(status_code=500, detail="Failed to clone avatar")

    return CloneResponse(avatar=_avatar_detail_response(cloned))


@router.post("/{avatar_id}/deploy", response_model=BindingActionResponse)
async def deploy_avatar(
    avatar_id: int,
    payload: DeployRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    if avatar.build_state != AvatarBuildState.READY:
        raise HTTPException(status_code=400, detail="Only ready avatars can be deployed")

    query = await db.execute(
        select(AutomationBinding).where(
            AutomationBinding.owner_id == current_user["id"],
            AutomationBinding.id.in_(payload.automation_ids),
        )
    )
    automations = query.scalars().all()
    found_ids = {item.id for item in automations}
    missing_ids = sorted(set(payload.automation_ids) - found_ids)
    if missing_ids:
        raise HTTPException(status_code=404, detail=f"Automation(s) not found: {missing_ids}")

    conflicts = [
        item.id
        for item in automations
        if item.avatar_id != avatar.id and item.status == AutomationBindingStatus.ACTIVE
    ]
    if conflicts and not payload.confirm_replace:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Replace confirmation required for active automations",
                "conflicts": conflicts,
            },
        )

    for item in automations:
        item.avatar_id = avatar.id
        item.status = AutomationBindingStatus.ACTIVE

    await db.commit()
    avatar_bindings_result = await db.execute(
        select(AutomationBinding).where(AutomationBinding.avatar_id == avatar.id)
    )
    deployment_summary = _derive_deployment_summary_from_bindings(
        avatar.build_state, avatar_bindings_result.scalars().all()
    )
    return BindingActionResponse(
        avatar_id=avatar.id,
        deployment_summary=(deployment_summary or AvatarDeploymentSummary.NOT_IN_USE).value,
        updated_automation_ids=sorted(payload.automation_ids),
    )


@router.post("/{avatar_id}/pause", response_model=BindingActionResponse)
async def pause_avatar(
    avatar_id: int,
    payload: PauseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    active_bindings = [
        binding
        for binding in avatar.automation_bindings
        if binding.status == AutomationBindingStatus.ACTIVE
    ]

    if not active_bindings:
        raise HTTPException(status_code=400, detail="Avatar has no active bindings")

    target_ids: List[int]
    if payload.automation_ids is None:
        if len(active_bindings) == 1:
            target_ids = [active_bindings[0].id]
        else:
            raise HTTPException(
                status_code=400,
                detail="Multiple active bindings found; specify automation_ids",
            )
    else:
        target_ids = payload.automation_ids

    for binding in active_bindings:
        if binding.id in target_ids:
            binding.status = AutomationBindingStatus.PAUSED

    await db.commit()
    avatar_bindings_result = await db.execute(
        select(AutomationBinding).where(AutomationBinding.avatar_id == avatar.id)
    )
    deployment_summary = _derive_deployment_summary_from_bindings(
        avatar.build_state, avatar_bindings_result.scalars().all()
    )
    return BindingActionResponse(
        avatar_id=avatar.id,
        deployment_summary=(deployment_summary or AvatarDeploymentSummary.NOT_IN_USE).value,
        updated_automation_ids=sorted(target_ids),
    )


@router.post("/{avatar_id}/generate-base", response_model=GenerationResponse, status_code=202)
async def generate_base_image(
    avatar_id: int,
    payload: GenerateBaseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    if avatar.source_type == "clone":
        raise HTTPException(status_code=400, detail="Clone visual identity is immutable")

    version_result = await db.execute(
        select(func.max(VisualVersion.version_number)).where(VisualVersion.avatar_id == avatar.id)
    )
    next_version = (version_result.scalar() or 0) + 1

    try:
        enhanced_prompt = PromptTemplateService.get_step1_new_generation_prompt(
            payload.prompt, payload.age
        )
        result = await fal_service.submit_and_wait(
            model=payload.model,
            prompt=enhanced_prompt,
            aspect_ratio=payload.aspect_ratio,
            is_edit=False,
        )
    except FalServiceError as error:
        raise HTTPException(status_code=500, detail=str(error))

    fal_url = result["images"][0]["url"]
    filename = f"base_v{next_version}_{uuid.uuid4().hex[:8]}.png"
    s3_url = await media_service.download_and_store(fal_url, avatar.id, "visual", filename)

    if await _should_invalidate_step2_outputs(db, avatar):
        await _invalidate_step2_outputs(db, avatar)

    await db.execute(
        update(VisualVersion)
        .where(VisualVersion.avatar_id == avatar.id)
        .values(is_active_base=False)
    )

    visual_version = VisualVersion(
        avatar_id=avatar.id,
        version_number=next_version,
        image_url=s3_url,
        fal_request_id=result.get("request_id"),
        prompt=payload.prompt,
        enhanced_prompt=enhanced_prompt,
        model_used=payload.model,
        aspect_ratio=payload.aspect_ratio,
        quality="medium" if payload.model in {"openai_image_1_5", "google_nano_banana_2"} else "auto_3K",
        is_edit=False,
        edit_source_url=fal_url,
        is_active_base=True,
    )
    db.add(visual_version)
    avatar.active_card_image_url = s3_url
    avatar.build_state = AvatarBuildState.DRAFT_APPEARANCE

    await _enforce_visual_history_cap(db, avatar.id)
    await db.commit()

    return GenerationResponse(
        version_id=visual_version.id,
        version_number=visual_version.version_number,
        image_url=visual_version.image_url,
        prompt=payload.prompt,
        model=payload.model,
        aspect_ratio=payload.aspect_ratio,
    )


@router.post("/{avatar_id}/edit-base", response_model=GenerationResponse, status_code=202)
async def edit_base_image(
    avatar_id: int,
    payload: EditBaseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    if avatar.source_type == "clone":
        raise HTTPException(status_code=400, detail="Clone visual identity is immutable")

    if payload.mask_image_url and payload.model != "openai_image_1_5":
        raise HTTPException(
            status_code=422,
            detail="Mask editing is only supported for ChatGPT Image (openai_image_1_5)",
        )

    base_version_result = await db.execute(
        select(VisualVersion)
        .where(VisualVersion.avatar_id == avatar.id, VisualVersion.is_active_base)
        .order_by(VisualVersion.version_number.desc())
        .limit(1)
    )
    base_version = base_version_result.scalar_one_or_none()
    if not base_version:
        raise HTTPException(status_code=400, detail="No active base image selected")

    version_result = await db.execute(
        select(func.max(VisualVersion.version_number)).where(VisualVersion.avatar_id == avatar.id)
    )
    next_version = (version_result.scalar() or 0) + 1

    try:
        enhanced_prompt = PromptTemplateService.get_step1_edit_prompt(payload.prompt, payload.age)
        reference_images = [url for url in (payload.reference_image_urls or []) if url]
        if not reference_images:
            reference_images = [
                base_version.edit_source_url or base_version.image_url
            ]

        result = await fal_service.submit_and_wait(
            model=payload.model,
            prompt=enhanced_prompt,
            aspect_ratio=payload.aspect_ratio or base_version.aspect_ratio,
            is_edit=True,
            image_urls=reference_images,
            mask_image_url=payload.mask_image_url,
        )
    except FalServiceError as error:
        raise HTTPException(status_code=500, detail=str(error))

    fal_url = result["images"][0]["url"]
    filename = f"edit_v{next_version}_{uuid.uuid4().hex[:8]}.png"
    s3_url = await media_service.download_and_store(fal_url, avatar.id, "visual", filename)

    if await _should_invalidate_step2_outputs(db, avatar):
        await _invalidate_step2_outputs(db, avatar)

    await db.execute(
        update(VisualVersion)
        .where(VisualVersion.avatar_id == avatar.id)
        .values(is_active_base=False)
    )

    visual_version = VisualVersion(
        avatar_id=avatar.id,
        version_number=next_version,
        image_url=s3_url,
        fal_request_id=result.get("request_id"),
        prompt=payload.prompt,
        enhanced_prompt=enhanced_prompt,
        model_used=payload.model,
        aspect_ratio=payload.aspect_ratio or base_version.aspect_ratio,
        quality="medium" if payload.model in {"openai_image_1_5", "google_nano_banana_2"} else "auto_3K",
        is_edit=True,
        mask_image_url=payload.mask_image_url,
        edit_source_url=fal_url,
        is_active_base=True,
    )
    db.add(visual_version)
    avatar.active_card_image_url = s3_url
    avatar.build_state = AvatarBuildState.DRAFT_APPEARANCE

    await _enforce_visual_history_cap(db, avatar.id)
    await db.commit()

    return GenerationResponse(
        version_id=visual_version.id,
        version_number=visual_version.version_number,
        image_url=visual_version.image_url,
        prompt=payload.prompt,
        model=payload.model,
        aspect_ratio=payload.aspect_ratio or base_version.aspect_ratio,
    )


@router.post("/{avatar_id}/set-active-base/{version_id}")
async def set_active_base(
    avatar_id: int,
    version_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    if avatar.source_type == "clone":
        raise HTTPException(status_code=400, detail="Clone visual identity is immutable")

    version_result = await db.execute(
        select(VisualVersion).where(
            VisualVersion.id == version_id,
            VisualVersion.avatar_id == avatar.id,
        )
    )
    version = version_result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Visual version not found")

    if await _should_invalidate_step2_outputs(db, avatar):
        await _invalidate_step2_outputs(db, avatar)

    await db.execute(
        update(VisualVersion)
        .where(VisualVersion.avatar_id == avatar.id)
        .values(is_active_base=False)
    )
    version.is_active_base = True
    avatar.active_card_image_url = version.image_url
    avatar.build_state = AvatarBuildState.DRAFT_APPEARANCE

    await db.commit()

    return {
        "message": "Active base image updated",
        "active_card_image_url": avatar.active_card_image_url,
        "build_state": avatar.build_state.value,
    }


@router.get("/{avatar_id}/visual-versions", response_model=List[VisualVersionResponse])
async def get_visual_versions(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_read_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    result = await db.execute(
        select(VisualVersion)
        .where(VisualVersion.avatar_id == avatar.id)
        .order_by(VisualVersion.version_number.desc())
    )
    return result.scalars().all()


@router.post("/{avatar_id}/generate-references", response_model=GenerateReferencesResponse, status_code=202)
async def generate_references(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    if avatar.source_type == "clone":
        raise HTTPException(status_code=400, detail="Clone visual identity is immutable")

    base_version_result = await db.execute(
        select(VisualVersion)
        .where(VisualVersion.avatar_id == avatar.id, VisualVersion.is_active_base)
        .order_by(VisualVersion.version_number.desc())
        .limit(1)
    )
    base_version = base_version_result.scalar_one_or_none()
    if not base_version:
        raise HTTPException(status_code=400, detail="No active base image selected")

    source_image_url = base_version.edit_source_url or base_version.image_url
    slot_definitions = PromptTemplateService.get_step2_reference_slots()

    existing_result = await db.execute(select(ReferenceSlot).where(ReferenceSlot.avatar_id == avatar.id))
    existing_map = {slot.slot_key: slot for slot in existing_result.scalars().all()}

    generated_slots: List[ReferenceSlot] = []

    for slot_def in slot_definitions:
        slot_key = slot_def["slot_key"]
        slot_label = slot_def["label"]
        include_base = slot_def.get("include_base", False)

        if include_base:
            image_url = base_version.image_url
            prompt = "Base face"
        else:
            slot_prompt = f"Turn the person in the image to: {slot_def.get('prompt', '')}"
            try:
                result = await fal_service.submit_and_wait(
                    model="seedream_v5",
                    prompt=slot_prompt,
                    aspect_ratio=base_version.aspect_ratio,
                    is_edit=True,
                    image_urls=[source_image_url],
                )
            except FalServiceError as error:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate reference slot {slot_key}: {error}",
                )

            fal_url = result["images"][0]["url"]
            filename = f"ref_{slot_key}_{uuid.uuid4().hex[:8]}.png"
            image_url = await media_service.download_and_store(
                fal_url, avatar.id, "reference", filename
            )
            prompt = slot_prompt

        if slot_key in existing_map:
            slot = existing_map[slot_key]
            slot.image_url = image_url
            slot.prompt = prompt
            slot.slot_label = slot_label
            slot.aspect_ratio = base_version.aspect_ratio
            slot.is_refined = False
        else:
            slot = ReferenceSlot(
                avatar_id=avatar.id,
                slot_key=slot_key,
                slot_label=slot_label,
                image_url=image_url,
                prompt=prompt,
                aspect_ratio=base_version.aspect_ratio,
            )
            db.add(slot)
        generated_slots.append(slot)

    expected_keys = {slot["slot_key"] for slot in slot_definitions}
    for key, stale in existing_map.items():
        if key not in expected_keys:
            await db.delete(stale)

    if avatar.visual_profile and avatar.visual_profile.training_status == AvatarTrainingStatus.COMPLETED:
        avatar.visual_profile.training_status = AvatarTrainingStatus.NOT_STARTED
        avatar.visual_profile.lora_model_id = None
        avatar.visual_profile.training_completed_at = None
        avatar.visual_profile.training_error_code = None

    avatar.build_state = AvatarBuildState.DRAFT_APPEARANCE
    await db.commit()

    refreshed_result = await db.execute(
        select(ReferenceSlot)
        .where(ReferenceSlot.avatar_id == avatar.id)
        .order_by(ReferenceSlot.slot_key.asc())
    )
    refreshed = refreshed_result.scalars().all()

    return GenerateReferencesResponse(
        count=len(refreshed),
        slots=[ReferenceSlotResponse.model_validate(slot) for slot in refreshed],
    )


@router.post("/{avatar_id}/train-lora", response_model=AvatarDetailResponse, status_code=202)
async def train_lora(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    if avatar.source_type == "clone":
        raise HTTPException(status_code=400, detail="Clone visual identity is immutable")

    refs_result = await db.execute(select(ReferenceSlot).where(ReferenceSlot.avatar_id == avatar.id))
    refs = refs_result.scalars().all()
    if len(refs) != 15:
        raise HTTPException(status_code=400, detail="Generate all 15 reference images first")

    profile = await _ensure_visual_profile(db, avatar)
    if profile.training_status in {
        AvatarTrainingStatus.QUEUED,
        AvatarTrainingStatus.RUNNING,
        AvatarTrainingStatus.RETRYING,
    }:
        raise HTTPException(status_code=400, detail="LoRA training already in progress")

    profile.training_status = AvatarTrainingStatus.QUEUED
    avatar.build_state = AvatarBuildState.TRAINING_LORA
    await db.commit()

    await _start_lora_training(avatar.id)
    refreshed = await _fetch_avatar_with_relations(db, avatar.id)
    if not refreshed:
        raise HTTPException(status_code=500, detail="Failed to queue training")
    return _avatar_detail_response(refreshed)


@router.post("/{avatar_id}/retry-lora", response_model=RetryLoraResponse)
async def retry_lora(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    profile = await _ensure_visual_profile(db, avatar)
    if profile.training_status != AvatarTrainingStatus.FAILED:
        raise HTTPException(status_code=400, detail="Retry is only available for failed training")

    profile.training_status = AvatarTrainingStatus.QUEUED
    profile.training_error_code = None
    avatar.build_state = AvatarBuildState.TRAINING_LORA
    await db.commit()

    await _start_lora_training(avatar.id)
    refreshed = await _fetch_avatar_with_relations(db, avatar.id)
    if not refreshed:
        raise HTTPException(status_code=500, detail="Failed to retry training")
    return RetryLoraResponse(avatar=_avatar_detail_response(refreshed))


@router.get("/{avatar_id}/events")
async def avatar_events(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_read_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    queue = event_broker.subscribe(avatar_id)

    async def stream() -> AsyncIterator[str]:
        try:
            while True:
                try:
                    message = await asyncio.wait_for(queue.get(), timeout=20)
                    yield message
                except asyncio.TimeoutError:
                    yield "event: keepalive\ndata: {}\n\n"
        finally:
            event_broker.unsubscribe(avatar_id, queue)

    return StreamingResponse(stream(), media_type="text/event-stream")


@router.get("/{avatar_id}/reference-slots", response_model=List[ReferenceSlotResponse])
async def get_reference_slots(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_read_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    result = await db.execute(
        select(ReferenceSlot)
        .where(ReferenceSlot.avatar_id == avatar.id)
        .order_by(ReferenceSlot.slot_key.asc())
    )
    return result.scalars().all()


@router.post("/{avatar_id}/attach-image", response_model=AttachmentResponse, status_code=201)
async def attach_image(
    avatar_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    file_ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "png"
    filename = f"attachment_{uuid.uuid4().hex[:8]}.{file_ext}"

    try:
        url = await media_service.upload_reference_image(
            file_content,
            avatar.id,
            filename,
            file.content_type,
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {error}")

    attachment = AvatarAttachment(
        avatar_id=avatar.id,
        filename=filename,
        url=url,
        file_type=file.content_type,
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)
    return attachment


@router.get("/{avatar_id}/attachments", response_model=List[AttachmentResponse])
async def get_attachments(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_read_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    result = await db.execute(
        select(AvatarAttachment)
        .where(AvatarAttachment.avatar_id == avatar.id)
        .order_by(AvatarAttachment.created_at.asc())
    )
    return result.scalars().all()


@router.delete("/{avatar_id}/attachments/{attachment_id}")
async def delete_attachment(
    avatar_id: int,
    attachment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await _fetch_avatar_with_relations(db, avatar_id)
    if not avatar or not _can_edit_avatar(avatar, current_user["id"]):
        raise HTTPException(status_code=404, detail="Avatar not found")

    result = await db.execute(
        select(AvatarAttachment).where(
            AvatarAttachment.id == attachment_id,
            AvatarAttachment.avatar_id == avatar.id,
        )
    )
    attachment = result.scalar_one_or_none()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    try:
        await media_service.delete_file(attachment.url)
    except Exception:
        pass

    await db.delete(attachment)
    await db.commit()

    return {"message": "Attachment deleted"}
