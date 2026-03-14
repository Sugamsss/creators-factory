from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AvatarBase(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=1, le=120)
    description: Optional[str] = Field(None, max_length=240)
    backstory: Optional[str] = Field(None, max_length=800)
    communication_principles: Optional[str] = None
    industry_id: Optional[int] = None
    role_paragraph: Optional[str] = None
    active_card_image_url: Optional[str] = None


class AvatarCreate(AvatarBase):
    ownership_scope: Optional[str] = "personal"


class AvatarUpdate(AvatarBase):
    pass


class AvatarResponse(AvatarBase):
    id: int
    owner_id: str
    org_id: Optional[int] = None
    ownership_scope: str
    source_type: str
    source_avatar_id: Optional[int] = None
    build_state: str
    is_public: bool
    clone_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IndustryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class AvatarDraftResponse(BaseModel):
    id: int
    name: Optional[str]
    build_state: str
    updated_at: datetime
    active_card_image_url: Optional[str] = None
    industry_id: Optional[int] = None
    ownership_scope: str

    class Config:
        from_attributes = True


class AvatarDeploymentResponse(BaseModel):
    id: int
    name: Optional[str]
    age: Optional[int]
    role_paragraph: Optional[str]
    description: Optional[str]
    backstory: Optional[str]
    communication_principles: Optional[str]
    industry_id: Optional[int]
    active_card_image_url: Optional[str]
    build_state: str
    is_public: bool
    ownership_scope: str
    source_type: str
    source_avatar_id: Optional[int]
    clone_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExploreAvatarResponse(BaseModel):
    id: int
    name: Optional[str]
    age: Optional[int]
    description: Optional[str]
    role_paragraph: Optional[str]
    active_card_image_url: Optional[str]
    industry: Optional[IndustryResponse] = None
    clone_count: int = 0
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ExploreResponse(BaseModel):
    avatars: List[ExploreAvatarResponse]
    next_cursor: Optional[str] = None
    has_more: bool = False


class GenerateBaseRequest(BaseModel):
    prompt: str
    age: Optional[int] = None
    model: str = Field(
        ..., pattern="^(openai_image_1_5|google_nano_banana_2|seedream_v5)$"
    )
    aspect_ratio: str = "16:9"


class EditBaseRequest(BaseModel):
    prompt: str
    age: Optional[int] = None
    model: str = Field(
        ..., pattern="^(openai_image_1_5|google_nano_banana_2|seedream_v5)$"
    )
    reference_image_url: Optional[str] = None
    mask_image_url: Optional[str] = None
    aspect_ratio: Optional[str] = None


class GenerateReferenceRequest(BaseModel):
    slot_key: str
    prompt: str


class RefineVariantRequest(BaseModel):
    variant_id: int
    prompt: str


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

    class Config:
        from_attributes = True


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

    class Config:
        from_attributes = True


class GenerationResponse(BaseModel):
    version_id: int
    version_number: int
    image_url: str
    prompt: str
    model: str
    aspect_ratio: str


class ReferenceGenerationResponse(BaseModel):
    slot_id: int
    slot_key: str
    image_url: str
    prompt: str


class BatchGenerationResponse(BaseModel):
    count: int
    variants: List[ReferenceGenerationResponse]


class AttachmentResponse(BaseModel):
    id: int
    avatar_id: int
    filename: str
    url: str
    file_type: str
    created_at: datetime

    class Config:
        from_attributes = True
