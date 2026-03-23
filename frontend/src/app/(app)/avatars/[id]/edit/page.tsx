"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PageContainer, PageHeader, SectionHeading } from "@/shared/ui/layout";
import {
  deleteAvatar,
  getAvatar,
  getReferenceSlots,
  listAvatarIndustries,
  toggleAvatarVisibility,
  updateAvatar,
} from "@/features/avatars/services/avatarApi";
import type { AvatarDetailModel, AvatarIndustry } from "@/features/avatars/types";
import {
  pipelineAccentButtonClass,
  pipelineDangerButtonClass,
  pipelineInputClass,
  pipelineLabelClass,
  pipelinePanelClass,
  pipelinePrimaryButtonClass,
  pipelineSecondaryButtonClass,
  pipelineSelectClass,
  pipelineTextareaClass,
} from "@/features/avatars/components/creation/pipelineControls";
import { cn } from "@/shared/lib/utils";

function isLocked(avatar: AvatarDetailModel, field: string): boolean {
  return avatar.field_locks.some((lock) => lock.field_path === field && lock.is_locked);
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function lockReason(avatar: AvatarDetailModel, field: string): string | null {
  if (!isLocked(avatar, field)) return null;
  return "Locked by the source avatar settings.";
}

function InfoChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8ca1c5]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#1a3a2a]">{value}</p>
    </div>
  );
}

