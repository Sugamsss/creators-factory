from datetime import datetime, timedelta, timezone

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from src.core.database import Base, get_db
from src.main import app
from src.modules.automations.models import AutomationBinding, AutomationBindingStatus
from src.modules.avatars.models import (
    Avatar,
    AvatarBuildState,
    ReferenceSlot,
    AvatarTrainingStatus,
    AvatarVisualProfile,
    VisualVersion,
)


@pytest.fixture
async def client_and_sessionmaker():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    test_session_maker = async_sessionmaker(
        engine,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

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
        yield ac, test_session_maker

    app.dependency_overrides.clear()
    await engine.dispose()


async def signup(client: AsyncClient, email: str = "avatar-test@example.com"):
    response = await client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Avatar Tester",
            "email": email,
            "password": "securepass123",
        },
    )
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_create_draft_and_hub_sections(client_and_sessionmaker):
    client, _ = client_and_sessionmaker
    await signup(client)

    draft_response = await client.post(
        "/api/v1/avatars/drafts",
        json={"ownership_scope": "personal"},
    )
    assert draft_response.status_code == 201
    assert draft_response.json()["build_state"] == "draft_visual"

    hub_response = await client.get("/api/v1/avatars")
    assert hub_response.status_code == 200
    payload = hub_response.json()
    assert "continue_creation" in payload
    assert "my_avatars" in payload
    assert "org_avatars" in payload
    assert len(payload["continue_creation"]) == 1

    alias_response = await client.post(
        "/api/v1/avatars",
        json={"ownership_scope": "personal"},
    )
    assert alias_response.status_code == 201


