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

export type VideoStatus = "draft" | "rendering" | "ready" | "failed";

export type AutomationStatus = "draft" | "active" | "paused";

export interface Avatar {
  id: number;
  owner_id: string;
  org_id?: number;
  ownership_scope: "personal" | "org";
  source_type: "original" | "clone";
  source_avatar_id?: number;
  visual_profile_snapshot_id?: number;
  build_state: AvatarBuildState;
  name: string;
  age?: number;
  description?: string;
  backstory?: string;
  communication_principles?: string[];
  industry_id?: number;
  role_paragraph?: string;
  active_card_image_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvatarCreate {
  name?: string;
  age?: number;
  description?: string;
  backstory?: string;
  communication_principles?: string[];
  industry_id?: number;
  role_paragraph?: string;
}

export interface AvatarUpdate extends Partial<AvatarCreate> {}

export interface Industry {
  id: number;
  name: string;
  description: string;
  avatar_count?: number;
  event_count?: number;
}

export interface Script {
  id: number;
  title: string;
  avatar_id: number;
  avatar_name?: string;
  industry_id: number;
  industry_name?: string;
  duration: string;
  status: "draft" | "generating" | "ready";
  created_at: string;
}

export interface Video {
  id: number;
  title: string;
  avatar_id: number;
  avatar_name?: string;
  duration: string;
  status: VideoStatus;
  progress?: number;
  thumbnail_url?: string;
  created_at: string;
}

export interface Automation {
  id: number;
  name: string;
  schedule: string;
  avatar_id: number;
  avatar_name?: string;
  status: AutomationStatus;
  videos_generated: number;
  last_run?: string;
}
