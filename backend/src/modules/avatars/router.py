from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, update
from sqlalchemy.orm import selectinload
from typing import List, Optional
import base64
import uuid
from datetime import datetime, timezone

from src.core.database import get_db
from src.core.security import get_current_user
from src.modules.avatars.models import (
    Avatar,
    AvatarBuildState,
    VisualVersion,
    ReferenceSlot,
    AvatarAttachment,
)
from src.modules.avatars.schemas import (
    AvatarResponse,
    AvatarCreate,
    AvatarUpdate,
    AvatarDraftResponse,
    AvatarDeploymentResponse,
    ExploreResponse,
    GenerateBaseRequest,
    EditBaseRequest,
    GenerateReferenceRequest,
    RefineVariantRequest,
    VisualVersionResponse,
    ReferenceSlotResponse,
    GenerationResponse,
    ReferenceGenerationResponse,
    BatchGenerationResponse,
    AttachmentResponse,
)
from src.services.ai.fal_service import FalService, FalServiceError
from src.services.ai.media_service import MediaStorageService
from src.services.ai.prompt_templates import PromptTemplateService

router = APIRouter()

DRAFT_STATES = [
    AvatarBuildState.DRAFT_VISUAL,
    AvatarBuildState.DRAFT_APPEARANCE,
    AvatarBuildState.TRAINING_LORA,
    AvatarBuildState.FAILED_TRAINING,
    AvatarBuildState.DRAFT_PERSONALITY,
]

AVATAR_LIMIT = 10


@router.get("", response_model=List[AvatarResponse])
async def list_avatars(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar).where(
            Avatar.owner_id == current_user["id"],
            Avatar.build_state != AvatarBuildState.SOFT_DELETED,
        )
    )
    avatars = result.scalars().all()
    return avatars


@router.get("/drafts", response_model=List[AvatarDraftResponse])
async def get_drafts(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar)
        .where(Avatar.owner_id == current_user["id"])
        .where(Avatar.build_state.in_(DRAFT_STATES))
        .order_by(Avatar.updated_at.desc())
    )
    avatars = result.scalars().all()
    return avatars


@router.get("/my", response_model=List[AvatarDeploymentResponse])
async def get_my_avatars(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar)
        .where(Avatar.owner_id == current_user["id"])
        .where(Avatar.build_state == AvatarBuildState.READY)
        .where(Avatar.ownership_scope == "personal")
        .order_by(Avatar.updated_at.desc())
    )
    avatars = result.scalars().all()
    return avatars


@router.get("/org", response_model=List[AvatarDeploymentResponse])
async def get_org_avatars(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # TODO: Add org membership check when org membership model is implemented
    # For now, any authenticated user can view org avatars
    # When org membership exists, filter by: Avatar.org_id.in_(user.member_org_ids)
    result = await db.execute(
        select(Avatar)
        .where(Avatar.ownership_scope == "org")
        .where(Avatar.build_state == AvatarBuildState.READY)
        .order_by(Avatar.updated_at.desc())
    )
    avatars = result.scalars().all()
    return avatars


@router.get("/explore", response_model=ExploreResponse)
async def get_explore_avatars(
    search: Optional[str] = Query(None, description="Search by name or description"),
    industry_id: Optional[int] = Query(None, description="Filter by industry"),
    sort: str = Query("newest", description="Sort: featured, popular, newest"),
    cursor: Optional[str] = Query(None, description="Cursor for pagination"),
    limit: int = Query(20, ge=1, le=50, description="Number of items to return"),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Avatar)
        .options(selectinload(Avatar.industry))
        .where(
            Avatar.build_state == AvatarBuildState.READY,
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

    if industry_id:
        query = query.where(Avatar.industry_id == industry_id)

    cursor_id = None
    if cursor:
        try:
            cursor_id = int(base64.b64decode(cursor).decode())
        except Exception:
            pass

    if cursor_id:
        if sort == "newest":
            query = query.where(
                Avatar.created_at
                < (
                    select(Avatar.created_at)
                    .where(Avatar.id == cursor_id)
                    .scalar_subquery()
                )
            )
        elif sort == "popular":
            query = query.where(
                Avatar.clone_count
                < (
                    select(Avatar.clone_count)
                    .where(Avatar.id == cursor_id)
                    .scalar_subquery()
                )
            )

    if sort == "popular":
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
        avatars=list(avatars), next_cursor=next_cursor, has_more=has_more
    )


@router.post("/{avatar_id}/toggle-public", response_model=AvatarResponse)
async def toggle_avatar_public(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar).where(
            Avatar.id == avatar_id, Avatar.owner_id == current_user["id"]
        )
    )
    avatar = result.scalar_one_or_none()

    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    if avatar.build_state != AvatarBuildState.READY:  # type: ignore[comparison-overlap]
        raise HTTPException(
            status_code=400, detail="Can only make ready avatars public"
        )

    if avatar.source_type == "clone":  # type: ignore[comparison-overlap]
        raise HTTPException(status_code=400, detail="Cannot make cloned avatars public")

    avatar.is_public = not avatar.is_public  # type: ignore[assignment]
    await db.commit()
    await db.refresh(avatar)
    return avatar


