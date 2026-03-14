from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database import get_db

router = APIRouter()


@router.get("")
async def list_industries(db: AsyncSession = Depends(get_db)):
    # Placeholder - will implement with proper model
    return [
        {
            "id": 1,
            "name": "Education",
            "description": "Phonics, language learning, STEM",
        },
        {"id": 2, "name": "Finance", "description": "Personal finance, investing"},
        {"id": 3, "name": "Health & Wellness", "description": "Fitness, nutrition"},
        {"id": 4, "name": "Technology", "description": "Software, coding tutorials"},
        {"id": 5, "name": "Lifestyle", "description": "Fashion, home decor, travel"},
        {"id": 6, "name": "Business", "description": "Entrepreneurship, leadership"},
    ]
