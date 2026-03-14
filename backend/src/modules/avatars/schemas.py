from pydantic import BaseModel, Field
from typing import Optional
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
    pass


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
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