@router.post("/{avatar_id}/retry-training", response_model=AvatarResponse)
async def retry_avatar_training(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar).where(
            Avatar.id == avatar_id, Avatar.owner_id == current_user["id"]
        )
    )
    avatar = result.scalar_one_or_none()

    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    if avatar.build_state != AvatarBuildState.FAILED_TRAINING:  # type: ignore[comparison-overlap]
        raise HTTPException(status_code=400, detail="Can only retry failed training")

    avatar.build_state = AvatarBuildState.TRAINING_LORA  # type: ignore[assignment]
    await db.commit()
    await db.refresh(avatar)
    return avatar


@router.post("/clone/{source_avatar_id}", response_model=AvatarResponse)
async def clone_avatar(
    source_avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Avatar).where(Avatar.id == source_avatar_id))
    source_avatar = result.scalar_one_or_none()

    if not source_avatar:
        raise HTTPException(status_code=404, detail="Source avatar not found")

    if not source_avatar.is_public:
        raise HTTPException(status_code=400, detail="Cannot clone a private avatar")

    if source_avatar.build_state != AvatarBuildState.READY:
        raise HTTPException(status_code=400, detail="Can only clone ready avatars")

    clone = Avatar(
        owner_id=current_user["id"],
        ownership_scope="personal",
        source_type="clone",
        source_avatar_id=source_avatar_id,
        visual_profile_snapshot_id=source_avatar.visual_profile_snapshot_id,
        build_state=AvatarBuildState.DRAFT_PERSONALITY,
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

    await db.execute(
        update(Avatar)
        .where(Avatar.id == source_avatar_id)
        .values(clone_count=Avatar.clone_count + 1)
    )

    db.add(clone)
    await db.commit()
    await db.refresh(clone)
    return clone


@router.get("/{avatar_id}", response_model=AvatarResponse)
async def get_avatar(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar).where(
            Avatar.id == avatar_id,
            or_(Avatar.owner_id == current_user["id"], Avatar.is_public),
        )
    )
    avatar = result.scalar_one_or_none()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    return avatar


@router.post("", response_model=AvatarResponse, status_code=status.HTTP_201_CREATED)
async def create_avatar(
    avatar_data: AvatarCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Backward-compatible alias for draft creation.
    return await create_avatar_draft(avatar_data, db, current_user)


ALLOWED_UPDATE_FIELDS = {
    "name",
    "age",
    "description",
    "backstory",
    "communication_principles",
    "industry_id",
    "role_paragraph",
    "active_card_image_url",
}


@router.patch("/{avatar_id}", response_model=AvatarResponse)
async def update_avatar(
    avatar_id: int,
    avatar_data: AvatarUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar).where(
            Avatar.id == avatar_id, Avatar.owner_id == current_user["id"]
        )
    )
    avatar = result.scalar_one_or_none()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    update_data = avatar_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in ALLOWED_UPDATE_FIELDS:
            setattr(avatar, field, value)

    await db.commit()
    await db.refresh(avatar)
    return avatar


