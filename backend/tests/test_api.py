"""
Test API units without making real fal.ai API calls.
"""

import asyncio
import sys
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import AsyncMock, patch

sys.path.insert(0, "/Users/sugam/Personal Projects/Creators Factory/backend")

from src.core.security import create_access_token, create_refresh_token, decode_token
from src.services.ai.fal_service import ASPECT_RATIO_MAP, QUALITY_SETTINGS, FalService
from src.services.ai.media_service import MediaStorageService


def test_fal_service_mock():
    mock_response = {
        "images": [{"url": "https://fake-fal-cdn.com/image.png"}],
        "request_id": "test-request-123",
    }

    async def run():
        with patch.object(
            FalService,
            "submit_and_wait",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            service = FalService()
            result = await service.submit_and_wait(
                model="seedream_v5",
                prompt="test prompt",
                aspect_ratio="16:9",
                is_edit=False,
            )
            assert result["images"][0]["url"] == "https://fake-fal-cdn.com/image.png"

    asyncio.run(run())


def test_endpoint_schemas():
    from src.modules.avatars.schemas import GenerateBaseRequest
    from pydantic import ValidationError

    req1 = GenerateBaseRequest(
        prompt="young woman", age=28, model="seedream_v5", aspect_ratio="16:9"
    )
    assert req1.age == 28

    try:
        GenerateBaseRequest(prompt="young woman", model="seedream_v5")
        raise AssertionError("GenerateBaseRequest should require age")
    except ValidationError:
        pass


def test_aspect_ratio_mapping():
    assert ASPECT_RATIO_MAP["openai_image_1_5"]["1:1"] == "1024x1024"
    assert ASPECT_RATIO_MAP["openai_image_1_5"]["3:4"] == "1024x1536"
    assert ASPECT_RATIO_MAP["openai_image_1_5"]["4:3"] == "1536x1024"
    assert ASPECT_RATIO_MAP["openai_image_1_5"]["16:9"] == "1536x1024"
    assert ASPECT_RATIO_MAP["google_nano_banana_2"]["1:1"] == "1:1"
    assert ASPECT_RATIO_MAP["google_nano_banana_2"]["3:4"] == "3:4"
    assert ASPECT_RATIO_MAP["google_nano_banana_2"]["9:16"] == "9:16"
    assert ASPECT_RATIO_MAP["seedream_v5"]["*"] == "auto_3K"


def test_quality_settings():
    assert QUALITY_SETTINGS["openai_image_1_5"] == "medium"
    assert QUALITY_SETTINGS["google_nano_banana_2"] == "medium"
    assert QUALITY_SETTINGS["seedream_v5"] == "auto_3K"


def test_access_and_refresh_tokens_are_typed():
    access_token = create_access_token({"sub": "u1", "email": "u@example.com"})
    refresh_token = create_refresh_token({"sub": "u1", "email": "u@example.com"})

    access_payload = decode_token(access_token, expected_type="access")
    refresh_payload = decode_token(refresh_token, expected_type="refresh")

    assert access_payload["type"] == "access"
    assert refresh_payload["type"] == "refresh"


def test_media_storage_local_fallback_writes_valid_file():
    with TemporaryDirectory() as tmp_dir:
        service = MediaStorageService()
        service.local_media_root = Path(tmp_dir)
        service.local_media_base_url = "http://localhost:8000/media"

        async def run():
            url = await service.upload_reference_image(
                b"\x89PNG\r\n\x1a\n",
                avatar_id=123,
                filename="sample.png",
                content_type="image/png",
            )
            assert url.endswith("/avatars/123/attachments/sample.png")
            saved_file = Path(tmp_dir) / "avatars/123/attachments/sample.png"
            assert saved_file.exists()
            assert saved_file.read_bytes() == b"\x89PNG\r\n\x1a\n"

        asyncio.run(run())
