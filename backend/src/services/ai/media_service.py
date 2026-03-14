import asyncio
from pathlib import Path
from urllib.parse import urlparse

import httpx

from src.core.config import get_settings

settings = get_settings()


class MediaStorageError(Exception):
    pass


class MediaStorageService:
    def __init__(self):
        self.public_base_url = settings.PUBLIC_MEDIA_BASE_URL.rstrip("/")
        self.local_media_base_url = settings.LOCAL_MEDIA_BASE_URL.rstrip("/")
        self.local_media_root = Path(settings.LOCAL_MEDIA_ROOT).resolve()
        self.local_media_root.mkdir(parents=True, exist_ok=True)

        self._s3_client = None
        self.bucket = settings.S3_BUCKET
        if settings.S3_ENDPOINT_URL:
            import boto3

            self._s3_client = boto3.client(
                "s3",
                endpoint_url=settings.S3_ENDPOINT_URL,
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
            )

    async def download_from_url(self, url: str) -> bytes:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30.0)
            response.raise_for_status()
            return response.content

    async def _store_local_file(
        self, relative_key: str, file_data: bytes, content_type: str = "image/png"
    ) -> str:
        target = self.local_media_root / relative_key
        target.parent.mkdir(parents=True, exist_ok=True)
        await asyncio.to_thread(target.write_bytes, file_data)
        return f"{self.local_media_base_url}/{relative_key}"

    async def download_and_store(
        self, source_url: str, avatar_id: int, version_type: str, filename: str
    ) -> str:
        image_data = await self.download_from_url(source_url)
        s3_key = f"avatars/{avatar_id}/{version_type}/{filename}"

        if not self._s3_client:
            return await self._store_local_file(s3_key, image_data, "image/png")

        await asyncio.to_thread(
            self._s3_client.put_object,
            Bucket=self.bucket,
            Key=s3_key,
            Body=image_data,
            ContentType="image/png",
        )
        return f"{self.public_base_url}/{s3_key}"

    async def upload_mask(self, mask_data: bytes, avatar_id: int, filename: str) -> str:
        s3_key = f"avatars/{avatar_id}/masks/{filename}"
        if not self._s3_client:
            return await self._store_local_file(s3_key, mask_data, "image/png")

        await asyncio.to_thread(
            self._s3_client.put_object,
            Bucket=self.bucket,
            Key=s3_key,
            Body=mask_data,
            ContentType="image/png",
        )
        return f"{self.public_base_url}/{s3_key}"

    async def upload_reference_image(
        self,
        file_data: bytes,
        avatar_id: int,
        filename: str,
        content_type: str = "image/png",
    ) -> str:
        s3_key = f"avatars/{avatar_id}/attachments/{filename}"
        if not self._s3_client:
            return await self._store_local_file(s3_key, file_data, content_type)

        await asyncio.to_thread(
            self._s3_client.put_object,
            Bucket=self.bucket,
            Key=s3_key,
            Body=file_data,
            ContentType=content_type,
        )
        return f"{self.public_base_url}/{s3_key}"

    async def delete_file(self, url: str) -> bool:
        if self._s3_client and url.startswith(self.public_base_url):
            s3_key = url.replace(f"{self.public_base_url}/", "")
            try:
                await asyncio.to_thread(
                    self._s3_client.delete_object, Bucket=self.bucket, Key=s3_key
                )
                return True
            except Exception:
                return False

        if url.startswith(self.local_media_base_url):
            parsed = urlparse(url)
            local_key = parsed.path.replace("/media/", "", 1).lstrip("/")
            target = self.local_media_root / local_key
            try:
                if target.exists():
                    await asyncio.to_thread(target.unlink)
                return True
            except Exception:
                return False

        return False