@router.delete("/{avatar_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_avatar(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar).where(
            Avatar.id == avatar_id, Avatar.owner_id == current_user["id"]
        )
    )
    avatar = result.scalar_one_or_none()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    avatar.build_state = AvatarBuildState.SOFT_DELETED
    avatar.deleted_at = datetime.now(timezone.utc)
    avatar.is_public = False
    await db.commit()
    return None


@router.post("/{avatar_id}/remove-org", response_model=AvatarResponse)
async def remove_avatar_from_org(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar).where(Avatar.id == avatar_id, Avatar.ownership_scope == "org")
    )
    avatar = result.scalar_one_or_none()
    if not avatar:
        raise HTTPException(status_code=404, detail="Organization avatar not found")

    avatar.ownership_scope = "personal"
    avatar.org_id = None
    await db.commit()
    await db.refresh(avatar)
    return avatar


fal_service = FalService()
media_service = MediaStorageService()


async def verify_avatar_ownership(
    db: AsyncSession, avatar_id: int, user_id: str
) -> Avatar:
    result = await db.execute(
        select(Avatar).where(Avatar.id == avatar_id).where(Avatar.owner_id == user_id)
    )
    avatar = result.scalar_one_or_none()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    return avatar


async def set_visual_version_as_active_base(
    db: AsyncSession,
    avatar: Avatar,
    version: VisualVersion,
) -> None:
    await db.execute(
        update(VisualVersion)
        .where(VisualVersion.avatar_id == avatar.id)
        .values(is_active_base=False)
    )
    version.is_active_base = True
    avatar.active_card_image_url = version.image_url
    if avatar.build_state == AvatarBuildState.DRAFT_VISUAL:
        avatar.build_state = AvatarBuildState.DRAFT_APPEARANCE


async def create_avatar_draft(
    avatar_data: AvatarCreate,
    db: AsyncSession,
    current_user: dict,
) -> Avatar:
    count_result = await db.execute(
        select(func.count(Avatar.id)).where(Avatar.owner_id == current_user["id"])
    )
    avatar_count = count_result.scalar() or 0

    if avatar_count >= AVATAR_LIMIT:
        raise HTTPException(
            status_code=400,
            detail=f"Avatar limit reached. Maximum {AVATAR_LIMIT} avatars allowed.",
        )

    avatar = Avatar(
        **avatar_data.model_dump(),
        owner_id=current_user["id"],
    )
    db.add(avatar)
    await db.commit()
    await db.refresh(avatar)
    return avatar


@router.post("/drafts", response_model=AvatarResponse, status_code=status.HTTP_201_CREATED)
async def create_avatar_draft_endpoint(
    avatar_data: AvatarCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await create_avatar_draft(avatar_data, db, current_user)


@router.post(
    "/{avatar_id}/generate-base",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=GenerationResponse,
)
async def generate_base_image(
    avatar_id: int,
    request: GenerateBaseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await verify_avatar_ownership(db, avatar_id, current_user["id"])

    version_result = await db.execute(
        select(func.max(VisualVersion.version_number)).where(
            VisualVersion.avatar_id == avatar_id
        )
    )
    next_version = (version_result.scalar() or 0) + 1

    try:
        enhanced_prompt = PromptTemplateService.get_step1_new_generation_prompt(
            request.prompt, request.age
        )
        result = await fal_service.submit_and_wait(
            model=request.model,
            prompt=enhanced_prompt,
            aspect_ratio=request.aspect_ratio,
            is_edit=False,
        )
    except FalServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))

    fal_url = result["images"][0]["url"]
    filename = f"base_v{next_version}_{uuid.uuid4().hex[:8]}.png"
    s3_url = await media_service.download_and_store(
        fal_url, avatar_id, "visual", filename
    )

    quality = (
        "medium"
        if request.model in ["openai_image_1_5", "google_nano_banana_2"]
        else "auto_3K"
    )

    visual_version = VisualVersion(
        avatar_id=avatar_id,
        version_number=next_version,
        image_url=s3_url,
        fal_request_id=result.get("request_id"),
        prompt=request.prompt,
        enhanced_prompt=enhanced_prompt,
        model_used=request.model,
        aspect_ratio=request.aspect_ratio,
        quality=quality,
        is_edit=False,
        edit_source_url=fal_url,
        is_active_base=True,
    )
    db.add(visual_version)
    await set_visual_version_as_active_base(db, avatar, visual_version)
    await db.commit()
    await db.refresh(visual_version)

    return GenerationResponse(
        version_id=visual_version.id,
        version_number=visual_version.version_number,
        image_url=s3_url,
        prompt=request.prompt,
        model=request.model,
        aspect_ratio=request.aspect_ratio,
    )


