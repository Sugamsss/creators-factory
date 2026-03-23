import asyncio
import logging
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx

from src.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

FAL_ENDPOINTS = {
    "openai_image_1_5": {
        "text_to_image": "fal-ai/gpt-image-1.5",
        "edit": "fal-ai/gpt-image-1.5/edit",
    },
    "google_nano_banana_2": {
        "text_to_image": "fal-ai/nano-banana-2",
        "edit": "fal-ai/nano-banana-2/edit",
    },
    "seedream_v5": {
        "text_to_image": "fal-ai/bytedance/seedream/v5/lite/text-to-image",
        "edit": "fal-ai/bytedance/seedream/v5/lite/edit",
    },
    "llm": {
        "chat": "fal-ai/meta-llama/llama-3.1-70b-instruct",
    },
}

QUALITY_SETTINGS = {
    "openai_image_1_5": "high",
    "google_nano_banana_2": "medium",
    "seedream_v5": "auto_3K",
}

ASPECT_RATIO_MAP = {
    "openai_image_1_5": {
        "1:1": "1024x1024",
        "3:4": "1024x1536",
        "4:3": "1536x1024",
        "16:9": "1536x1024",
        "9:16": "1024x1536",
    },
    "google_nano_banana_2": {
        "1:1": "1:1",
        "3:4": "3:4",
        "4:3": "4:3",
        "16:9": "16:9",
        "9:16": "9:16",
    },
    "seedream_v5": {
        "1:1": "square_hd",
        "3:4": "portrait_4_3",
        "4:3": "landscape_4_3",
        "16:9": "landscape_16_9",
        "9:16": "portrait_16_9",
    },
}

TRANSIENT_STATUS_CODES = {408, 409, 425, 429, 500, 502, 503, 504}


class FalServiceError(Exception):
    pass


class FalConfigurationError(FalServiceError):
    pass


class FalTimeoutError(FalServiceError):
    pass


class FalResponseError(FalServiceError):
    pass


