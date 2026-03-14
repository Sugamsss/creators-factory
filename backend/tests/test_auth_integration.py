import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from src.core.database import get_db
from src.main import app
from src.modules.users.models import User


@pytest.fixture
async def client():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    test_session_maker = async_sessionmaker(
        engine,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(User.__table__.create)

    async def override_get_db():
        async with test_session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

    app.dependency_overrides.clear()
    await engine.dispose()


async def signup_user(client: AsyncClient, email: str = "user@example.com"):
    return await client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Test User",
            "email": email,
            "password": "securepass123",
        },
    )


@pytest.mark.asyncio
async def test_signup_sets_cookies_and_me_succeeds(client: AsyncClient):
    signup_response = await signup_user(client)

    assert signup_response.status_code == 201
    assert signup_response.cookies.get("auth_token") is not None
    assert signup_response.cookies.get("refresh_token") is not None

    me_response = await client.get("/api/v1/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "user@example.com"


@pytest.mark.asyncio
async def test_login_sets_cookies_and_me_succeeds(client: AsyncClient):
    await signup_user(client)
    await client.post("/api/v1/auth/logout")

    login_response = await client.post(
        "/api/v1/auth/login",
        data={"username": "user@example.com", "password": "securepass123"},
    )

    assert login_response.status_code == 200
    assert login_response.cookies.get("auth_token") is not None
    assert login_response.cookies.get("refresh_token") is not None

    me_response = await client.get("/api/v1/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "user@example.com"


@pytest.mark.asyncio
async def test_invalid_login_returns_auth_error_code(client: AsyncClient):
    await signup_user(client)

    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "user@example.com", "password": "wrongpassword"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"
    assert response.json()["code"] == "AUTH_INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_refresh_with_valid_cookie_rotates_session_tokens(client: AsyncClient):
    await signup_user(client)

    old_access = client.cookies.get("auth_token")
    old_refresh = client.cookies.get("refresh_token")

    refresh_response = await client.post("/api/v1/auth/refresh")

    assert refresh_response.status_code == 200
    assert client.cookies.get("auth_token") is not None
    assert client.cookies.get("refresh_token") is not None
    assert client.cookies.get("auth_token") != old_access
    assert client.cookies.get("refresh_token") != old_refresh


@pytest.mark.asyncio
async def test_refresh_without_or_invalid_cookie_returns_401(client: AsyncClient):
    missing_response = await client.post("/api/v1/auth/refresh")
    assert missing_response.status_code == 401
    assert missing_response.json()["detail"] == "Refresh token missing"
    assert missing_response.json()["code"] == "AUTH_NOT_AUTHENTICATED"

    client.cookies.set("refresh_token", "invalid-token", domain="testserver", path="/")
    invalid_response = await client.post("/api/v1/auth/refresh")
    assert invalid_response.status_code == 401
    assert invalid_response.json()["code"] in {
        "AUTH_NOT_AUTHENTICATED",
        "AUTH_SESSION_EXPIRED",
    }


@pytest.mark.asyncio
async def test_logout_is_idempotent_and_clears_cookies(client: AsyncClient):
    await signup_user(client)

    first_logout = await client.post("/api/v1/auth/logout")
    assert first_logout.status_code == 200
    assert "auth_token=" in first_logout.headers.get("set-cookie", "")

    second_logout = await client.post("/api/v1/auth/logout")
    assert second_logout.status_code == 200


@pytest.mark.asyncio
async def test_protected_endpoint_without_access_cookie_returns_401(client: AsyncClient):
    response = await client.get("/api/v1/avatars")

    assert response.status_code == 401
    assert response.json()["detail"] == "Session token missing"
    assert response.json()["code"] == "AUTH_NOT_AUTHENTICATED"


@pytest.mark.asyncio
async def test_email_is_normalized_for_login_and_duplicate_signup_check(client: AsyncClient):
    signup_response = await signup_user(client, email="MixedCase@Example.com")
    assert signup_response.status_code == 201
    assert signup_response.json()["user"]["email"] == "mixedcase@example.com"

    duplicate_response = await signup_user(client, email="mixedcase@example.com")
    assert duplicate_response.status_code == 400
    assert duplicate_response.json()["detail"] == "Email already registered"

    await client.post("/api/v1/auth/logout")

    login_response = await client.post(
        "/api/v1/auth/login",
        data={"username": "MIXEDCASE@example.com", "password": "securepass123"},
    )
    assert login_response.status_code == 200


@pytest.mark.asyncio
async def test_signup_enforces_password_policy(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Test User",
            "email": "policy@example.com",
            "password": "short",
        },
    )

    assert response.status_code == 422
