from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from src.core.database import get_db
from src.core.security import get_current_user
from src.modules.avatars.models import Avatar
from src.modules.avatars.schemas import AvatarResponse, AvatarCreate, AvatarUpdate

router = APIRouter()


@router.get("", response_model=List[AvatarResponse])
async def list_avatars(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Avatar).where(Avatar.owner_id == current_user["id"])
    )
    avatars = result.scalars().all()
    return avatars


@router.get("/{avatar_id}", response_model=AvatarResponse)
async def get_avatar(
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
    return avatar


@router.post("", response_model=AvatarResponse, status_code=status.HTTP_201_CREATED)
async def create_avatar(
    avatar_data: AvatarCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    avatar = Avatar(
        **avatar_data.model_dump(),
        owner_id=current_user["id"],
    )
    db.add(avatar)
    await db.commit()
    await db.refresh(avatar)
    return avatar


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

    await db.delete(avatar)
    await db.commit()
    return None
