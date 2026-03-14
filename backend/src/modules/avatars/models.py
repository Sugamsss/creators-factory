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


class Avatar(Base):  # type: ignore[misc]
    __tablename__ = "avatars"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

    # Ownership and source
    ownership_scope = Column(String, default="personal")  # personal | org
    source_type = Column(String, default="original")  # original | clone
    source_avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=True)

    # Visual profile
    visual_profile_snapshot_id = Column(Integer, nullable=True)

    # Build state
    build_state: Column[AvatarBuildState] = Column(
        SQLEnum(AvatarBuildState), default=AvatarBuildState.DRAFT_VISUAL, index=True
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

    # Clone tracking
    clone_count = Column(Integer, default=0)

    # Metadata
    is_public = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    hard_delete_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    owner = relationship("User", back_populates="avatars")
    industry = relationship("Industry", back_populates="avatars")
    org = relationship("Organization", back_populates="avatars")
    automation_bindings = relationship(
        "AutomationBinding", back_populates="avatar", cascade="all, delete-orphan"
    )
    visual_versions = relationship(
        "VisualVersion", back_populates="avatar", cascade="all, delete-orphan"
    )
    reference_slots = relationship(
        "ReferenceSlot", back_populates="avatar", cascade="all, delete-orphan"
    )
    attachments = relationship(
        "AvatarAttachment", back_populates="avatar", cascade="all, delete-orphan"
    )


class VisualVersion(Base):
    __tablename__ = "visual_versions"

    id = Column(Integer, primary_key=True, index=True)
    avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)

    image_url = Column(String, nullable=False)
    fal_request_id = Column(String)

    prompt = Column(Text, nullable=False)
    enhanced_prompt = Column(Text)
    model_used = Column(String, nullable=False)
    aspect_ratio = Column(String, nullable=False)
    quality = Column(String, nullable=False)

    is_edit = Column(Boolean, default=False)
    mask_image_url = Column(String)
    edit_source_url = Column(String)

    is_active_base = Column(Boolean, default=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    avatar = relationship("Avatar", back_populates="visual_versions")


class ReferenceSlot(Base):
    __tablename__ = "reference_slots"

    id = Column(Integer, primary_key=True, index=True)
    avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=False, index=True)

    slot_key = Column(String, nullable=False)
    slot_label = Column(String, nullable=False)

    image_url = Column(String, nullable=False)
    fal_request_id = Column(String)

    prompt = Column(Text, nullable=False)
    aspect_ratio = Column(String)

    is_refined = Column(Boolean, default=False)
    refinement_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    avatar = relationship("Avatar", back_populates="reference_slots")


class AvatarAttachment(Base):
    __tablename__ = "avatar_attachments"

    id = Column(Integer, primary_key=True, index=True)
    avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    avatar = relationship("Avatar", back_populates="attachments")
