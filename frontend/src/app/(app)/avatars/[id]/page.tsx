"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PageContainer, PageHeader } from "@/shared/ui/layout";
import { getAvatar, updateAvatar, toggleAvatarPublic, deleteAvatar } from "@/features/avatars/services/avatarApi";

interface AvatarDetail {
  id: number;
  name: string | null;
  age: number | null;
  description: string | null;
  backstory: string | null;
  role_paragraph: string | null;
  industry_id: number | null;
  active_card_image_url: string | null;
  build_state: string;
  is_public: boolean;
  ownership_scope: string;
  source_type: string;
  created_at: string;
  updated_at: string;
}

export default function AvatarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [avatar, setAvatar] = useState<AvatarDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [backstory, setBackstory] = useState("");
  const [roleParagraph, setRoleParagraph] = useState("");

  useEffect(() => {
    async function fetchAvatar() {
      try {
        const data = await getAvatar(parseInt(resolvedParams.id));
        setAvatar(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setBackstory(data.backstory || "");
        setRoleParagraph(data.role_paragraph || "");
      } catch {
        setError("Failed to load avatar");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAvatar();
  }, [resolvedParams.id]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateAvatar(avatar!.id, {
        name,
        description,
        backstory,
        role_paragraph: roleParagraph,
      });
      setAvatar(updated);
      setSuccess("Avatar updated successfully!");
    } catch {
      setError("Failed to update avatar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublic = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await toggleAvatarPublic(avatar!.id);
      setAvatar(updated);
      setSuccess(updated.is_public ? "Avatar is now public!" : "Avatar is now private!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle visibility");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this avatar?")) return;
    setIsSaving(true);
    try {
      await deleteAvatar(avatar!.id);
      router.push("/avatars");
    } catch {
      setError("Failed to delete avatar");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted">Loading...</p>
        </div>
      </PageContainer>
    );
  }

  if (!avatar) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted">Avatar not found</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={avatar.name || "Avatar Details"}
        subtitle="View and edit your avatar"
      />

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-600">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="rounded-2xl overflow-hidden bg-white shadow-lg">
            <div className="relative h-80">
              {avatar.active_card_image_url ? (
                <Image
                  src={avatar.active_card_image_url}
                  alt={avatar.name || "Avatar"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <span className="text-muted">No image</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Status
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  avatar.build_state === "ready" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {avatar.build_state}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Visibility
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  avatar.is_public 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {avatar.is_public ? "Public" : "Private"}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Type
                </span>
                <span className="text-sm text-ink">
                  {avatar.source_type === "clone" ? "Cloned" : "Original"}
                </span>
              </div>
              {avatar.age && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Age
                  </span>
                  <span className="text-sm text-ink">{avatar.age}</span>
                </div>
              )}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleTogglePublic}
                  disabled={isSaving || avatar.build_state !== "ready"}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#1c2120] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2c3332] disabled:opacity-50 transition-colors"
                >
                  {avatar.is_public ? "Make Private" : "Make Public"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="py-3 px-4 rounded-xl border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-ink mb-6">Edit Avatar</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Role / Job Title
                </label>
                <input
                  type="text"
                  value={roleParagraph}
                  onChange={(e) => setRoleParagraph(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Backstory
                </label>
                <textarea
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 rounded-xl bg-brand text-white text-sm font-bold uppercase tracking-wider hover:bg-brand/90 disabled:opacity-50 transition-colors"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
