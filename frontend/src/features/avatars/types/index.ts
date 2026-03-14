export type AvatarStatusTone = "amber" | "red" | "green" | "blue";
export type AvatarType = "draft" | "deployment";

export interface AvatarIndustry {
  id: number;
  name: string;
  description?: string;
}

export interface AvatarDraft {
  id: number;
  name: string | null;
  build_state: string;
  updated_at: string;
  active_card_image_url: string | null;
  industry_id: number | null;
  ownership_scope: string;
}

export interface AvatarDeployment {
  id: number;
  name: string | null;
  age: number | null;
  role_paragraph: string | null;
  description: string | null;
  backstory: string | null;
  communication_principles: string | null;
  industry_id: number | null;
  active_card_image_url: string | null;
  build_state: string;
  is_public: boolean;
  ownership_scope: string;
  source_type: string;
  source_avatar_id: number | null;
  clone_count: number;
  created_at: string;
  updated_at: string;
}

export interface ExploreAvatar {
  id: number;
  name: string | null;
  age: number | null;
  description: string | null;
  role_paragraph: string | null;
  active_card_image_url: string | null;
  industry: AvatarIndustry | null;
  clone_count: number;
  is_public: boolean;
  created_at: string;
}

export interface Attachment {
  id: number;
  avatar_id: number;
  filename: string;
  url: string;
  file_type: string;
  created_at: string;
}

export type AvatarCard = AvatarDraft | AvatarDeployment;
