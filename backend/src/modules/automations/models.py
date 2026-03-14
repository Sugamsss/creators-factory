from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from src.core.database import Base


class AutomationBindingStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"


class AutomationBinding(Base):  # type: ignore[misc]
    __tablename__ = "automation_bindings"

    id = Column(Integer, primary_key=True, index=True)
    avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=False, index=True)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String(100), nullable=False)
    schedule = Column(String(50), nullable=True)
    status: Column[AutomationBindingStatus] = Column(
        SQLEnum(AutomationBindingStatus), default=AutomationBindingStatus.ACTIVE
    )

    videos_generated = Column(Integer, default=0)
    last_run = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    avatar = relationship("Avatar", back_populates="automation_bindings")
