export type AvatarBuildState =
  | "draft_visual"
  | "draft_appearance"
  | "training_lora"
  | "failed_training"
  | "draft_personality"
  | "ready"
  | "soft_deleted";

export type AvatarDeploymentSummary =
  | "not_in_use"
  | "in_use"
  | "partially_paused"
  | "fully_paused";

export interface AvatarIndustry {
  id: number;
  name: string;
  description?: string;
}

export interface AvatarTrainingSummary {
  status: string;
  training_attempt_count: number;
  training_error_code?: string | null;
  training_started_at?: string | null;
  training_completed_at?: string | null;
}

export interface AvatarFieldLock {
  id: number;
  field_path: string;
  is_locked: boolean;
}

export interface AvatarCardModel {
  id: number;
  name: string | null;
  age: number | null;
  description: string | null;
  role_paragraph: string | null;
  active_card_image_url: string | null;
  build_state: AvatarBuildState;
  deployment_summary: AvatarDeploymentSummary | null;
  ownership_scope: "personal" | "org";
  source_type: "original" | "clone";
  source_avatar_id: number | null;
  is_public: boolean;
  clone_count: number;
  updated_at: string;
  training_summary: AvatarTrainingSummary | null;
}

export interface AvatarDetailModel extends AvatarCardModel {
  owner_id: string;
  org_id: number | null;
  backstory: string | null;
  communication_principles: string[];
  industry_id: number | null;
  created_at: string;
  field_locks: AvatarFieldLock[];
  personality_payload: Record<string, unknown> | null;
}

export interface AvatarsHubResponse {
  continue_creation: AvatarCardModel[];
  my_avatars: AvatarCardModel[];
  org_avatars: AvatarCardModel[];
}

export interface AvatarsAllResponse {
  avatars: AvatarCardModel[];
  total: number;
}

export interface ExploreAvatar {
  id: number;
  name: string | null;
  age: number | null;
  description: string | null;
  role_paragraph: string | null;
  active_card_image_url: string | null;
  industry: AvatarIndustry | null;
  creator_name: string | null;
  clone_count: number;
  is_public: boolean;
  created_at: string;
}

export interface ExploreResponse {
  avatars: ExploreAvatar[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface Attachment {
  id: number;
  avatar_id: number;
  filename: string;
  url: string;
  file_type: string;
  created_at: string;
}

export interface BindingActionResponse {
  avatar_id: number;
  deployment_summary: AvatarDeploymentSummary;
  updated_automation_ids: number[];
}
