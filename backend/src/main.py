from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import get_settings
from src.core.database import init_db


settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="Create and manage your digital AI avatars",
    version="0.1.0",
    debug=settings.DEBUG,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    await init_db()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}


# Import and include routers
from src.modules.avatars.router import router as avatars_router
from src.modules.industries.router import router as industries_router

app.include_router(avatars_router, prefix="/api/v1/avatars", tags=["avatars"])
app.include_router(industries_router, prefix="/api/v1/industries", tags=["industries"])
