from datetime import datetime
from typing import Any, Dict, List, Optional, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


BuildState = Literal[
    "draft_visual",
    "draft_appearance",
    "training_lora",
    "failed_training",
    "draft_personality",
    "ready",
    "soft_deleted",
]
DeploymentSummary = Literal[
    "not_in_use", "in_use", "partially_paused", "fully_paused"
]
AspectRatio = Literal["1:1", "3:4", "4:3", "9:16", "16:9"]
OwnershipScope = Literal["personal", "org"]


class IndustryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AvatarFieldLockInput(BaseModel):
    field_path: str = Field(min_length=1, max_length=200)
    is_locked: bool = True


class AvatarFieldLockResponse(AvatarFieldLockInput):
    id: int

    model_config = ConfigDict(from_attributes=True)


class AvatarTrainingSummary(BaseModel):
    status: str
    training_attempt_count: int = 0
    training_error_code: Optional[str] = None
    training_started_at: Optional[datetime] = None
    training_completed_at: Optional[datetime] = None


class AvatarBaseResponse(BaseModel):
    id: int
    name: Optional[str] = None
    age: Optional[int] = None
    description: Optional[str] = None
    role_paragraph: Optional[str] = None
    active_card_image_url: Optional[str] = None
    build_state: BuildState
    deployment_summary: Optional[DeploymentSummary] = None
    ownership_scope: str
    source_type: str
    source_avatar_id: Optional[int] = None
    is_public: bool
    clone_count: int = 0
    updated_at: datetime
    training_summary: Optional[AvatarTrainingSummary] = None


class AvatarCardResponse(AvatarBaseResponse):
    pass


class AvatarDetailResponse(AvatarBaseResponse):
    owner_id: str
    org_id: Optional[int] = None
    backstory: Optional[str] = None
    communication_principles: List[str] = Field(default_factory=list)
    industry_id: Optional[int] = None
    created_at: datetime
    field_locks: List[AvatarFieldLockResponse] = Field(default_factory=list)
    personality_payload: Optional[Dict[str, Any]] = None


class AvatarsHubResponse(BaseModel):
    continue_creation: List[AvatarCardResponse]
    my_avatars: List[AvatarCardResponse]
    org_avatars: List[AvatarCardResponse]


class AvatarAllResponse(BaseModel):
    avatars: List[AvatarCardResponse]
    total: int


class ExploreAvatarResponse(BaseModel):
    id: int
    name: Optional[str] = None
    age: Optional[int] = None
    description: Optional[str] = None
    role_paragraph: Optional[str] = None
    active_card_image_url: Optional[str] = None
    industry: Optional[IndustryResponse] = None
    creator_name: Optional[str] = None
    clone_count: int = 0
    is_public: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExploreResponse(BaseModel):
    avatars: List[ExploreAvatarResponse]
    next_cursor: Optional[str] = None
    has_more: bool = False


class AvatarDraftCreate(BaseModel):
    ownership_scope: OwnershipScope = Field(default="personal")
    org_id: Optional[int] = None


