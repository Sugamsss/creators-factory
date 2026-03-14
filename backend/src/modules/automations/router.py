from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from typing import List
from pydantic import BaseModel

from src.core.database import get_db
from src.core.security import get_current_user
from src.modules.automations.models import AutomationBinding, AutomationBindingStatus

router = APIRouter()


class AutomationBindingResponse(BaseModel):
    id: int
    avatar_id: int
    name: str
    schedule: str | None
    status: str
    videos_generated: int
    last_run: datetime | None

    class Config:
        from_attributes = True


class AutomationBindingCreate(BaseModel):
    avatar_id: int
    name: str
    schedule: str | None = None


@router.get("", response_model=List[AutomationBindingResponse])
async def list_automations(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AutomationBinding)
        .options(selectinload(AutomationBinding.avatar))
        .where(AutomationBinding.owner_id == current_user["id"])
    )
    bindings = result.scalars().all()
    return bindings


@router.get("/avatar/{avatar_id}", response_model=List[AutomationBindingResponse])
async def get_avatar_automations(
    avatar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AutomationBinding)
        .where(AutomationBinding.avatar_id == avatar_id)
        .where(AutomationBinding.owner_id == current_user["id"])
    )
    bindings = result.scalars().all()
    return bindings


@router.post(
    "", response_model=AutomationBindingResponse, status_code=status.HTTP_201_CREATED
)
async def create_automation(
    binding_data: AutomationBindingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    binding = AutomationBinding(
        **binding_data.model_dump(),
        owner_id=current_user["id"],
    )
    db.add(binding)
    await db.commit()
    await db.refresh(binding)
    return binding


@router.post("/{binding_id}/pause", response_model=AutomationBindingResponse)
async def pause_automation(
    binding_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AutomationBinding)
        .where(AutomationBinding.id == binding_id)
        .where(AutomationBinding.owner_id == current_user["id"])
    )
    binding = result.scalar_one_or_none()
    if not binding:
        raise HTTPException(status_code=404, detail="Automation not found")

    binding.status = AutomationBindingStatus.PAUSED  # type: ignore[assignment]
    await db.commit()
    await db.refresh(binding)
    return binding


@router.post("/{binding_id}/resume", response_model=AutomationBindingResponse)
async def resume_automation(
    binding_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AutomationBinding)
        .where(AutomationBinding.id == binding_id)
        .where(AutomationBinding.owner_id == current_user["id"])
    )
    binding = result.scalar_one_or_none()
    if not binding:
        raise HTTPException(status_code=404, detail="Automation not found")

    binding.status = AutomationBindingStatus.ACTIVE  # type: ignore[assignment]
    await db.commit()
    await db.refresh(binding)
    return binding


@router.delete("/{binding_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_automation(
    binding_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AutomationBinding)
        .where(AutomationBinding.id == binding_id)
        .where(AutomationBinding.owner_id == current_user["id"])
    )
    binding = result.scalar_one_or_none()
    if not binding:
        raise HTTPException(status_code=404, detail="Automation not found")

    await db.delete(binding)
    await db.commit()
    return None
