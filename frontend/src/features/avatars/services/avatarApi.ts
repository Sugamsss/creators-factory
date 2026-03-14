import { apiRequest } from "@/shared/lib/api-client";
import type {
  Attachment,
  AvatarDetailModel,
  AvatarsAllResponse,
  AvatarsHubResponse,
  AvatarIndustry,
  BindingActionResponse,
  ExploreResponse,
} from "../types";

export interface VisualVersion {
  id: number;
  version_number: number;
  image_url: string;
  prompt: string;
  model_used: string;
  aspect_ratio: string;
  is_active_base: boolean;
  is_edit: boolean;
  created_at: string;
}

export interface ReferenceSlot {
  id: number;
  slot_key: string;
  slot_label: string;
  image_url: string;
  prompt: string;
  aspect_ratio: string | null;
  is_refined: boolean;
  refinement_count: number;
  created_at: string;
}

export interface GenerationPayload {
  prompt: string;
  model: "openai_image_1_5" | "google_nano_banana_2" | "seedream_v5";
  aspect_ratio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  age: number;
}

export interface EditGenerationPayload extends GenerationPayload {
  reference_image_urls?: string[] | null;
  mask_image_url?: string | null;
}

export interface GenerationResponse {
  version_id: number;
  version_number: number;
  image_url: string;
  prompt: string;
  model: string;
  aspect_ratio: string;
}

export interface AutomationBindingItem {
  id: number;
  avatar_id: number;
  name: string;
  schedule: string | null;
  status: "active" | "paused";
  videos_generated: number;
  last_run: string | null;
}

export interface PersonalityPayload {
  backstory?: string;
  communication_principles?: string[];
  wardrobe_items?: string[];
  environment_items?: string[];
  hobbies?: string[];
  phrases?: string[];
  gestures_text?: string;
  reactions?: Array<Record<string, unknown>>;
  voice_config?: Record<string, unknown>;
  tone_tags?: string[];
}

export interface AvatarUpdatePayload {
  name?: string | null;
  age?: number | null;
  description?: string | null;
  backstory?: string | null;
  communication_principles?: string[];
  industry_id?: number | null;
  role_paragraph?: string | null;
  active_card_image_url?: string | null;
  personality_payload?: PersonalityPayload;
  complete_avatar?: boolean;
}

export interface ToggleVisibilityPayload {
  is_public: boolean;
  field_locks?: Array<{ field_path: string; is_locked: boolean }>;
  use_as_is_only?: boolean;
}

export interface DeployPayload {
  automation_ids: number[];
  confirm_replace?: boolean;
}

export interface PausePayload {
  automation_ids?: number[];
}

export async function createAvatarDraft(
  ownershipScope: "personal" | "org" = "personal",
  orgId?: number
): Promise<AvatarDetailModel> {
  return apiRequest<AvatarDetailModel>("/avatars/drafts", {
    method: "POST",
    body: JSON.stringify({
      ownership_scope: ownershipScope,
      org_id: ownershipScope === "org" ? orgId : undefined,
    }),
  });
}

export async function getAvatarsHub(): Promise<AvatarsHubResponse> {
  return apiRequest<AvatarsHubResponse>("/avatars");
}

export async function getAllAvatars(options: {
  search?: string;
  sourceType?: "original" | "clone";
  visibility?: "public" | "private";
  deploymentSummary?: "not_in_use" | "in_use" | "partially_paused" | "fully_paused";
  sort?: "newest" | "oldest" | "recently_edited" | "alphabetical";
} = {}): Promise<AvatarsAllResponse> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.sourceType) params.set("source_type", options.sourceType);
  if (options.visibility) params.set("visibility", options.visibility);
  if (options.deploymentSummary) params.set("deployment_summary", options.deploymentSummary);
  if (options.sort) params.set("sort", options.sort);
  const qs = params.toString();
  return apiRequest<AvatarsAllResponse>(`/avatars/all${qs ? `?${qs}` : ""}`);
}

export async function getExploreAvatars(options: {
  search?: string;
  industryId?: number;
  sort?: "featured" | "popular" | "newest";
  cursor?: string;
  limit?: number;
} = {}): Promise<ExploreResponse> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.industryId) params.set("industry_id", options.industryId.toString());
  if (options.sort) params.set("sort", options.sort);
  if (options.cursor) params.set("cursor", options.cursor);
  if (options.limit) params.set("limit", options.limit.toString());
  return apiRequest<ExploreResponse>(`/avatars/explore?${params.toString()}`);
}

export async function getIndustries(): Promise<AvatarIndustry[]> {
  return apiRequest<AvatarIndustry[]>("/industries");
}

export async function getAvatar(avatarId: number): Promise<AvatarDetailModel> {
  return apiRequest<AvatarDetailModel>(`/avatars/${avatarId}`);
}

