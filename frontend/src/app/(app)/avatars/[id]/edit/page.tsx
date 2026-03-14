"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PageContainer, PageHeader, SectionHeading } from "@/shared/ui/layout";
import {
  deleteAvatar,
  getAvatar,
  getReferenceSlots,
  toggleAvatarVisibility,
  updateAvatar,
} from "@/features/avatars/services/avatarApi";
import type { AvatarDetailModel } from "@/features/avatars/types";

function isLocked(avatar: AvatarDetailModel, field: string): boolean {
  return avatar.field_locks.some((lock) => lock.field_path === field && lock.is_locked);
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
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

    void Promise.all([getAvatar(avatarId), getReferenceSlots(id)])
      .then(([avatarResponse, referenceSlots]) => {
        setAvatar(avatarResponse);
        setReferenceCount(referenceSlots.length);
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
        complete_avatar: true,
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
      setError(visibilityError instanceof Error ? visibilityError.message : "Failed to toggle visibility");
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
        <p className="text-sm text-muted">Loading avatar...</p>
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
      {notice && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}

      <section className="mb-8">
        <SectionHeading title="Step 1 — Visual Identity" description="Read-only for completed avatars" />
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative h-64 w-full overflow-hidden rounded-xl border border-border md:w-52">
              {avatar.active_card_image_url ? (
                <Image src={avatar.active_card_image_url} alt={avatar.name || "Avatar"} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted">No base image selected</div>
              )}
            </div>
            <div className="flex-1 space-y-2 text-sm text-muted">
              <p>
                Build state: <span className="font-semibold text-ink">{avatar.build_state}</span>
              </p>
              <p>
                Source type: <span className="font-semibold text-ink">{avatar.source_type}</span>
              </p>
              <p>
                Visual profile snapshot: <span className="font-semibold text-ink">{avatar.source_avatar_id || "N/A"}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <SectionHeading title="Step 2 — Finalize Appearance" description="Read-only status" />
        <div className="rounded-2xl border border-border bg-white p-5 text-sm text-muted">
          <p>
            Reference slots: <span className="font-semibold text-ink">{referenceCount} / 15</span>
          </p>
          <p>
            Training status:{" "}
            <span className="font-semibold text-ink">{avatar.training_summary?.status || "not_started"}</span>
          </p>
          <p>
            Training attempts:{" "}
            <span className="font-semibold text-ink">{avatar.training_summary?.training_attempt_count || 0}</span>
          </p>
        </div>
      </section>

      <section>
        <SectionHeading title="Step 3 — Personality" description="Editable fields" />
        <div className="space-y-4 rounded-2xl border border-border bg-white p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isLocked(avatar, "name")}
                className="rounded-lg border border-border px-3 py-2 disabled:bg-slate-100"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Age
              <input
                value={age}
                onChange={(event) => setAge(event.target.value)}
                disabled={isLocked(avatar, "age")}
                className="rounded-lg border border-border px-3 py-2 disabled:bg-slate-100"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isLocked(avatar, "description")}
              rows={3}
              className="rounded-lg border border-border px-3 py-2 disabled:bg-slate-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Backstory
            <textarea
              value={backstory}
              onChange={(event) => setBackstory(event.target.value)}
              disabled={isLocked(avatar, "backstory")}
              rows={5}
              className="rounded-lg border border-border px-3 py-2 disabled:bg-slate-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Communication Principles (one per line)
            <textarea
              value={communicationPrinciples}
              onChange={(event) => setCommunicationPrinciples(event.target.value)}
              disabled={isLocked(avatar, "communication_principles")}
              rows={4}
              className="rounded-lg border border-border px-3 py-2 disabled:bg-slate-100"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Industry ID
              <input
                value={industryId}
                onChange={(event) => setIndustryId(event.target.value)}
                disabled={isLocked(avatar, "industry_id")}
                className="rounded-lg border border-border px-3 py-2 disabled:bg-slate-100"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Role Paragraph
              <input
                value={roleParagraph}
                onChange={(event) => setRoleParagraph(event.target.value)}
                disabled={isLocked(avatar, "role_paragraph")}
                className="rounded-lg border border-border px-3 py-2 disabled:bg-slate-100"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => void saveChanges()}
              disabled={isSaving}
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>

            <button
              onClick={() => void completeAvatar()}
              disabled={isSaving}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Complete Avatar
            </button>

            <button
              onClick={() => void toggleVisibility()}
              disabled={isSaving || avatar.build_state !== "ready"}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50"
            >
              {avatar.is_public ? "Make Private" : "Make Public"}
            </button>

            <button
              onClick={() => void removeAvatar()}
              disabled={isSaving}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
            >
              Delete Avatar
            </button>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
