import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import (
    AUTH_ACCESS_COOKIE_NAME,
    AUTH_REFRESH_COOKIE_NAME,
    get_settings,
)
from src.core.database import get_db
from src.core.security import (
    AUTH_INVALID_CREDENTIALS,
    AUTH_SESSION_EXPIRED,
    AuthHTTPException,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    get_password_hash,
    get_refresh_token_from_request,
    unauthorized,
    verify_password,
)
from src.modules.users.models import User

settings = get_settings()
router = APIRouter()
logger = logging.getLogger(__name__)

MIN_PASSWORD_LENGTH = 8


def normalize_email(raw_email: str) -> str:
    return raw_email.strip().lower()


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Name is required")
        return normalized

    @field_validator("email")
    @classmethod
    def normalize_user_email(cls, value: EmailStr) -> str:
        return normalize_email(str(value))

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < MIN_PASSWORD_LENGTH:
            raise ValueError(
                f"Password must be at least {MIN_PASSWORD_LENGTH} characters long"
            )
        return value


class UserResponse(BaseModel):
    id: str
    email: str
    name: str

    class Config:
        from_attributes = True


class AuthSessionResponse(BaseModel):
    user: UserResponse


def _set_auth_cookies(response: JSONResponse, user: User) -> None:
    access_token = create_access_token(data={"sub": str(user.id), "email": str(user.email)})
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "email": str(user.email)}
    )

    cookie_args = {
        "httponly": True,
        "secure": settings.COOKIE_SECURE,
        "samesite": settings.COOKIE_SAMESITE,
        "path": "/",
    }
    if settings.COOKIE_DOMAIN:
        cookie_args["domain"] = settings.COOKIE_DOMAIN

    response.set_cookie(
        key=AUTH_ACCESS_COOKIE_NAME,
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **cookie_args,
    )
    response.set_cookie(
        key=AUTH_REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        **cookie_args,
    )


def _clear_auth_cookies(response: JSONResponse) -> None:
    cookie_args = {"path": "/"}
    if settings.COOKIE_DOMAIN:
        cookie_args["domain"] = settings.COOKIE_DOMAIN
    response.delete_cookie(key=AUTH_ACCESS_COOKIE_NAME, **cookie_args)
    response.delete_cookie(key=AUTH_REFRESH_COOKIE_NAME, **cookie_args)


@router.post(
    "/signup", response_model=AuthSessionResponse, status_code=status.HTTP_201_CREATED
)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    normalized_email = normalize_email(str(user_data.email))
    result = await db.execute(
        select(User).where(func.lower(User.email) == normalized_email)
    )
    existing_user = result.scalar_one_or_none()
    if existing_user:
        logger.info(
            "auth.signup.failed email=%s reason=email_already_registered",
            normalized_email,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    user = User(
        email=normalized_email,
        hashed_password=get_password_hash(user_data.password),
        name=user_data.name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    response = JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "user": {
                "id": str(user.id),
                "email": str(user.email),
                "name": str(user.name),
            }
        },
    )
    _set_auth_cookies(response, user)
    return response


@router.post("/login", response_model=AuthSessionResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    normalized_email = normalize_email(form_data.username)
    result = await db.execute(
        select(User).where(func.lower(User.email) == normalized_email)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, str(user.hashed_password)):  # type: ignore[arg-type]
        logger.info(
            "auth.login.failed email=%s reason=invalid_credentials", normalized_email
        )
        raise unauthorized("Incorrect email or password", code=AUTH_INVALID_CREDENTIALS)

    response = JSONResponse(
        content={
            "user": {
                "id": str(user.id),
                "email": str(user.email),
                "name": str(user.name),
            }
        }
    )
    _set_auth_cookies(response, user)
    return response


@router.post("/refresh", response_model=AuthSessionResponse)
async def refresh_session(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        refresh_token = get_refresh_token_from_request(request)
        payload = decode_token(refresh_token, expected_type="refresh")
    except AuthHTTPException as exc:
        logger.info(
            "auth.refresh.failed code=%s detail=%s has_refresh_cookie=%s",
            exc.code,
            exc.detail,
            bool(request.cookies.get(AUTH_REFRESH_COOKIE_NAME)),
        )
        raise
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise unauthorized("Refresh session invalid", code=AUTH_SESSION_EXPIRED)

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise unauthorized("Refresh session user not found", code=AUTH_SESSION_EXPIRED)

    response = JSONResponse(
        content={
            "user": {
                "id": str(user.id),
                "email": str(user.email),
                "name": str(user.name),
            }
        }
    )
    _set_auth_cookies(response, user)
    return response


@router.post("/logout")
async def logout(request: Request):
    logger.info(
        "auth.logout has_access_cookie=%s has_refresh_cookie=%s",
        bool(request.cookies.get(AUTH_ACCESS_COOKIE_NAME)),
        bool(request.cookies.get(AUTH_REFRESH_COOKIE_NAME)),
    )
    response = JSONResponse(content={"message": "Logged out"})
    _clear_auth_cookies(response)
    return response


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
):
    return UserResponse(
        id=current_user["id"], email=current_user["email"], name=current_user["name"]
    )