@router.post(
    "/{avatar_id}/edit-base",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=GenerationResponse,
)
async def edit_base_image(
    avatar_id: int,
    request: EditBaseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await verify_avatar_ownership(db, avatar_id, current_user["id"])

    version_result = await db.execute(
        select(func.max(VisualVersion.version_number)).where(
            VisualVersion.avatar_id == avatar_id
        )
    )
    next_version = (version_result.scalar() or 0) + 1

    if request.mask_image_url and request.model != "openai_image_1_5":
        raise HTTPException(
            status_code=400,
            detail="Mask-based editing is only supported for openai_image_1_5 model",
        )

    image_urls = [request.reference_image_url] if request.reference_image_url else []
    mask_url = request.mask_image_url if request.model == "openai_image_1_5" else None

    try:
        enhanced_prompt = PromptTemplateService.get_step1_edit_prompt(
            request.prompt, request.age
        )
        result = await fal_service.submit_and_wait(
            model=request.model,
            prompt=enhanced_prompt,
            aspect_ratio=request.aspect_ratio or "auto",
            is_edit=True,
            image_urls=image_urls if image_urls else None,
            mask_image_url=mask_url,
        )
    except FalServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))

    fal_url = result["images"][0]["url"]
    filename = f"edit_v{next_version}_{uuid.uuid4().hex[:8]}.png"
    s3_url = await media_service.download_and_store(
        fal_url, avatar_id, "visual", filename
    )

    quality = (
        "medium"
        if request.model in ["openai_image_1_5", "google_nano_banana_2"]
        else "auto_3K"
    )

    visual_version = VisualVersion(
        avatar_id=avatar_id,
        version_number=next_version,
        image_url=s3_url,
        fal_request_id=result.get("request_id"),
        prompt=request.prompt,
        enhanced_prompt=enhanced_prompt,
        model_used=request.model,
        aspect_ratio=request.aspect_ratio or "auto",
        quality=quality,
        is_edit=True,
        edit_source_url=fal_url,
        mask_image_url=mask_url,
        is_active_base=True,
    )
    db.add(visual_version)
    await set_visual_version_as_active_base(db, avatar, visual_version)
    await db.commit()
    await db.refresh(visual_version)

    return GenerationResponse(
        version_id=visual_version.id,
        version_number=visual_version.version_number,
        image_url=s3_url,
        prompt=request.prompt,
        model=request.model,
        aspect_ratio=request.aspect_ratio or "auto",
    )