export default function AvatarEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [avatar, setAvatar] = useState<AvatarDetailModel | null>(null);
  const [referenceCount, setReferenceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [backstory, setBackstory] = useState("");
  const [communicationPrinciples, setCommunicationPrinciples] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [roleParagraph, setRoleParagraph] = useState("");
  const [industries, setIndustries] = useState<AvatarIndustry[]>([]);

  useEffect(() => {
    const avatarId = Number(id);
    if (Number.isNaN(avatarId)) {
      setError("Invalid avatar ID");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotice(null);

    void Promise.all([getAvatar(avatarId), getReferenceSlots(id), listAvatarIndustries()])
      .then(([avatarResponse, referenceSlots, industryOptions]) => {
        setAvatar(avatarResponse);
        setReferenceCount(referenceSlots.length);
        setIndustries(industryOptions);
        setName(avatarResponse.name || "");
        setAge(avatarResponse.age?.toString() || "");
        setDescription(avatarResponse.description || "");
        setBackstory(avatarResponse.backstory || "");
        setCommunicationPrinciples((avatarResponse.communication_principles || []).join("\n"));
        setIndustryId(avatarResponse.industry_id?.toString() || "");
        setRoleParagraph(avatarResponse.role_paragraph || "");
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load avatar");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const lockInfo = useMemo(() => {
    if (!avatar || avatar.source_type !== "clone") return null;
    const locked = avatar.field_locks.filter((item) => item.is_locked).map((item) => item.field_path);
    return locked.length > 0 ? locked : null;
  }, [avatar]);

  const saveChanges = async () => {
    if (!avatar) return;

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateAvatar(avatar.id, {
        name,
        age: age ? Number(age) : null,
        description,
        backstory,
        communication_principles: splitLines(communicationPrinciples),
        industry_id: industryId ? Number(industryId) : null,
        role_paragraph: roleParagraph,
        command: "save_draft",
      });
      setAvatar(updated);
      setNotice("Avatar details saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save avatar");
    } finally {
      setIsSaving(false);
    }
  };

  const completeAvatar = async () => {
    if (!avatar) return;

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateAvatar(avatar.id, {
        name,
        age: age ? Number(age) : null,
        description,
        backstory,
        communication_principles: splitLines(communicationPrinciples),
        industry_id: industryId ? Number(industryId) : null,
        role_paragraph: roleParagraph,
        command: "complete_avatar",
      });
      setAvatar(updated);
      setNotice("Avatar marked as complete.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to complete avatar");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisibility = async () => {
    if (!avatar) return;

    setIsSaving(true);
    setError(null);

    try {
      const updated = await toggleAvatarVisibility(avatar.id, {
        is_public: !avatar.is_public,
      });
      setAvatar(updated.avatar);
      setNotice(updated.avatar.is_public ? "Avatar is now public." : "Avatar is now private.");
    } catch (visibilityError) {
      setError(
        visibilityError instanceof Error
          ? visibilityError.message
          : "Failed to toggle visibility"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const removeAvatar = async () => {
    if (!avatar) return;

    setIsSaving(true);
    setError(null);

    try {
      await deleteAvatar(avatar.id);
      router.push("/avatars");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete avatar");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-full items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#3c9f95] border-t-transparent" />
        </div>
      </PageContainer>
    );
  }

  if (!avatar) {
    return (
      <PageContainer>
        <p className="text-sm text-muted">Avatar not found.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={avatar.name || "Edit Avatar"}
        subtitle="Step 1 and 2 are read-only. Step 3 fields remain editable."
      />

      {lockInfo && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          This clone has locked fields: {lockInfo.join(", ")}
        </div>
      )}

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}

      <section className="mb-8">
        <SectionHeading title="Step 1 — Visual Identity" description="Read-only for completed avatars" />
        <div className={cn(pipelinePanelClass, "p-5 md:p-6") }>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
            <div className="relative h-64 overflow-hidden rounded-2xl border border-[#d6dbd4] bg-[#f4f7f5]">
              {avatar.active_card_image_url ? (
                <Image src={avatar.active_card_image_url} alt={avatar.name || "Avatar"} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#5c6d66]">
                  No base image selected
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoChip label="Build State" value={avatar.build_state} />
              <InfoChip label="Source Type" value={avatar.source_type} />
              <InfoChip label="Ownership" value={avatar.ownership_scope} />
              <InfoChip label="Visual Snapshot" value={avatar.source_avatar_id || "N/A"} />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <SectionHeading title="Step 2 — Finalize Appearance" description="Read-only status" />
        <div className={cn(pipelinePanelClass, "grid grid-cols-1 gap-3 p-5 md:grid-cols-3 md:p-6") }>
          <InfoChip label="Reference Slots" value={`${referenceCount} / 15`} />
          <InfoChip
            label="Training Status"
            value={avatar.training_summary?.status || "not_started"}
          />
          <InfoChip
            label="Training Attempts"
            value={avatar.training_summary?.training_attempt_count || 0}
          />
        </div>
      </section>

      <section>
        <SectionHeading title="Step 3 — Personality" description="Editable fields" />
        <div className={cn(pipelinePanelClass, "space-y-4 p-5 md:p-6") }>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className={pipelineLabelClass}>Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isLocked(avatar, "name")}
                className={cn(pipelineInputClass, isLocked(avatar, "name") && "bg-slate-100")}
              />
              {lockReason(avatar, "name") && (
                <span className="text-xs text-amber-700">{lockReason(avatar, "name")}</span>
              )}
            </label>

            <label className="space-y-2">
              <span className={pipelineLabelClass}>Age</span>
              <input
                value={age}
                onChange={(event) => setAge(event.target.value)}
                disabled={isLocked(avatar, "age")}
                className={cn(pipelineInputClass, isLocked(avatar, "age") && "bg-slate-100")}
              />
              {lockReason(avatar, "age") && (
                <span className="text-xs text-amber-700">{lockReason(avatar, "age")}</span>
              )}
            </label>
          </div>

          <label className="space-y-2">
            <span className={pipelineLabelClass}>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isLocked(avatar, "description")}
              rows={3}
              className={cn(pipelineTextareaClass, isLocked(avatar, "description") && "bg-slate-100")}
            />
            {lockReason(avatar, "description") && (
              <span className="text-xs text-amber-700">{lockReason(avatar, "description")}</span>
            )}
          </label>

          <label className="space-y-2">
            <span className={pipelineLabelClass}>Backstory</span>
            <textarea
              value={backstory}
              onChange={(event) => setBackstory(event.target.value)}
              disabled={isLocked(avatar, "backstory")}
              rows={5}
              className={cn(pipelineTextareaClass, isLocked(avatar, "backstory") && "bg-slate-100")}
            />
            {lockReason(avatar, "backstory") && (
              <span className="text-xs text-amber-700">{lockReason(avatar, "backstory")}</span>
            )}
          </label>

          <label className="space-y-2">
            <span className={pipelineLabelClass}>Communication Principles (one per line)</span>
            <textarea
              value={communicationPrinciples}
              onChange={(event) => setCommunicationPrinciples(event.target.value)}
              disabled={isLocked(avatar, "communication_principles")}
              rows={4}
              className={cn(
                pipelineTextareaClass,
                isLocked(avatar, "communication_principles") && "bg-slate-100"
              )}
            />
            {lockReason(avatar, "communication_principles") && (
              <span className="text-xs text-amber-700">
                {lockReason(avatar, "communication_principles")}
              </span>
            )}
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className={pipelineLabelClass}>Industry</span>
              <select
                value={industryId}
                onChange={(event) => setIndustryId(event.target.value)}
                disabled={isLocked(avatar, "industry_id")}
                className={cn(pipelineSelectClass, isLocked(avatar, "industry_id") && "bg-slate-100")}
              >
                <option value="">Select Industry</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
              {lockReason(avatar, "industry_id") && (
                <span className="text-xs text-amber-700">{lockReason(avatar, "industry_id")}</span>
              )}
            </label>

            <label className="space-y-2">
              <span className={pipelineLabelClass}>Role Paragraph</span>
              <input
                value={roleParagraph}
                onChange={(event) => setRoleParagraph(event.target.value)}
                disabled={isLocked(avatar, "role_paragraph")}
                className={cn(pipelineInputClass, isLocked(avatar, "role_paragraph") && "bg-slate-100")}
              />
              {lockReason(avatar, "role_paragraph") && (
                <span className="text-xs text-amber-700">{lockReason(avatar, "role_paragraph")}</span>
              )}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-4">
            <button
              type="button"
              onClick={() => {
                void saveChanges();
              }}
              disabled={isSaving}
              className={pipelinePrimaryButtonClass}
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={() => {
                void completeAvatar();
              }}
              disabled={isSaving}
              className={pipelineAccentButtonClass}
            >
              Complete Avatar
            </button>

            <button
              type="button"
              onClick={() => {
                void toggleVisibility();
              }}
              disabled={isSaving || avatar.build_state !== "ready"}
              className={pipelineSecondaryButtonClass}
            >
              {avatar.is_public ? "Make Private" : "Make Public"}
            </button>

            <button
              type="button"
              onClick={() => {
                void removeAvatar();
              }}
              disabled={isSaving}
              className={pipelineDangerButtonClass}
            >
              Delete Avatar
            </button>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
