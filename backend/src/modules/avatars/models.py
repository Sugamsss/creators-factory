from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.core.database import Base
import enum


class AvatarBuildState(str, enum.Enum):
    DRAFT_VISUAL = "draft_visual"
    DRAFT_APPEARANCE = "draft_appearance"
    TRAINING_LORA = "training_lora"
    FAILED_TRAINING = "failed_training"
    DRAFT_PERSONALITY = "draft_personality"
    READY = "ready"
    SOFT_DELETED = "soft_deleted"


class AvatarDeploymentSummary(str, enum.Enum):
    NOT_IN_USE = "not_in_use"
    IN_USE = "in_use"
    PARTIALLY_PAUSED = "partially_paused"
    FULLY_PAUSED = "fully_paused"


class Avatar(Base):
    __tablename__ = "avatars"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String, nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

    # Ownership and source
    ownership_scope = Column(String, default="personal")  # personal | org
    source_type = Column(String, default="original")  # original | clone
    source_avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=True)

    # Visual profile
    visual_profile_snapshot_id = Column(Integer, nullable=True)

    # Build state
    build_state = Column(
        SQLEnum(AvatarBuildState), default=AvatarBuildState.DRAFT_VISUAL
    )

    # Core info
    name = Column(String(40), nullable=True)
    age = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)

    # Identity
    backstory = Column(Text, nullable=True)
    communication_principles = Column(Text, nullable=True)  # JSON array

    # Industry & Role
    industry_id = Column(Integer, ForeignKey("industries.id"), nullable=True)
    role_paragraph = Column(Text, nullable=True)

    # Visual
    active_card_image_url = Column(String, nullable=True)

    # Metadata
    is_public = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    hard_delete_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    owner = relationship("User", back_populates="avatars")
    industry = relationship("Industry", back_populates="avatars")
    visual_profile = relationship(
        "AvatarVisualProfile", back_populates="avatar", uselist=False
    )
    personality_snapshots = relationship(
        "AvatarPersonalitySnapshot", back_populates="avatar"
    )
    automation_bindings = relationship("AutomationBinding", back_populates="avatar")
