"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAvatarReadiness,
  listAvatarIndustries,
  updateAvatar,
  generatePersonalityDraft,
} from "@/features/avatars/services/avatarApi";
import type { AvatarIndustry } from "@/features/avatars/types";
import {
  pipelineAccentButtonClass,
  pipelineInputClass,
  pipelineLabelClass,
  pipelineMutedTextClass,
  pipelinePanelClass,
  pipelinePrimaryButtonClass,
  pipelineSelectClass,
  pipelineStageBadgeClass,
  pipelineTextareaClass,
} from "./pipelineControls";
import { cn } from "@/shared/lib/utils";

interface PersonalityStepProps {
  avatarId: string;
}

export function PersonalityStep({ avatarId }: PersonalityStepProps) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    description: "",
    backstory: "",
    communication_principles: "",
    role_paragraph: "",
    industry_id: "",
  });

  const [industryOptions, setIndustryOptions] = useState<AvatarIndustry[]>([]);
  const [completionBlockers, setCompletionBlockers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const numericAvatarId = Number(avatarId);

  const fetchData = useCallback(async () => {
    try {
      const [avatar, industries, readiness] = await Promise.all([
        getAvatar(numericAvatarId),
        listAvatarIndustries(),
        getAvatarReadiness(numericAvatarId),
      ]);

      setIndustryOptions(industries);
      setCompletionBlockers(readiness.completion_blockers || []);
      setFormData({
        name: avatar.name || "",
        age: avatar.age?.toString() || "",
        description: avatar.description || "",
        backstory: avatar.backstory || "",
        communication_principles: (avatar.communication_principles || []).join("\n"),
        role_paragraph: avatar.role_paragraph || "",
        industry_id: avatar.industry_id ? String(avatar.industry_id) : "",
      });
    } catch (loadError) {
      setMessage(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load avatar personality data."
      );
    } finally {
      setIsLoading(false);
    }
  }, [numericAvatarId]);

  useEffect(() => {
    if (!Number.isInteger(numericAvatarId)) return;
    void fetchData();
  }, [fetchData, numericAvatarId]);

  const save = async (completeAvatar: boolean = false) => {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateAvatar(numericAvatarId, {
        name: formData.name || undefined,
        age: formData.age ? parseInt(formData.age, 10) : null,
        description: formData.description || undefined,
        backstory: formData.backstory || undefined,
        communication_principles: formData.communication_principles
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        industry_id: formData.industry_id ? Number(formData.industry_id) : null,
        role_paragraph: formData.role_paragraph || undefined,
        command: completeAvatar ? "complete_avatar" : "save_draft",
      });

      const latestReadiness = await getAvatarReadiness(numericAvatarId);
      setCompletionBlockers(latestReadiness.completion_blockers || []);
      setMessage(completeAvatar ? "Avatar completed successfully." : "Draft saved successfully.");
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : "Failed to save avatar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsGeneratingDraft(true);
    setMessage("Generating AI draft...");
    try {
      const draft = await generatePersonalityDraft(numericAvatarId);
      setFormData({
        name: draft.name,
        age: String(draft.age),
        description: draft.description,
        backstory: draft.backstory,
        role_paragraph: draft.role_paragraph,
        communication_principles: formData.communication_principles, // Keep existing
        industry_id: formData.industry_id,
      });
      setMessage("AI draft generated. Review and click 'Save Draft' if satisfied.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to generate AI draft.");
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#3c9f95] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto p-4 scrollbar-none lg:p-6">
      <div className="mx-auto w-full max-w-5xl space-y-5 pb-16">
        <header className="sticky top-0 z-20 rounded-2xl border border-[#d6dbd4] bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-2">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3c9f95]" />
                <p className={pipelineStageBadgeClass}>Stage 03: Personality</p>
              </div>
              <h3 className="font-display text-3xl text-[#1a3a2a] lg:text-4xl">Define Personality</h3>
              <p className={pipelineMutedTextClass}>
                Save draft anytime. Complete only after all required fields are valid.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleGenerateDraft}
                disabled={isSaving || isGeneratingDraft}
                className={pipelineSecondaryButtonClass}
              >
                {isGeneratingDraft ? "Generating..." : "AI Generate Profile"}
              </button>
              <button
                type="button"
                onClick={() => {
                  void save(false);
                }}
                disabled={isSaving || isGeneratingDraft}
                className={pipelinePrimaryButtonClass}
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={() => {
                  void save(true);
                }}
                disabled={isSaving || isGeneratingDraft}
                className={pipelineAccentButtonClass}
              >
                Complete Avatar
              </button>
            </div>
          </div>
        </header>

        {message && (
          <div className="rounded-xl border border-[#d6dbd4] bg-white px-4 py-3 text-sm text-[#1a3a2a]">
            {message}
          </div>
        )}

        {completionBlockers.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <p className="font-semibold">Completion blockers</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {completionBlockers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <section className={cn(pipelinePanelClass, "p-6 md:p-8") }>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className={pipelineLabelClass}>Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={pipelineInputClass}
              />
            </label>

            <label className="space-y-2">
              <span className={pipelineLabelClass}>Age</span>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={pipelineInputClass}
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className={pipelineLabelClass}>Description</span>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className={pipelineTextareaClass}
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className={pipelineLabelClass}>Backstory</span>
              <textarea
                name="backstory"
                rows={5}
                value={formData.backstory}
                onChange={handleChange}
                className={pipelineTextareaClass}
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className={pipelineLabelClass}>Communication Principles (one per line)</span>
              <textarea
                name="communication_principles"
                rows={4}
                value={formData.communication_principles}
                onChange={handleChange}
                className={pipelineTextareaClass}
              />
            </label>

            <label className="space-y-2">
              <span className={pipelineLabelClass}>Industry</span>
              <select
                name="industry_id"
                value={formData.industry_id}
                onChange={handleChange}
                className={pipelineSelectClass}
              >
                <option value="">Select Industry</option>
                {industryOptions.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className={pipelineLabelClass}>Role</span>
              <input
                type="text"
                name="role_paragraph"
                value={formData.role_paragraph}
                onChange={handleChange}
                className={pipelineInputClass}
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
