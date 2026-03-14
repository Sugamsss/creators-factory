from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from src.core.database import get_db
from src.modules.industries.models import Industry
from src.modules.avatars.schemas import IndustryResponse

router = APIRouter()


@router.get("", response_model=List[IndustryResponse])
async def list_industries(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Industry).order_by(Industry.name))
    industries = result.scalars().all()
    return industries
