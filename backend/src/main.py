from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from src.core.config import get_settings
from src.core.database import init_db, AsyncSessionLocal
from src.modules.auth.router import router as auth_router
from src.modules.avatars.router import router as avatars_router
from src.modules.industries.router import router as industries_router
from src.modules.automations.router import router as automations_router
from src.modules.industries.models import Industry
from src.modules.users.models import User
from src.modules.organizations.models import Organization
from src.modules.avatars.models import (
    Avatar,
    VisualVersion,
    ReferenceSlot,
    AvatarAttachment,
)
from src.modules.automations.models import AutomationBinding

# Silence unused import warnings for models used for Base registration
_ = [
    User,
    Organization,
    Avatar,
    VisualVersion,
    ReferenceSlot,
    AvatarAttachment,
    AutomationBinding,
    Industry,
]

settings = get_settings()
Path(settings.LOCAL_MEDIA_ROOT).mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_industries()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Create and manage your digital AI avatars",
    version="0.1.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/media", StaticFiles(directory=settings.LOCAL_MEDIA_ROOT), name="media")


async def seed_industries():
    industries_data = [
        {"name": "Education", "description": "Phonics, language learning, STEM"},
        {"name": "Finance", "description": "Personal finance, investing"},
        {"name": "Health & Wellness", "description": "Fitness, nutrition"},
        {"name": "Technology", "description": "Software, coding tutorials"},
        {"name": "Lifestyle", "description": "Fashion, home decor, travel"},
        {"name": "Business", "description": "Entrepreneurship, leadership"},
        {"name": "Marketing", "description": "Advertising, branding, content"},
        {"name": "Customer Support", "description": "Help desks, FAQ, chatbots"},
    ]

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Industry))
        existing = result.scalars().all()

        if not existing:
            for ind_data in industries_data:
                industry = Industry(**ind_data)
                session.add(industry)
            await session.commit()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}


app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(avatars_router, prefix="/api/v1/avatars", tags=["avatars"])
app.include_router(industries_router, prefix="/api/v1/industries", tags=["industries"])
app.include_router(
    automations_router, prefix="/api/v1/automations", tags=["automations"]
)