export async function updateAvatar(
  avatarId: number,
  data: AvatarUpdatePayload
): Promise<AvatarDetailModel> {
  return apiRequest<AvatarDetailModel>(`/avatars/${avatarId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAvatar(avatarId: number): Promise<void> {
  await apiRequest<void>(`/avatars/${avatarId}`, { method: "DELETE" });
}

export async function restoreAvatar(avatarId: number): Promise<{ avatar: AvatarDetailModel }> {
  return apiRequest<{ avatar: AvatarDetailModel }>(`/recycle-bin/${avatarId}/restore`, {
    method: "POST",
  });
}

export async function toggleAvatarVisibility(
  avatarId: number,
  payload: ToggleVisibilityPayload
): Promise<{ avatar: AvatarDetailModel }> {
  return apiRequest<{ avatar: AvatarDetailModel }>(`/avatars/${avatarId}/toggle-visibility`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cloneAvatar(avatarId: number): Promise<{ avatar: AvatarDetailModel }> {
  return apiRequest<{ avatar: AvatarDetailModel }>(`/avatars/${avatarId}/clone`, {
    method: "POST",
  });
}

export async function deployAvatar(
  avatarId: number,
  payload: DeployPayload
): Promise<BindingActionResponse> {
  return apiRequest<BindingActionResponse>(`/avatars/${avatarId}/deploy`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listAutomations(): Promise<AutomationBindingItem[]> {
  return apiRequest<AutomationBindingItem[]>("/automations");
}

export async function pauseAvatar(
  avatarId: number,
  payload: PausePayload = {}
): Promise<BindingActionResponse> {
  return apiRequest<BindingActionResponse>(`/avatars/${avatarId}/pause`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getVisualVersions(avatarId: string): Promise<VisualVersion[]> {
  return apiRequest<VisualVersion[]>(`/avatars/${avatarId}/visual-versions`);
}

export async function generateBaseImage(
  avatarId: string,
  payload: GenerationPayload,
  signal?: AbortSignal
): Promise<GenerationResponse> {
  return apiRequest<GenerationResponse>(`/avatars/${avatarId}/generate-base`, {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
  });
}

export async function editBaseImage(
  avatarId: string,
  payload: EditGenerationPayload,
  signal?: AbortSignal
): Promise<GenerationResponse> {
  return apiRequest<GenerationResponse>(`/avatars/${avatarId}/edit-base`, {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
  });
}

export async function setActiveBase(avatarId: string, versionId: number): Promise<void> {
  await apiRequest(`/avatars/${avatarId}/set-active-base/${versionId}`, {
    method: "POST",
  });
}

export async function getReferenceSlots(avatarId: string): Promise<ReferenceSlot[]> {
  return apiRequest<ReferenceSlot[]>(`/avatars/${avatarId}/reference-slots`);
}

export async function generateReferences(avatarId: string): Promise<{ count: number; slots: ReferenceSlot[] }> {
  return apiRequest<{ count: number; slots: ReferenceSlot[] }>(`/avatars/${avatarId}/generate-references`, {
    method: "POST",
  });
}

export async function trainLora(avatarId: string): Promise<AvatarDetailModel> {
  return apiRequest<AvatarDetailModel>(`/avatars/${avatarId}/train-lora`, {
    method: "POST",
  });
}

export async function retryLora(avatarId: number): Promise<{ avatar: AvatarDetailModel }> {
  return apiRequest<{ avatar: AvatarDetailModel }>(`/avatars/${avatarId}/retry-lora`, {
    method: "POST",
  });
}

export function subscribeAvatarEvents(
  avatarId: number,
  onEvent: (eventType: string, payload: Record<string, unknown>) => void,
  onError?: (error: Event) => void
): EventSource {
  const source = new EventSource(`/api/v1/avatars/${avatarId}/events`, {
    withCredentials: true,
  });

  const eventTypes = [
    "avatar.training.started",
    "avatar.training.progress",
    "avatar.training.retrying",
    "avatar.training.failed",
    "avatar.training.completed",
    "avatar.reaction.generation.started",
    "avatar.reaction.generation.completed",
    "avatar.reaction.generation.failed",
  ];

  eventTypes.forEach((eventType) => {
    source.addEventListener(eventType, (event) => {
      if (!(event instanceof MessageEvent)) return;
      try {
        const payload = JSON.parse(event.data) as Record<string, unknown>;
        onEvent(eventType, payload);
      } catch {
        onEvent(eventType, {});
      }
    });
  });

  source.onerror = (error) => {
    if (onError) onError(error);
  };

  return source;
}

export async function attachImage(avatarId: string, file: File): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<Attachment>(`/avatars/${avatarId}/attach-image`, {
    method: "POST",
    body: formData,
  });
}

export async function getAttachments(avatarId: string): Promise<Attachment[]> {
  return apiRequest<Attachment[]>(`/avatars/${avatarId}/attachments`);
}

export async function deleteAttachment(
  avatarId: string,
  attachmentId: number
): Promise<void> {
  await apiRequest<void>(`/avatars/${avatarId}/attachments/${attachmentId}`, {
    method: "DELETE",
  });
}