class AvatarPersonalityPayload(BaseModel):
    backstory: Optional[str] = Field(default=None, min_length=80, max_length=800)
    communication_principles: List[str] = Field(default_factory=list)
    wardrobe_items: List[str] = Field(default_factory=list)
    environment_items: List[str] = Field(default_factory=list)
    hobbies: List[str] = Field(default_factory=list)
    phrases: List[str] = Field(default_factory=list)
    gestures_text: Optional[str] = Field(default=None, max_length=400)
    reactions: List[Dict[str, Any]] = Field(default_factory=list)
    voice_config: Dict[str, Any] = Field(default_factory=dict)
    tone_tags: List[str] = Field(default_factory=list)

    @field_validator("communication_principles")
    @classmethod
    def validate_communication_principles(cls, v: List[str]) -> List[str]:
        if len(v) > 8:
            raise ValueError("communication_principles must contain at most 8 items")
        for item in v:
            if len(item) < 5 or len(item) > 140:
                raise ValueError(
                    "each communication principle must be 5-140 characters"
                )
        return v

    @field_validator("wardrobe_items")
    @classmethod
    def validate_wardrobe_items(cls, v: List[str]) -> List[str]:
        if len(v) > 12:
            raise ValueError("wardrobe_items must contain at most 12 items")
        return v

    @field_validator("environment_items")
    @classmethod
    def validate_environment_items(cls, v: List[str]) -> List[str]:
        if len(v) > 12:
            raise ValueError("environment_items must contain at most 12 items")
        return v

    @field_validator("hobbies")
    @classmethod
    def validate_hobbies(cls, v: List[str]) -> List[str]:
        if len(v) > 10:
            raise ValueError("hobbies must contain at most 10 items")
        return v

    @field_validator("phrases")
    @classmethod
    def validate_phrases(cls, v: List[str]) -> List[str]:
        if len(v) > 20:
            raise ValueError("phrases must contain at most 20 items")
        return v

    @field_validator("reactions")
    @classmethod
    def validate_reactions(cls, v: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        custom_reactions = [item for item in v if not item.get("is_predefined")]
        if len(custom_reactions) > 4:
            raise ValueError("custom reactions must contain at most 4 items")
        return v

    @field_validator("tone_tags")
    @classmethod
    def validate_tone_tags(cls, v: List[str]) -> List[str]:
        if len(v) > 13:
            raise ValueError("tone_tags must contain at most 13 total items")
        return v


class AvatarUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=40)
    age: Optional[int] = Field(default=None, ge=1, le=120)
    description: Optional[str] = Field(default=None, min_length=20, max_length=240)
    backstory: Optional[str] = Field(default=None, min_length=80, max_length=800)
    communication_principles: Optional[List[str]] = None
    industry_id: Optional[int] = None
    role_paragraph: Optional[str] = None
    personality_payload: Optional[AvatarPersonalityPayload] = None
    command: Optional[Literal["save_draft", "complete_avatar", "save_and_exit"]] = None
    complete_avatar: bool = False

    @field_validator("communication_principles")
    @classmethod
    def validate_communication_principles(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        if len(v) > 8:
            raise ValueError("communication_principles must contain at most 8 items")
        for item in v:
            if len(item) < 5 or len(item) > 140:
                raise ValueError(
                    "each communication principle must be 5-140 characters"
                )
        return v


class GenerateBaseRequest(BaseModel):
    prompt: str = Field(min_length=2)
    age: Optional[int] = Field(default=None, ge=1, le=120)
    model: Literal["openai_image_1_5", "google_nano_banana_2", "seedream_v5"]
    aspect_ratio: AspectRatio = "16:9"


class EditBaseRequest(BaseModel):
    prompt: str = Field(min_length=2)
    age: Optional[int] = Field(default=None, ge=1, le=120)
    model: Literal["openai_image_1_5", "google_nano_banana_2", "seedream_v5"]
    reference_image_urls: Optional[List[str]] = None
    mask_image_url: Optional[str] = None
    aspect_ratio: Optional[AspectRatio] = None


class GenerationResponse(BaseModel):
    version_id: Optional[int] = None
    version_number: Optional[int] = None
    image_url: Optional[str] = None
    prompt: str
    model: str
    aspect_ratio: str


class AsyncAcceptedResponse(BaseModel):
    accepted: bool = True
    operation_id: str
    avatar_id: int
    operation: Literal[
        "generate_base",
        "edit_base",
        "generate_references",
        "train_lora",
        "retry_lora",
    ]
    started_at: datetime


class VisualVersionResponse(BaseModel):
    id: int
    version_number: int
    image_url: str
    prompt: str
    model_used: str
    aspect_ratio: str
    is_active_base: bool
    is_edit: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, protected_namespaces=())


class ReferenceSlotResponse(BaseModel):
    id: int
    slot_key: str
    slot_label: str
    image_url: str
    prompt: str
    aspect_ratio: Optional[str]
    is_refined: bool
    refinement_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenerateReferencesResponse(BaseModel):
    count: int
    slots: List[ReferenceSlotResponse]


class StepReadinessResponse(BaseModel):
    step_id: int
    step_name: str
    is_complete: bool
    can_enter: bool
    blocked_reasons: List[str] = Field(default_factory=list)


class AvatarReadinessResponse(BaseModel):
    avatar_id: int
    build_state: BuildState
    current_step: int
    can_complete_avatar: bool
    completion_blockers: List[str] = Field(default_factory=list)
    steps: List[StepReadinessResponse] = Field(default_factory=list)


class ToggleVisibilityRequest(BaseModel):
    is_public: bool
    field_locks: List[AvatarFieldLockInput] = Field(default_factory=list)
    use_as_is_only: bool = False


class DeployRequest(BaseModel):
    automation_ids: List[int] = Field(min_length=1)
    confirm_replace: bool = False


class PauseRequest(BaseModel):
    automation_ids: Optional[List[int]] = None


class BindingActionResponse(BaseModel):
    avatar_id: int
    deployment_summary: DeploymentSummary
    updated_automation_ids: List[int]


class ToggleVisibilityResponse(BaseModel):
    avatar: AvatarDetailResponse


class CloneResponse(BaseModel):
    avatar: AvatarDetailResponse


class RetryLoraResponse(BaseModel):
    avatar: AvatarDetailResponse


class AttachmentResponse(BaseModel):
    id: int
    avatar_id: int
    filename: str
    url: str
    file_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RestoreResponse(BaseModel):
    avatar: AvatarDetailResponse
