import { apiRequest } from "@/shared/lib/api-client";
import type {
  AvatarDeployment,
  AvatarDraft,
  AvatarIndustry,
  Attachment,
  ExploreAvatar,
} from "../types";
import type { AutomationItem } from "../../automations/types";

export interface ExploreResponse {
  avatars: ExploreAvatar[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface VisualVersion {
  id: number;
  version_number: number;
  image_url: string;
  prompt: string;
  model_used: string;
  aspect_ratio: string;
  is_active_base: boolean;
  is_edit: boolean;
}

export interface ReferenceSlot {
  id: number;
  slot_key: string;
  slot_label: string;
  image_url: string;
  is_refined: boolean;
}

export interface GenerationPayload {
  prompt: string;
  model: "openai_image_1_5" | "google_nano_banana_2" | "seedream_v5";
  aspect_ratio: string;
  age?: number | null;
}

export interface EditGenerationPayload extends GenerationPayload {
  reference_image_url?: string | null;
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

export async function getDrafts(): Promise<AvatarDraft[]> {
  return apiRequest<AvatarDraft[]>("/avatars/drafts");
}

export async function createAvatar(): Promise<AvatarDraft> {
  return apiRequest<AvatarDraft>("/avatars/drafts", {
    method: "POST",
    body: JSON.stringify({ ownership_scope: "personal" }),
  });
}

export async function getMyAvatars(): Promise<AvatarDeployment[]> {
  return apiRequest<AvatarDeployment[]>("/avatars/my");
}

export async function getOrgAvatars(): Promise<AvatarDeployment[]> {
  return apiRequest<AvatarDeployment[]>("/avatars/org");
}

export async function getExploreAvatars(options: {
  search?: string;
  industryId?: number;
  sort?: "featured" | "popular" | "newest";
  cursor?: string;
  limit?: number;
}): Promise<ExploreResponse> {
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

export async function cloneAvatar(sourceAvatarId: number): Promise<AvatarDeployment> {
  return apiRequest<AvatarDeployment>(`/avatars/clone/${sourceAvatarId}`, {
    method: "POST",
  });
}

export async function toggleAvatarPublic(avatarId: number): Promise<AvatarDeployment> {
  return apiRequest<AvatarDeployment>(`/avatars/${avatarId}/toggle-public`, {
    method: "POST",
  });
}

export async function retryAvatarTraining(avatarId: number): Promise<AvatarDeployment> {
  return apiRequest<AvatarDeployment>(`/avatars/${avatarId}/retry-training`, {
    method: "POST",
  });
}

export async function deleteAvatar(avatarId: number): Promise<void> {
  await apiRequest<void>(`/avatars/${avatarId}`, { method: "DELETE" });
}

export async function removeAvatarFromOrg(
  avatarId: number
): Promise<AvatarDeployment> {
  return apiRequest<AvatarDeployment>(`/avatars/${avatarId}/remove-org`, {
    method: "POST",
  });
}

export async function getAvatarAutomations(avatarId: number): Promise<AutomationItem[]> {
  return apiRequest<AutomationItem[]>(`/automations/avatar/${avatarId}`);
}

export async function deleteAutomation(automationId: number): Promise<void> {
  await apiRequest<void>(`/automations/${automationId}`, { method: "DELETE" });
}

export async function getAvatar(avatarId: number): Promise<AvatarDeployment> {
  return apiRequest<AvatarDeployment>(`/avatars/${avatarId}`);
}

export async function updateAvatar(
  avatarId: number,
  data: Partial<AvatarDeployment>
): Promise<AvatarDeployment> {
  return apiRequest<AvatarDeployment>(`/avatars/${avatarId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getVisualVersions(avatarId: string): Promise<VisualVersion[]> {
  return apiRequest<VisualVersion[]>(`/avatars/${avatarId}/visual-versions`);
}

export async function generateBaseImage(
  avatarId: string,
  payload: GenerationPayload
): Promise<GenerationResponse> {
  return apiRequest<GenerationResponse>(`/avatars/${avatarId}/generate-base`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function editBaseImage(
  avatarId: string,
  payload: EditGenerationPayload
): Promise<GenerationResponse> {
  return apiRequest<GenerationResponse>(`/avatars/${avatarId}/edit-base`, {
    method: "POST",
    body: JSON.stringify(payload),
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

export async function generateAllReferences(avatarId: string): Promise<void> {
  await apiRequest(`/avatars/${avatarId}/generate-all-references`, {
    method: "POST",
  });
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