@router.post("/{avatar_id}/set-active-base/{version_id}")
async def set_active_base(
    avatar_id: int,
    version_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await verify_avatar_ownership(db, avatar_id, current_user["id"])

    version_result = await db.execute(
        select(VisualVersion)
        .where(VisualVersion.id == version_id)
        .where(VisualVersion.avatar_id == avatar_id)
    )
    version = version_result.scalar_one_or_none()

    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    await set_visual_version_as_active_base(db, avatar, version)

    await db.commit()
    await db.refresh(version)
    await db.refresh(avatar)

    return {
        "message": "Base image set as active",
        "build_state": avatar.build_state,
        "active_card_image_url": avatar.active_card_image_url,
    }


@router.get("/{avatar_id}/visual-versions", response_model=List[VisualVersionResponse])
async def get_visual_versions(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    await verify_avatar_ownership(db, avatar_id, current_user["id"])

    result = await db.execute(
        select(VisualVersion)
        .where(VisualVersion.avatar_id == avatar_id)
        .order_by(VisualVersion.version_number.desc())
    )
    versions = result.scalars().all()
    return versions


@router.post(
    "/{avatar_id}/generate-reference",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=ReferenceGenerationResponse,
)
async def generate_reference_variant(
    avatar_id: int,
    request: GenerateReferenceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    await verify_avatar_ownership(db, avatar_id, current_user["id"])

    base_version_result = await db.execute(
        select(VisualVersion)
        .where(VisualVersion.avatar_id == avatar_id)
        .where(VisualVersion.is_active_base)
        .order_by(VisualVersion.version_number.desc())
        .limit(1)
    )
    base_version = base_version_result.scalar_one_or_none()

    if not base_version:
        raise HTTPException(status_code=400, detail="No active base image selected")

    source_image_url = base_version.edit_source_url or base_version.image_url

    try:
        result = await fal_service.submit_and_wait(
            model="seedream_v5",
            prompt=request.prompt,
            aspect_ratio=base_version.aspect_ratio,
            is_edit=True,
            image_urls=[source_image_url],
        )
    except FalServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))

    fal_url = result["images"][0]["url"]
    filename = f"ref_{request.slot_key}_{uuid.uuid4().hex[:8]}.png"
    s3_url = await media_service.download_and_store(
        fal_url, avatar_id, "reference", filename
    )

    existing_slot_result = await db.execute(
        select(ReferenceSlot)
        .where(ReferenceSlot.avatar_id == avatar_id)
        .where(ReferenceSlot.slot_key == request.slot_key)
    )
    existing_slot = existing_slot_result.scalar_one_or_none()

    if existing_slot:
        existing_slot.image_url = s3_url
        existing_slot.prompt = request.prompt
        existing_slot.is_refined = True
        existing_slot.refinement_count += 1
        slot = existing_slot
    else:
        slot = ReferenceSlot(
            avatar_id=avatar_id,
            slot_key=request.slot_key,
            slot_label=request.slot_key.replace("_", " ").title(),
            image_url=s3_url,
            prompt=request.prompt,
            aspect_ratio=base_version.aspect_ratio,
            is_refined=False,
            refinement_count=0,
        )
        db.add(slot)

    await db.commit()
    await db.refresh(slot)

    return ReferenceGenerationResponse(
        slot_id=slot.id, slot_key=slot.slot_key, image_url=s3_url, prompt=request.prompt
    )


@router.post(
    "/{avatar_id}/generate-all-references",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=BatchGenerationResponse,
)
async def generate_all_reference_variants(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = await verify_avatar_ownership(db, avatar_id, current_user["id"])

    base_version_result = await db.execute(
        select(VisualVersion)
        .where(VisualVersion.avatar_id == avatar_id)
        .where(VisualVersion.is_active_base)
        .order_by(VisualVersion.version_number.desc())
        .limit(1)
    )
    base_version = base_version_result.scalar_one_or_none()

    if not base_version:
        raise HTTPException(status_code=400, detail="No active base image selected")

    source_image_url = base_version.edit_source_url or base_version.image_url

    reference_slots = PromptTemplateService.get_step2_reference_slots()
    generated_variants = []

    for slot_def in reference_slots:
        if slot_def.get("include_base"):
            continue

        slot_key = slot_def["slot_key"]
        base_prompt = slot_def.get("prompt", "")

        prompt = f"Turn the person in the image to: {base_prompt}"

        try:
            result = await fal_service.submit_and_wait(
                model="seedream_v5",
                prompt=prompt,
                aspect_ratio=base_version.aspect_ratio,
                is_edit=True,
                image_urls=[source_image_url],
            )
        except FalServiceError as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to generate {slot_key}: {str(e)}"
            )

        fal_url = result["images"][0]["url"]
        filename = f"ref_{slot_key}_{uuid.uuid4().hex[:8]}.png"
        s3_url = await media_service.download_and_store(
            fal_url, avatar_id, "reference", filename
        )

        slot = ReferenceSlot(
            avatar_id=avatar_id,
            slot_key=slot_key,
            slot_label=slot_def["label"],
            image_url=s3_url,
            prompt=prompt,
            aspect_ratio=base_version.aspect_ratio,
        )
        db.add(slot)
        generated_variants.append(slot)

    await db.commit()

    for slot in generated_variants:
        await db.refresh(slot)

    if avatar.build_state == AvatarBuildState.DRAFT_APPEARANCE:
        avatar.build_state = AvatarBuildState.TRAINING_LORA
        await db.commit()
        await db.refresh(avatar)

    return BatchGenerationResponse(
        count=len(generated_variants),
        variants=[
            ReferenceGenerationResponse(
                slot_id=v.id,
                slot_key=v.slot_key,
                image_url=v.image_url,
                prompt=v.prompt,
            )
            for v in generated_variants
        ],
    )


@router.post(
    "/{avatar_id}/refine-variant",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=ReferenceGenerationResponse,
)
async def refine_variant(
    avatar_id: int,
    request: RefineVariantRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    await verify_avatar_ownership(db, avatar_id, current_user["id"])

    slot_result = await db.execute(
        select(ReferenceSlot)
        .where(ReferenceSlot.id == request.variant_id)
        .where(ReferenceSlot.avatar_id == avatar_id)
    )
    slot = slot_result.scalar_one_or_none()

    if not slot:
        raise HTTPException(status_code=404, detail="Variant not found")

    try:
        result = await fal_service.submit_and_wait(
            model="seedream_v5",
            prompt=request.prompt,
            aspect_ratio=slot.aspect_ratio or "auto",
            is_edit=True,
            image_urls=[slot.image_url],
        )
    except FalServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))

    fal_url = result["images"][0]["url"]
    filename = (
        f"ref_{slot.slot_key}_r{slot.refinement_count + 1}_{uuid.uuid4().hex[:8]}.png"
    )
    s3_url = await media_service.download_and_store(
        fal_url, avatar_id, "reference", filename
    )

    slot.image_url = s3_url
    slot.prompt = request.prompt
    slot.is_refined = True
    slot.refinement_count += 1

    await db.commit()
    await db.refresh(slot)

    return ReferenceGenerationResponse(
        slot_id=slot.id, slot_key=slot.slot_key, image_url=s3_url, prompt=request.prompt
    )


