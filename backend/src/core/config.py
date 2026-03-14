from pydantic_settings import BaseSettings
from functools import lru_cache
import json
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "Creator Studio"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://user:password@localhost:5432/creators_factory"
    )

    # Auth - Must be set via environment variable
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ACCESS_COOKIE_NAME: str = "auth_token"
    REFRESH_COOKIE_NAME: str = "refresh_token"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: str | None = None

    # CORS - Load from environment
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        raw = self.BACKEND_CORS_ORIGINS.strip()
        if raw.startswith("["):
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(origin).strip() for origin in parsed if str(origin).strip()]
            except json.JSONDecodeError:
                pass
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    # External Services
    S3_ENDPOINT_URL: str | None = None
    S3_ACCESS_KEY: str | None = None
    S3_SECRET_KEY: str | None = None
    S3_BUCKET: str = "creators-factory"
    PUBLIC_MEDIA_BASE_URL: str = "http://localhost:9000/creators-factory"
    LOCAL_MEDIA_BASE_URL: str = "http://localhost:8000/media"
    LOCAL_MEDIA_ROOT: str = "./media"

    # fal.ai
    FAL_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Validate required fields
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY environment variable is required")


@lru_cache
def get_settings() -> Settings:
    return Settings()
