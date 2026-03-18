import asyncio
from sqlalchemy import select, update

from src.core.database import AsyncSessionLocal
from src.modules.avatars.models import Avatar, AvatarBuildState, VisualVersion


async def normalize_avatar_state() -> None:
    async with AsyncSessionLocal() as session:
        await session.execute(
            update(Avatar)
            .where(Avatar.ownership_scope == "public")
            .values(ownership_scope="personal")
        )

        result = await session.execute(select(Avatar))
        avatars = result.scalars().all()
        for avatar in avatars:
            active_result = await session.execute(
                select(VisualVersion)
                .where(
                    VisualVersion.avatar_id == avatar.id,
                    VisualVersion.is_active_base.is_(True),
                )
                .order_by(VisualVersion.version_number.desc())
                .limit(1)
            )
            active = active_result.scalar_one_or_none()
            avatar.active_card_image_url = active.image_url if active else None

            if avatar.build_state == AvatarBuildState.READY and active is None:
                avatar.build_state = AvatarBuildState.DRAFT_VISUAL

        await session.commit()


if __name__ == "__main__":
    asyncio.run(normalize_avatar_state())