@dataclass
class FalTelemetry:
    endpoint: str
    mode: str
    model: str
    request_id: Optional[str] = None
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class FalService:
    def __init__(self):
        self.api_key = self._resolve_api_key()
        self.base_url = "https://fal.run"
        self.headers = {
            "Authorization": f"Key {self.api_key}" if self.api_key else "",
            "Content-Type": "application/json",
        }
        # Synchronous fal.run inference can take longer than queue submit requests.
        self.submit_timeout_seconds = 180.0
        self.max_http_retries = 3

    def _resolve_api_key(self) -> str:
        explicit = (settings.FAL_API_KEY or "").strip()
        if explicit:
            return explicit
        fallback = (getattr(settings, "FAL_KEY", "") or "").strip()
        if fallback:
            return fallback
        return os.getenv("FAL_KEY", "").strip()

    def _validate_api_key(self) -> None:
        if not self.api_key:
            raise FalConfigurationError(
                "fal API key missing. Set FAL_API_KEY or FAL_KEY."
            )

    async def _request_json(
        self,
        method: str,
        url: str,
        *,
        json_payload: Optional[Dict[str, Any]] = None,
        timeout: float,
        telemetry: FalTelemetry,
    ) -> Dict[str, Any]:
        self._validate_api_key()
        delay = 0.5
        last_error: Optional[Exception] = None

        for attempt in range(1, self.max_http_retries + 1):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.request(
                        method=method,
                        url=url,
                        headers=self.headers,
                        json=json_payload,
                        timeout=timeout,
                    )
                if (
                    response.status_code in TRANSIENT_STATUS_CODES
                    and attempt < self.max_http_retries
                ):
                    await asyncio.sleep(delay)
                    delay *= 2
                    continue
                response.raise_for_status()
                body = response.json()
                if not isinstance(body, dict):
                    raise FalResponseError("fal response must be a JSON object.")
                return body
            except (httpx.TimeoutException, httpx.NetworkError) as exc:
                last_error = exc
                if attempt == self.max_http_retries:
                    raise FalTimeoutError(
                        f"fal {method} timeout/network error after {attempt} attempts "
                        f"(endpoint={telemetry.endpoint}, mode={telemetry.mode})."
                    ) from exc
                await asyncio.sleep(delay)
                delay *= 2
            except httpx.HTTPStatusError as exc:
                status = exc.response.status_code
                body = exc.response.text[:500]
                if status in TRANSIENT_STATUS_CODES and attempt < self.max_http_retries:
                    last_error = exc
                    await asyncio.sleep(delay)
                    delay *= 2
                    continue
                raise FalResponseError(
                    f"fal {method} failed with status={status} endpoint={telemetry.endpoint} body={body}"
                ) from exc
            except ValueError as exc:
                raise FalResponseError("fal response was not valid JSON.") from exc

        if last_error is not None:
            raise FalServiceError(str(last_error))
        raise FalServiceError("Unexpected fal request failure.")

    def _build_text_payload(
        self, model: str, prompt: str, aspect_ratio: str, num_images: int
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {"prompt": prompt, "num_images": num_images}
        if model == "openai_image_1_5":
            payload["quality"] = QUALITY_SETTINGS[model]
            payload["image_size"] = ASPECT_RATIO_MAP[model].get(
                aspect_ratio, "1024x1024"
            )
            payload["output_format"] = "png"
        elif model == "google_nano_banana_2":
            payload["resolution"] = "1K"
            payload["aspect_ratio"] = ASPECT_RATIO_MAP[model].get(aspect_ratio, "1:1")
            payload["limit_generations"] = True
            payload["output_format"] = "png"
        elif model == "seedream_v5":
            payload["image_size"] = ASPECT_RATIO_MAP[model].get(aspect_ratio, "auto_2K")
        else:
            raise FalResponseError(f"Unsupported model '{model}'.")
        return payload

    def _build_edit_payload(
        self,
        model: str,
        prompt: str,
        image_urls: List[str],
        aspect_ratio: str,
        mask_image_url: Optional[str],
        num_images: int,
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "prompt": prompt,
            "image_urls": image_urls,
            "num_images": num_images,
        }
        if model == "openai_image_1_5":
            payload["quality"] = QUALITY_SETTINGS[model]
            payload["image_size"] = ASPECT_RATIO_MAP[model].get(
                aspect_ratio, "1024x1024"
            )
            payload["input_fidelity"] = "high"
            payload["output_format"] = "png"
            if mask_image_url:
                payload["mask_image_url"] = mask_image_url
        elif model == "google_nano_banana_2":
            payload["resolution"] = "1K"
            payload["aspect_ratio"] = ASPECT_RATIO_MAP[model].get(aspect_ratio, "1:1")
            payload["limit_generations"] = True
            payload["output_format"] = "png"
        elif model == "seedream_v5":
            payload["image_size"] = ASPECT_RATIO_MAP[model].get(aspect_ratio, "auto_2K")
            if mask_image_url:
                payload["mask_image"] = mask_image_url
        else:
            raise FalResponseError(f"Unsupported model '{model}'.")
        return payload

    def _normalize_images(self, response: Dict[str, Any]) -> List[Dict[str, str]]:
        urls: List[str] = []

        def walk(value: Any) -> None:
            if isinstance(value, dict):
                candidate_url = value.get("url") or value.get("image_url")
                if isinstance(candidate_url, str) and candidate_url.startswith("http"):
                    urls.append(candidate_url)
                for nested in value.values():
                    walk(nested)
            elif isinstance(value, list):
                for item in value:
                    walk(item)

        for key in ("images", "output", "data", "result"):
            if key in response:
                walk(response[key])
        walk(response)

        deduped: List[Dict[str, str]] = []
        seen: set[str] = set()
        for url in urls:
            if url in seen:
                continue
            seen.add(url)
            deduped.append({"url": url})
        return deduped

    async def submit_text_to_image(
        self, model: str, prompt: str, aspect_ratio: str = "16:9", num_images: int = 1
    ) -> Dict[str, Any]:
        endpoint = FAL_ENDPOINTS[model]["text_to_image"]
        payload = self._build_text_payload(model, prompt, aspect_ratio, num_images)
        telemetry = FalTelemetry(endpoint=endpoint, mode="text", model=model)
        return await self._request_json(
            "POST",
            f"{self.base_url}/{endpoint}",
            json_payload=payload,
            timeout=self.submit_timeout_seconds,
            telemetry=telemetry,
        )

    async def submit_edit_image(
        self,
        model: str,
        prompt: str,
        image_urls: List[str],
        aspect_ratio: str = "16:9",
        mask_image_url: Optional[str] = None,
        num_images: int = 1,
    ) -> Dict[str, Any]:
        endpoint = FAL_ENDPOINTS[model]["edit"]
        payload = self._build_edit_payload(
            model, prompt, image_urls, aspect_ratio, mask_image_url, num_images
        )
        telemetry = FalTelemetry(endpoint=endpoint, mode="edit", model=model)
        return await self._request_json(
            "POST",
            f"{self.base_url}/{endpoint}",
            json_payload=payload,
            timeout=self.submit_timeout_seconds,
            telemetry=telemetry,
        )

    async def submit_and_wait(
        self,
        model: str,
        prompt: str,
        aspect_ratio: str = "16:9",
        is_edit: bool = False,
        image_urls: Optional[List[str]] = None,
        mask_image_url: Optional[str] = None,
        num_images: int = 1,
    ) -> Dict[str, Any]:
        endpoint = (
            FAL_ENDPOINTS[model]["edit"]
            if is_edit
            else FAL_ENDPOINTS[model]["text_to_image"]
        )
        if is_edit:
            if not image_urls:
                raise FalResponseError(
                    "Edit generation requires at least one reference image URL."
                )
            submit_result = await self.submit_edit_image(
                model=model,
                prompt=prompt,
                image_urls=image_urls,
                aspect_ratio=aspect_ratio,
                mask_image_url=mask_image_url,
                num_images=num_images,
            )
        else:
            submit_result = await self.submit_text_to_image(
                model=model,
                prompt=prompt,
                aspect_ratio=aspect_ratio,
                num_images=num_images,
            )

        images = self._normalize_images(submit_result)
        if not images:
            raise FalResponseError(
                f"fal inference response did not include a usable image URL (endpoint={endpoint})."
            )
        return {
            "request_id": submit_result.get("request_id"),
            "images": images,
        }

    async def submit_llm(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        endpoint = FAL_ENDPOINTS["llm"]["chat"]
        result = await self._request_json(
            "POST",
            f"{self.base_url}/{endpoint}",
            json_payload=payload,
            timeout=60.0,
            telemetry=FalTelemetry(endpoint=endpoint, mode="llm-chat"),
        )
        return (
            result.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
