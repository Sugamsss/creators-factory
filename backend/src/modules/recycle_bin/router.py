from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.security import get_current_user
from src.modules.avatars.models import Avatar, AvatarBuildState
from src.modules.avatars.router import _avatar_detail_response
from src.modules.avatars.schemas import RestoreResponse

router = APIRouter()

AVATAR_LIMIT = 10


@router.post("/{avatar_id}/restore", response_model=RestoreResponse)
async def restore_avatar(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar)
        .options(
            selectinload(Avatar.automation_bindings),
            selectinload(Avatar.visual_profile),
            selectinload(Avatar.field_locks),
            selectinload(Avatar.personality_snapshots),
        )
        .where(Avatar.id == avatar_id)
    )
    avatar = result.scalar_one_or_none()
    if not avatar or avatar.owner_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Avatar not found")

    if avatar.build_state != AvatarBuildState.SOFT_DELETED:
        raise HTTPException(status_code=400, detail="Avatar is not deleted")

    now = datetime.now(timezone.utc)
    hard_delete_at = avatar.hard_delete_at
    if hard_delete_at and hard_delete_at.tzinfo is None:
        hard_delete_at = hard_delete_at.replace(tzinfo=timezone.utc)

    if not avatar.deleted_at or (hard_delete_at and hard_delete_at < now):
        raise HTTPException(status_code=400, detail="Restore window has expired")

    if avatar.ownership_scope == "personal":
        personal_count_result = await db.execute(
            select(func.count(Avatar.id)).where(
                Avatar.owner_id == current_user["id"],
                Avatar.ownership_scope == "personal",
                Avatar.build_state != AvatarBuildState.SOFT_DELETED,
            )
        )
        personal_count = personal_count_result.scalar() or 0
        if personal_count >= AVATAR_LIMIT:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Restore blocked by plan limit. Remove another personal avatar or "
                    "upgrade plan before restoring."
                ),
            )

    avatar.build_state = AvatarBuildState.READY
    avatar.deleted_at = None
    avatar.hard_delete_at = None

    await db.commit()
    await db.refresh(avatar)

    refreshed_result = await db.execute(
        select(Avatar)
        .options(
            selectinload(Avatar.automation_bindings),
            selectinload(Avatar.visual_profile),
            selectinload(Avatar.field_locks),
            selectinload(Avatar.personality_snapshots),
        )
        .where(Avatar.id == avatar.id)
    )
    refreshed = refreshed_result.scalar_one()
    return RestoreResponse(avatar=_avatar_detail_response(refreshed))
