import httpx
from typing import Dict, List, Optional, Any
from src.core.config import get_settings

settings = get_settings()

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
}

QUALITY_SETTINGS = {
    "openai_image_1_5": "medium",
    "google_nano_banana_2": "medium",
    "seedream_v5": "auto_3K",
}

ASPECT_RATIO_MAP = {
    "openai_image_1_5": {
        "1:1": "1024x1024",
        "4:3": "1024x1536",
        "16:9": "1536x1024",
        "9:16": "1024x1536",
    },
    "google_nano_banana_2": {
        "1:1": "1:1",
        "4:3": "4:3",
        "16:9": "16:9",
        "9:16": "9:16",
    },
    "seedream_v5": {"*": "auto_3K"},
}


class FalServiceError(Exception):
    pass


class FalService:
    def __init__(self):
        self.api_key = settings.FAL_API_KEY
        self.base_url = "https://queue.fal.run"
        self.headers = {
            "Authorization": f"Key {self.api_key}",
            "Content-Type": "application/json",
        }

    def _validate_api_key(self) -> None:
        if not self.api_key:
            raise FalServiceError("FAL_API_KEY is not configured")

    async def submit_text_to_image(
        self, model: str, prompt: str, aspect_ratio: str = "16:9", num_images: int = 1
    ) -> Dict[str, Any]:
        self._validate_api_key()
        endpoint = FAL_ENDPOINTS[model]["text_to_image"]

        payload = {"prompt": prompt, "num_images": num_images, "output_format": "png"}

        if model == "openai_image_1_5":
            payload["quality"] = QUALITY_SETTINGS[model]
            payload["image_size"] = ASPECT_RATIO_MAP[model].get(
                aspect_ratio, "1024x1024"
            )

        elif model == "google_nano_banana_2":
            payload["resolution"] = "1K"
            payload["aspect_ratio"] = ASPECT_RATIO_MAP[model].get(aspect_ratio, "auto")
            payload["limit_generations"] = True

        elif model == "seedream_v5":
            payload["image_size"] = ASPECT_RATIO_MAP[model]["*"]

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/{endpoint}",
                headers=self.headers,
                json=payload,
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()

    async def submit_edit_image(
        self,
        model: str,
        prompt: str,
        image_urls: List[str],
        aspect_ratio: str = "auto",
        mask_image_url: Optional[str] = None,
        num_images: int = 1,
    ) -> Dict[str, Any]:
        self._validate_api_key()
        endpoint = FAL_ENDPOINTS[model]["edit"]

        payload = {
            "prompt": prompt,
            "image_urls": image_urls,
            "num_images": num_images,
            "output_format": "png",
        }

        if model == "openai_image_1_5":
            payload["quality"] = QUALITY_SETTINGS[model]
            payload["image_size"] = ASPECT_RATIO_MAP[model].get(aspect_ratio, "auto")
            payload["input_fidelity"] = "high"
            if mask_image_url:
                payload["mask_image_url"] = mask_image_url

        elif model == "google_nano_banana_2":
            payload["resolution"] = "1K"
            payload["aspect_ratio"] = ASPECT_RATIO_MAP[model].get(aspect_ratio, "auto")
            payload["limit_generations"] = True

        elif model == "seedream_v5":
            payload["image_size"] = ASPECT_RATIO_MAP[model]["*"]

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/{endpoint}",
                headers=self.headers,
                json=payload,
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()

    async def get_request_status(
        self, endpoint: str, request_id: str
    ) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/{endpoint}/requests/{request_id}/status",
                headers=self.headers,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()

    async def get_request_result(
        self, endpoint: str, request_id: str
    ) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/{endpoint}/requests/{request_id}",
                headers=self.headers,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()

    async def wait_for_completion(
        self,
        endpoint: str,
        request_id: str,
        poll_interval: float = 2.0,
        max_wait: float = 120.0,
    ) -> Dict[str, Any]:
        import asyncio

        elapsed = 0.0
        while elapsed < max_wait:
            status = await self.get_request_status(endpoint, request_id)

            if status.get("status") == "COMPLETED":
                return await self.get_request_result(endpoint, request_id)

            if status.get("status") == "FAILED":
                error_msg = status.get("error", "Generation failed")
                raise FalServiceError(error_msg)

            await asyncio.sleep(poll_interval)
            elapsed += poll_interval

        raise FalServiceError(f"Timeout waiting for generation after {max_wait}s")

    async def wait_for_completion_url(
        self,
        status_url: str,
        poll_interval: float = 2.0,
        max_wait: float = 120.0,
    ) -> Dict[str, Any]:
        import asyncio

        elapsed = 0.0
        while elapsed < max_wait:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    status_url, headers=self.headers, timeout=10.0
                )
                if response.status_code == 405:
                    await asyncio.sleep(poll_interval)
                    elapsed += poll_interval
                    continue
                response.raise_for_status()
                status = response.json()

            if status.get("status") == "COMPLETED":
                result_url = status_url.replace("/status", "")
                async with httpx.AsyncClient() as client:
                    result_response = await client.get(
                        result_url, headers=self.headers, timeout=10.0
                    )
                    result_response.raise_for_status()
                    return result_response.json()

            if status.get("status") == "FAILED":
                error_msg = status.get("error", "Generation failed")
                raise FalServiceError(error_msg)

            await asyncio.sleep(poll_interval)
            elapsed += poll_interval

        raise FalServiceError(f"Timeout waiting for generation after {max_wait}s")

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
        if is_edit and image_urls:
            result = await self.submit_edit_image(
                model=model,
                prompt=prompt,
                image_urls=image_urls,
                aspect_ratio=aspect_ratio,
                mask_image_url=mask_image_url,
                num_images=num_images,
            )
        else:
            result = await self.submit_text_to_image(
                model=model,
                prompt=prompt,
                aspect_ratio=aspect_ratio,
                num_images=num_images,
            )

        request_id = result.get("request_id")
        if not request_id:
            return result

        status_url = result.get("status_url")
        if not status_url:
            endpoint = (
                FAL_ENDPOINTS[model]["edit"]
                if is_edit
                else FAL_ENDPOINTS[model]["text_to_image"]
            )
            return await self.wait_for_completion(endpoint, request_id)

        return await self.wait_for_completion_url(status_url)
