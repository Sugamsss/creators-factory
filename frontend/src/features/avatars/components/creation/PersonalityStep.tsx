"use client";

import { useCallback, useEffect, useState } from "react";
import { getAvatar, getIndustries, updateAvatar } from "@/features/avatars/services/avatarApi";
import type { AvatarIndustry } from "@/features/avatars/types";

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
    industry_id: "",
    role_paragraph: "",
  });
  const [industries, setIndustries] = useState<AvatarIndustry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [avatar, industryData] = await Promise.all([
        getAvatar(Number(avatarId)),
        getIndustries(),
      ]);
      setFormData({
        name: avatar.name || "",
        age: avatar.age?.toString() || "",
        description: avatar.description || "",
        backstory: avatar.backstory || "",
        communication_principles: (avatar.communication_principles || []).join("\n"),
        industry_id: avatar.industry_id?.toString() || "",
        role_paragraph: avatar.role_paragraph || "",
      });
      setIndustries(industryData);
    } catch (error) {
      console.error("Failed to fetch personality data:", error);
      setMessage("Failed to load avatar personality data.");
    } finally {
      setIsLoading(false);
    }
  }, [avatarId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const save = async (completeAvatar: boolean = false) => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updateAvatar(Number(avatarId), {
        name: formData.name || undefined,
        age: formData.age ? parseInt(formData.age, 10) : null,
        description: formData.description || undefined,
        backstory: formData.backstory || undefined,
        communication_principles: formData.communication_principles
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        industry_id: formData.industry_id ? parseInt(formData.industry_id, 10) : null,
        role_paragraph: formData.role_paragraph || undefined,
        complete_avatar: completeAvatar,
      });
      setMessage(completeAvatar ? "Avatar completed successfully." : "Draft saved successfully.");
    } catch (error) {
      console.error("Failed to save avatar:", error);
      setMessage(error instanceof Error ? error.message : "Failed to save avatar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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
      <div className="mx-auto w-full max-w-5xl space-y-10 pb-20">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3c9f95]" />
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#3c9f95]">Stage 03: Personality</p>
            </div>
            <h3 className="font-display text-3xl text-[#1a3a2a] lg:text-4xl">Define Personality</h3>
            <p className="max-w-xl text-[12px] font-medium leading-relaxed text-[#5c6d66]">
              Save draft anytime or complete avatar once all required fields are valid.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void save(false)}
              disabled={isSaving}
              className="h-11 rounded-xl bg-[#1a3a2a] px-6 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#3c9f95] disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={() => void save(true)}
              disabled={isSaving}
              className="h-11 rounded-xl bg-[#3c9f95] px-6 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#2b7a72] disabled:opacity-50"
            >
              Complete Avatar
            </button>
          </div>
        </header>

        {message && (
          <div className="rounded-xl border border-[#d6dbd4] bg-white p-4 text-sm text-[#1a3a2a]">
            {message}
          </div>
        )}

        <section className="rounded-[32px] border border-[#d6dbd4] bg-white p-8 shadow-xl shadow-black/5">
          <div className="mb-8 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3c9f95]/10 text-[#3c9f95]">
                <span className="material-symbols-outlined !text-[20px]">id_card</span>
              </span>
              <div>
                <h4 className="font-display text-xl text-[#1a3a2a]">Core Information</h4>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8ca1c5]">Required fields</p>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a]">Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-4 py-3 text-sm"
              />
            </label>
            <label className="space-y-2">
              <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a]">Age</span>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-4 py-3 text-sm"
              />
            </label>
          </div>

          <label className="mb-6 block space-y-2">
            <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a]">Description</span>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-4 py-3 text-sm"
            />
          </label>

          <label className="mb-6 block space-y-2">
            <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a]">Backstory</span>
            <textarea
              name="backstory"
              rows={5}
              value={formData.backstory}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-4 py-3 text-sm"
            />
          </label>

          <label className="block space-y-2">
            <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a]">
              Communication Principles (one per line)
            </span>
            <textarea
              name="communication_principles"
              rows={4}
              value={formData.communication_principles}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-4 py-3 text-sm"
            />
          </label>
        </section>

        <section className="rounded-[32px] border border-[#d6dbd4] bg-white p-8 shadow-xl shadow-black/5">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3c9f95]/10 text-[#3c9f95]">
              <span className="material-symbols-outlined !text-[20px]">work</span>
            </span>
            <div>
              <h4 className="font-display text-xl text-[#1a3a2a]">Industry and Role</h4>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8ca1c5]">Required to complete</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a]">Industry</span>
              <select
                name="industry_id"
                value={formData.industry_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-4 py-3 text-sm"
              >
                <option value="">Select industry...</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a]">Role</span>
              <input
                type="text"
                name="role_paragraph"
                value={formData.role_paragraph}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-4 py-3 text-sm"
              />
            </label>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3c9f95]/10 text-[#3c9f95]">
              <span className="material-symbols-outlined !text-[20px]">record_voice_over</span>
            </span>
            <div>
              <h4 className="font-display text-xl text-[#1a3a2a]">Voice and Tone</h4>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8ca1c5]">
                Continue in edit page for full controls
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d6dbd4] bg-white p-5 text-sm text-[#5c6d66]">
            Voice mode, reactions, tone tags, and advanced personality controls are preserved in payload snapshots and can be
            expanded in subsequent passes.
          </div>
        </section>
      </div>
    </div>
  );
}
