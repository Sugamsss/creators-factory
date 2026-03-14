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


class AvatarTrainingStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    QUEUED = "queued"
    RUNNING = "running"
    RETRYING = "retrying"
    FAILED = "failed"
    COMPLETED = "completed"


class AvatarReactionStatus(str, enum.Enum):
    PENDING = "pending"
    GENERATING = "generating"
    READY = "ready"
    FAILED = "failed"


class Avatar(Base):  # type: ignore[misc]
    __tablename__ = "avatars"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

    ownership_scope = Column(String, default="personal")  # personal | org
    source_type = Column(String, default="original")  # original | clone
    source_avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=True)

    visual_profile_snapshot_id = Column(Integer, nullable=True)

    build_state: Column[AvatarBuildState] = Column(
        SQLEnum(AvatarBuildState), default=AvatarBuildState.DRAFT_VISUAL, index=True
    )

    name = Column(String(40), nullable=True)
    age = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)

    backstory = Column(Text, nullable=True)
    communication_principles = Column(Text, nullable=True)  # JSON array string

    industry_id = Column(Integer, ForeignKey("industries.id"), nullable=True)
    role_paragraph = Column(Text, nullable=True)

    active_card_image_url = Column(String, nullable=True)

    clone_count = Column(Integer, default=0)

    is_public = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    hard_delete_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

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
    visual_profile = relationship(
        "AvatarVisualProfile",
        back_populates="avatar",
        cascade="all, delete-orphan",
        uselist=False,
    )
    personality_snapshots = relationship(
        "AvatarPersonalitySnapshot",
        back_populates="avatar",
        cascade="all, delete-orphan",
    )
    reaction_assets = relationship(
        "AvatarReactionAsset", back_populates="avatar", cascade="all, delete-orphan"
    )
    field_locks = relationship(
        "AvatarFieldLock", back_populates="avatar", cascade="all, delete-orphan"
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


class AvatarVisualProfile(Base):
    __tablename__ = "avatar_visual_profiles"

    id = Column(Integer, primary_key=True, index=True)
    avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=False, index=True)
    lora_model_id = Column(String, nullable=True)
    training_status: Column[AvatarTrainingStatus] = Column(
        SQLEnum(AvatarTrainingStatus),
        default=AvatarTrainingStatus.NOT_STARTED,
        nullable=False,
    )
    training_attempt_count = Column(Integer, default=0, nullable=False)
    training_started_at = Column(DateTime(timezone=True), nullable=True)
    training_completed_at = Column(DateTime(timezone=True), nullable=True)
    training_error_code = Column(String, nullable=True)

    avatar = relationship("Avatar", back_populates="visual_profile")


class AvatarPersonalitySnapshot(Base):
    __tablename__ = "avatar_personality_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    payload_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    avatar = relationship("Avatar", back_populates="personality_snapshots")


class AvatarReactionAsset(Base):
    __tablename__ = "avatar_reaction_assets"

    id = Column(Integer, primary_key=True, index=True)
    avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    usage_intent = Column(Text, nullable=True)
    hook_description = Column(Text, nullable=True)
    generation_prompt = Column(Text, nullable=True)
    status: Column[AvatarReactionStatus] = Column(
        SQLEnum(AvatarReactionStatus), default=AvatarReactionStatus.PENDING, nullable=False
    )
    clip_url = Column(String, nullable=True)
    is_predefined = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    avatar = relationship("Avatar", back_populates="reaction_assets")


class AvatarFieldLock(Base):
    __tablename__ = "avatar_field_locks"

    id = Column(Integer, primary_key=True, index=True)
    avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=False, index=True)
    field_path = Column(String(200), nullable=False)
    is_locked = Column(Boolean, default=True, nullable=False)

    avatar = relationship("Avatar", back_populates="field_locks")


class AvatarAttachment(Base):
    __tablename__ = "avatar_attachments"

    id = Column(Integer, primary_key=True, index=True)
    avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    avatar = relationship("Avatar", back_populates="attachments")