@router.get("/{avatar_id}/reference-slots", response_model=List[ReferenceSlotResponse])
async def get_reference_slots(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    await verify_avatar_ownership(db, avatar_id, current_user["id"])

    result = await db.execute(
        select(ReferenceSlot)
        .where(ReferenceSlot.avatar_id == avatar_id)
        .order_by(ReferenceSlot.slot_key)
    )
    slots = result.scalars().all()
    return slots


@router.post(
    "/{avatar_id}/attach-image",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def attach_image(
    avatar_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    await verify_avatar_ownership(db, avatar_id, current_user["id"])

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    MAX_FILE_SIZE = 10 * 1024 * 1024
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    file_ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"attachment_{uuid.uuid4().hex[:8]}.{file_ext}"

    try:
        s3_url = await media_service.upload_reference_image(
            file_content, avatar_id, filename, file.content_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

    attachment = AvatarAttachment(
        avatar_id=avatar_id,
        filename=filename,
        url=s3_url,
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
    await verify_avatar_ownership(db, avatar_id, current_user["id"])

    result = await db.execute(
        select(AvatarAttachment)
        .where(AvatarAttachment.avatar_id == avatar_id)
        .order_by(AvatarAttachment.created_at.desc())
    )
    attachments = result.scalars().all()
    return attachments


@router.delete("/{avatar_id}/attachments/{attachment_id}")
async def delete_attachment(
    avatar_id: int,
    attachment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    await verify_avatar_ownership(db, avatar_id, current_user["id"])

    result = await db.execute(
        select(AvatarAttachment)
        .where(AvatarAttachment.id == attachment_id)
        .where(AvatarAttachment.avatar_id == avatar_id)
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

    return {"message": "Attachment deleted successfully"}
