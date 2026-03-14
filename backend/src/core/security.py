from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, ExpiredSignatureError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import (
    AUTH_ACCESS_COOKIE_NAME,
    AUTH_REFRESH_COOKIE_NAME,
    get_settings,
)
from src.core.database import get_db
from src.modules.users.models import User

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS"
AUTH_SESSION_EXPIRED = "AUTH_SESSION_EXPIRED"
AUTH_NOT_AUTHENTICATED = "AUTH_NOT_AUTHENTICATED"


class AuthHTTPException(HTTPException):
    def __init__(self, detail: str, code: str):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)
        self.code = code


def unauthorized(
    detail: str = "Authentication required",
    code: str = AUTH_NOT_AUTHENTICATED,
) -> AuthHTTPException:
    return AuthHTTPException(detail=detail, code=code)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access", "jti": str(uuid4())})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire, "type": "refresh", "jti": str(uuid4())})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str, expected_type: str = "access") -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except ExpiredSignatureError as exc:
        raise unauthorized("Session token expired", code=AUTH_SESSION_EXPIRED) from exc
    except JWTError as exc:
        raise unauthorized("Session token invalid", code=AUTH_SESSION_EXPIRED) from exc

    token_type = payload.get("type", "access")
    if token_type != expected_type:
        raise unauthorized("Session token type invalid", code=AUTH_SESSION_EXPIRED)
    return payload


def get_access_token_from_request(request: Request) -> str:
    token = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)
    if not token:
        raise unauthorized("Session token missing")
    return token


def get_refresh_token_from_request(request: Request) -> str:
    token = request.cookies.get(AUTH_REFRESH_COOKIE_NAME)
    if not token:
        raise unauthorized("Refresh token missing")
    return token


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    token = get_access_token_from_request(request)
    payload = decode_token(token, expected_type="access")

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise unauthorized("Session token invalid", code=AUTH_SESSION_EXPIRED)

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise unauthorized("Session user not found", code=AUTH_SESSION_EXPIRED)

    return {"id": user.id, "email": user.email, "name": user.name}
