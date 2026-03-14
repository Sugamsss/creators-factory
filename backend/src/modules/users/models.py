from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from src.core.database import Base


class User(Base):  # type: ignore[misc]
    __tablename__ = "users"

    id: Column[str] = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    email: Column[str] = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Column[str] = Column(String(255), nullable=False)
    name: Column[str] = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    avatars = relationship("Avatar", back_populates="owner")