@pytest.mark.asyncio
async def test_toggle_visibility_and_clone_flow(client_and_sessionmaker):
    client, session_maker = client_and_sessionmaker
    await signup(client, email="clone-owner@example.com")

    draft_response = await client.post("/api/v1/avatars/drafts", json={"ownership_scope": "personal"})
    avatar_id = draft_response.json()["id"]

    ineligible_toggle = await client.post(
        f"/api/v1/avatars/{avatar_id}/toggle-visibility",
        json={"is_public": True, "field_locks": []},
    )
    assert ineligible_toggle.status_code == 400

    async with session_maker() as session:
        avatar = await session.get(Avatar, avatar_id)
        assert avatar is not None
        avatar.build_state = AvatarBuildState.READY
        avatar.name = "Public Avatar"
        avatar.age = 30
        avatar.description = "A complete and public-ready avatar profile."
        avatar.backstory = "x" * 120
        avatar.communication_principles = '["Be concise and clear"]'
        avatar.industry_id = 1
        avatar.role_paragraph = "Education Coach"
        profile_result = await session.execute(
            select(AvatarVisualProfile).where(AvatarVisualProfile.avatar_id == avatar_id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile is None:
            profile = AvatarVisualProfile(avatar_id=avatar_id)
            session.add(profile)
        profile.training_status = AvatarTrainingStatus.COMPLETED
        profile.training_attempt_count = 1
        await session.commit()

    eligible_toggle = await client.post(
        f"/api/v1/avatars/{avatar_id}/toggle-visibility",
        json={"is_public": True, "field_locks": []},
    )
    assert eligible_toggle.status_code == 200
    assert eligible_toggle.json()["avatar"]["is_public"] is True

    clone_response = await client.post(f"/api/v1/avatars/{avatar_id}/clone")
    assert clone_response.status_code == 200
    clone_payload = clone_response.json()["avatar"]
    assert clone_payload["source_type"] == "clone"
    assert clone_payload["build_state"] == "ready"


@pytest.mark.asyncio
async def test_deploy_pause_delete_restore_flow(client_and_sessionmaker):
    client, session_maker = client_and_sessionmaker
    await signup(client, email="deploy-owner@example.com")

    draft_response = await client.post("/api/v1/avatars/drafts", json={"ownership_scope": "personal"})
    avatar_id = draft_response.json()["id"]

    async with session_maker() as session:
        avatar = await session.get(Avatar, avatar_id)
        assert avatar is not None
        avatar.build_state = AvatarBuildState.READY
        avatar.name = "Deployable"
        avatar.description = "A complete and ready avatar profile for deployment."
        avatar.backstory = "y" * 120
        avatar.communication_principles = '["Always factual"]'
        avatar.industry_id = 1
        avatar.role_paragraph = "Analyst"

        other_avatar = Avatar(
            owner_id=avatar.owner_id,
            ownership_scope="personal",
            source_type="original",
            build_state=AvatarBuildState.READY,
            name="Other",
            description="Another ready avatar profile in the same account.",
            backstory="z" * 120,
            communication_principles='["Clear"]',
            industry_id=1,
            role_paragraph="Assistant",
        )
        session.add(other_avatar)
        await session.flush()

        binding = AutomationBinding(
            avatar_id=other_avatar.id,
            owner_id=avatar.owner_id,
            name="Daily Batch",
            schedule="0 9 * * *",
            status=AutomationBindingStatus.ACTIVE,
        )
        session.add(binding)
        await session.commit()
        binding_id = binding.id

    deploy_conflict = await client.post(
        f"/api/v1/avatars/{avatar_id}/deploy",
        json={"automation_ids": [binding_id], "confirm_replace": False},
    )
    assert deploy_conflict.status_code == 409

    deploy_replace = await client.post(
        f"/api/v1/avatars/{avatar_id}/deploy",
        json={"automation_ids": [binding_id], "confirm_replace": True},
    )
    assert deploy_replace.status_code == 200
    assert deploy_replace.json()["deployment_summary"] == "in_use"

    pause = await client.post(
        f"/api/v1/avatars/{avatar_id}/pause",
        json={"automation_ids": [binding_id]},
    )
    assert pause.status_code == 200
    assert pause.json()["deployment_summary"] == "fully_paused"

    delete_response = await client.delete(f"/api/v1/avatars/{avatar_id}")
    assert delete_response.status_code == 204

    async with session_maker() as session:
        avatar = await session.get(Avatar, avatar_id)
        assert avatar is not None
        avatar.hard_delete_at = datetime.now(timezone.utc) + timedelta(days=5)
        await session.commit()

    restore_response = await client.post(f"/api/v1/recycle-bin/{avatar_id}/restore")
    assert restore_response.status_code == 200
    assert restore_response.json()["avatar"]["build_state"] == "ready"
    assert restore_response.json()["avatar"]["deployment_summary"] == "not_in_use"


@pytest.mark.asyncio
async def test_step1_generate_base_requires_age(client_and_sessionmaker):
    client, _ = client_and_sessionmaker
    await signup(client, email="step1-age@example.com")

    draft_response = await client.post("/api/v1/avatars/drafts", json={"ownership_scope": "personal"})
    avatar_id = draft_response.json()["id"]

    response = await client.post(
        f"/api/v1/avatars/{avatar_id}/generate-base",
        json={
            "prompt": "Portrait with warm studio lighting and clean background",
            "model": "seedream_v5",
            "aspect_ratio": "16:9",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_step1_edit_rejects_mask_for_non_openai(client_and_sessionmaker):
    client, session_maker = client_and_sessionmaker
    await signup(client, email="step1-mask@example.com")

    draft_response = await client.post("/api/v1/avatars/drafts", json={"ownership_scope": "personal"})
    avatar_id = draft_response.json()["id"]

    async with session_maker() as session:
        version = VisualVersion(
            avatar_id=avatar_id,
            version_number=1,
            image_url="https://example.com/v1.png",
            fal_request_id="req-1",
            prompt="initial prompt",
            enhanced_prompt="enhanced initial prompt",
            model_used="seedream_v5",
            aspect_ratio="16:9",
            quality="auto_3K",
            is_edit=False,
            edit_source_url="https://example.com/v1.png",
            is_active_base=True,
        )
        session.add(version)
        avatar = await session.get(Avatar, avatar_id)
        assert avatar is not None
        avatar.active_card_image_url = version.image_url
        avatar.build_state = AvatarBuildState.DRAFT_APPEARANCE
        await session.commit()

    response = await client.post(
        f"/api/v1/avatars/{avatar_id}/edit-base",
        json={
            "prompt": "Refine jawline and soften shadows",
            "age": 28,
            "model": "seedream_v5",
            "aspect_ratio": "16:9",
            "mask_image_url": "data:image/png;base64,AAAA",
        },
    )
    assert response.status_code == 422
    assert "Mask editing is only supported" in response.json()["detail"]


@pytest.mark.asyncio
async def test_set_active_base_invalidates_step2_outputs_in_draft_appearance(client_and_sessionmaker):
    client, session_maker = client_and_sessionmaker
    await signup(client, email="step1-invalidate@example.com")

    draft_response = await client.post("/api/v1/avatars/drafts", json={"ownership_scope": "personal"})
    avatar_id = draft_response.json()["id"]

    async with session_maker() as session:
        version_1 = VisualVersion(
            avatar_id=avatar_id,
            version_number=1,
            image_url="https://example.com/v1.png",
            fal_request_id="req-v1",
            prompt="v1",
            enhanced_prompt="e-v1",
            model_used="seedream_v5",
            aspect_ratio="16:9",
            quality="auto_3K",
            is_edit=False,
            edit_source_url="https://example.com/v1.png",
            is_active_base=True,
        )
        version_2 = VisualVersion(
            avatar_id=avatar_id,
            version_number=2,
            image_url="https://example.com/v2.png",
            fal_request_id="req-v2",
            prompt="v2",
            enhanced_prompt="e-v2",
            model_used="seedream_v5",
            aspect_ratio="16:9",
            quality="auto_3K",
            is_edit=True,
            edit_source_url="https://example.com/v2.png",
            is_active_base=False,
        )
        session.add_all([version_1, version_2])

        profile_result = await session.execute(
            select(AvatarVisualProfile).where(AvatarVisualProfile.avatar_id == avatar_id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile is None:
            profile = AvatarVisualProfile(avatar_id=avatar_id)
            session.add(profile)
        profile.training_status = AvatarTrainingStatus.COMPLETED
        profile.training_attempt_count = 2
        profile.lora_model_id = "lora-old"
        session.add(
            ReferenceSlot(
                avatar_id=avatar_id,
                slot_key="angle_front",
                slot_label="Front",
                image_url="https://example.com/ref-front.png",
                prompt="Front",
                aspect_ratio="16:9",
            )
        )

        avatar = await session.get(Avatar, avatar_id)
        assert avatar is not None
        avatar.active_card_image_url = version_1.image_url
        avatar.build_state = AvatarBuildState.DRAFT_APPEARANCE
        await session.commit()

    precheck = await client.post(f"/api/v1/avatars/{avatar_id}/set-active-base/2")
    assert precheck.status_code == 409

    set_active_response = await client.post(
        f"/api/v1/avatars/{avatar_id}/set-active-base/2?confirm_invalidation=true"
    )
    assert set_active_response.status_code == 200

    async with session_maker() as session:
        refs_count = await session.execute(
            select(func.count(ReferenceSlot.id)).where(ReferenceSlot.avatar_id == avatar_id)
        )
        assert refs_count.scalar_one() == 0

        profile_result = await session.execute(
            select(AvatarVisualProfile).where(AvatarVisualProfile.avatar_id == avatar_id)
        )
        refreshed_profile = profile_result.scalar_one()
        assert refreshed_profile.training_status == AvatarTrainingStatus.NOT_STARTED
        assert refreshed_profile.training_attempt_count == 0
        assert refreshed_profile.lora_model_id is None

        avatar = await session.get(Avatar, avatar_id)
        assert avatar is not None
        assert avatar.active_card_image_url == "https://example.com/v2.png"
        assert avatar.build_state == AvatarBuildState.DRAFT_APPEARANCE


@pytest.mark.asyncio
async def test_edit_base_accepts_ordered_reference_images_and_persists_mask(client_and_sessionmaker, monkeypatch):
    client, session_maker = client_and_sessionmaker
    await signup(client, email="step1-order@example.com")

    draft_response = await client.post("/api/v1/avatars/drafts", json={"ownership_scope": "personal"})
    avatar_id = draft_response.json()["id"]

    async with session_maker() as session:
        version = VisualVersion(
            avatar_id=avatar_id,
            version_number=1,
            image_url="https://example.com/active.png",
            fal_request_id="req-active",
            prompt="active",
            enhanced_prompt="active enhanced",
            model_used="openai_image_1_5",
            aspect_ratio="16:9",
            quality="medium",
            is_edit=False,
            edit_source_url="https://example.com/active-source.png",
            is_active_base=True,
        )
        session.add(version)
        avatar = await session.get(Avatar, avatar_id)
        assert avatar is not None
        avatar.active_card_image_url = version.image_url
        avatar.build_state = AvatarBuildState.DRAFT_APPEARANCE
        await session.commit()

    captured: dict[str, list[str]] = {}

    async def fake_submit_and_wait(*, image_urls, **kwargs):
        captured["image_urls"] = image_urls
        return {"request_id": "new-edit-req", "images": [{"url": "https://fal.example/new.png"}]}

    async def fake_download_and_store(*args, **kwargs):
        return "https://cdn.example/new.png"

    from src.modules.avatars import router as avatars_router
    
    monkeypatch.setattr(avatars_router, "AsyncSessionLocal", session_maker)
    monkeypatch.setattr(avatars_router.fal_service, "submit_and_wait", fake_submit_and_wait)
    monkeypatch.setattr(avatars_router.media_service, "download_and_store", fake_download_and_store)

    reference_urls = [
        "https://example.com/ref-1.png",
        "https://example.com/ref-2.png",
        "https://example.com/ref-3.png",
    ]
    response = await client.post(
        f"/api/v1/avatars/{avatar_id}/edit-base",
        json={
            "prompt": "Refine expression and preserve identity",
            "age": 31,
            "model": "openai_image_1_5",
            "aspect_ratio": "16:9",
            "reference_image_urls": reference_urls,
            "mask_image_url": "data:image/png;base64,BBBB",
        },
    )

    assert response.status_code == 202
    
    import asyncio
    # Wait for background task to trigger fal_service
    for _ in range(50):
        if "image_urls" in captured:
            break
        await asyncio.sleep(0.05)
    
    assert captured.get("image_urls") == reference_urls

    latest = None
    # Wait for background task to commit to DB
    for _ in range(50):
        async with session_maker() as session:
            result = await session.execute(
                select(VisualVersion)
                .where(VisualVersion.avatar_id == avatar_id)
                .order_by(VisualVersion.version_number.desc())
                .limit(1)
            )
            latest = result.scalar_one_or_none()
            if latest and latest.version_number == 2:
                break
        await asyncio.sleep(0.05)

    assert latest is not None
    assert latest.mask_image_url == "data:image/png;base64,BBBB"


@pytest.mark.asyncio
async def test_train_lora_returns_async_accepted_envelope(client_and_sessionmaker):
    client, session_maker = client_and_sessionmaker
    await signup(client, email="train-envelope@example.com")

    draft_response = await client.post("/api/v1/avatars/drafts", json={"ownership_scope": "personal"})
    avatar_id = draft_response.json()["id"]

    async with session_maker() as session:
        avatar = await session.get(Avatar, avatar_id)
        assert avatar is not None
        avatar.build_state = AvatarBuildState.DRAFT_APPEARANCE
        for idx in range(1, 16):
            session.add(
                ReferenceSlot(
                    avatar_id=avatar_id,
                    slot_key=f"slot_{idx}",
                    slot_label=f"Slot {idx}",
                    image_url=f"https://example.com/ref-{idx}.png",
                    prompt="slot",
                    aspect_ratio="16:9",
                )
            )
        await session.commit()

    response = await client.post(f"/api/v1/avatars/{avatar_id}/train-lora")
    assert response.status_code == 202
    body = response.json()
    assert body["accepted"] is True
    assert body["operation"] == "train_lora"
    assert body["avatar_id"] == avatar_id
    assert isinstance(body["operation_id"], str)


@pytest.mark.asyncio
async def test_readiness_endpoint_and_active_card_patch_block(client_and_sessionmaker):
    client, _ = client_and_sessionmaker
    await signup(client, email="readiness@example.com")

    draft_response = await client.post("/api/v1/avatars/drafts", json={"ownership_scope": "personal"})
    avatar_id = draft_response.json()["id"]

    readiness_response = await client.get(f"/api/v1/avatars/{avatar_id}/readiness")
    assert readiness_response.status_code == 200
    readiness = readiness_response.json()
    assert readiness["current_step"] == 1
    assert readiness["can_complete_avatar"] is False
    assert len(readiness["steps"]) == 3

    patch_response = await client.patch(
        f"/api/v1/avatars/{avatar_id}",
        json={"active_card_image_url": "https://malicious.example.com/override.png"},
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["active_card_image_url"] is None
