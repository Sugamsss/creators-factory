"""
Initialize database tables - run this once
"""

import asyncio
import sys

sys.path.insert(0, "/Users/sugam/Personal Projects/Creators Factory/backend")

from src.core.database import engine, Base


async def main():
    print("Creating all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ All tables created successfully!")


if __name__ == "__main__":
    asyncio.run(main())
