"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarCard, LoadMoreButton } from "@/shared/ui";
import { SearchBar } from "@/shared/ui/search-bar";
import { PageContainer, PageHeader, SectionHeading } from "@/shared/ui/layout";
import { buildLoginPath, useAuth } from "@/features/auth";
import { useAvatars } from "@/features/avatars/hooks";
import {
  cloneAvatar,
  deleteAvatar,
  deployAvatar,
  listAutomations,
  pauseAvatar,
  retryLora,
} from "@/features/avatars/services/avatarApi";
import type { AvatarCardModel } from "@/features/avatars/types";

interface AutomationOption {
  id: number;
  name: string;
  status: "active" | "paused";
  avatar_id: number;
}

function getBuildStateLabel(state: AvatarCardModel["build_state"]): string {
  const labels: Record<AvatarCardModel["build_state"], string> = {
    draft_visual: "Visual Identity",
    draft_appearance: "Finalize Appearance",
    training_lora: "Training LoRA",
    failed_training: "Training Failed",
    draft_personality: "Personality",
    ready: "Ready",
    soft_deleted: "Deleted",
  };
  return labels[state];
}

function getBuildStateTone(state: AvatarCardModel["build_state"]): "amber" | "red" | "green" | "blue" {
  if (state === "training_lora") return "amber";
  if (state === "failed_training") return "red";
  if (state === "ready") return "green";
  return "blue";
}

function getDeploymentStatusLabel(summary: AvatarCardModel["deployment_summary"]): string {
  switch (summary) {
    case "in_use":
      return "In Use";
    case "partially_paused":
      return "Partially Paused";
    case "fully_paused":
      return "Paused";
    default:
      return "Not In Use";
  }
}

function formatModified(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Updated ${diffMins}m ago`;
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  if (diffDays < 7) return `Updated ${diffDays}d ago`;
  return `Updated ${date.toLocaleDateString()}`;
}

function DeploymentModal({
  title,
  confirmLabel,
  options,
  selected,
  loading,
  error,
  onToggle,
  onConfirm,
  onClose,
}: {
  title: string;
  confirmLabel: string;
  options: AutomationOption[];
  selected: number[];
  loading: boolean;
  error: string | null;
  onToggle: (id: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true">
        <h3 className="font-display text-2xl text-ink-heavy">{title}</h3>
        <p className="mt-2 text-sm text-muted">Select one or more automations.</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-border">
          {options.length === 0 ? (
            <p className="p-4 text-sm text-muted">No automations available.</p>
          ) : (
            options.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{option.name}</p>
                  <p className="text-xs text-muted uppercase tracking-wide">{option.status}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selected.includes(option.id)}
                  onChange={() => onToggle(option.id)}
                  className="h-4 w-4"
                />
              </label>
            ))
          )}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || selected.length === 0}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  avatar,
  loading,
  onConfirm,
  onClose,
}: {
  avatar: AvatarCardModel;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true">
        <h3 className="font-display text-2xl text-ink-heavy">Delete Avatar</h3>
        <p className="mt-3 text-sm text-muted">
          This will soft-delete <span className="font-semibold text-ink">{avatar.name || "Untitled Avatar"}</span> and
          detach its active automations.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteSuccessModal({
  avatarName,
  onClose,
}: {
  avatarName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" role="dialog" aria-modal="true">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="material-symbols-outlined !text-[32px] text-green-600">check_circle</span>
          </div>
          <h3 className="font-display text-2xl text-ink-heavy">Avatar Deleted</h3>
          <p className="mt-3 text-sm text-muted">
            <span className="font-semibold text-ink">{avatarName || "Avatar"}</span> has been moved to the recycle bin.
          </p>
          <p className="mt-2 text-xs text-muted">You can restore it within 10 days.</p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-full bg-brand px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-hover"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AvatarsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    drafts,
    myAvatars,
    orgAvatars,
    exploreAvatars,
    isLoading,
    error,
    isLoadingMore,
    hasMoreExplore,
    triggerCreateAvatar,
    loadMoreExplore,
    fetchExploreWithParams,
    refetch,
  } = useAvatars();

  const safeDrafts = Array.isArray(drafts) ? drafts : [];
  const safeMyAvatars = Array.isArray(myAvatars) ? myAvatars : [];
  const safeOrgAvatars = Array.isArray(orgAvatars) ? orgAvatars : [];
  const safeExploreAvatars = Array.isArray(exploreAvatars) ? exploreAvatars : [];

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "popular" | "newest">(
    "newest"
  );
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    ageRange: "",
    industry: "",
  });
  const [busyAvatarId, setBusyAvatarId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deletedAvatarName, setDeletedAvatarName] = useState<string | null>(null);
  const [deleteAvatarTarget, setDeleteAvatarTarget] =
    useState<AvatarCardModel | null>(null);

  // Deployment/Pause States
  const [deployAvatarTarget, setDeployAvatarTarget] =
    useState<AvatarCardModel | null>(null);
  const [pauseAvatarTarget, setPauseAvatarTarget] =
    useState<AvatarCardModel | null>(null);
  const [automations, setAutomations] = useState<AutomationOption[]>([]);
  const [selectedAutomationIds, setSelectedAutomationIds] = useState<number[]>([]);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [deployConfirmReplace, setDeployConfirmReplace] = useState(false);

  const resetDialogState = useCallback(() => {
    setAutomations([]);
    setSelectedAutomationIds([]);
    setIsDialogLoading(false);
    setDialogError(null);
    setDeployConfirmReplace(false);
  }, []);

  const openDeploy = useCallback(async (avatar: AvatarCardModel) => {
    setDeployAvatarTarget(avatar);
    setPauseAvatarTarget(null);
    resetDialogState();

    setIsDialogLoading(true);
    try {
      const data = await listAutomations();
      setAutomations(
        data
          .filter((item) => item.avatar_id === avatar.id)
          .map((item) => ({
            id: item.id,
            name: item.name,
            status: item.status,
            avatar_id: item.avatar_id,
          }))
      );
    } catch (openError) {
      setDialogError(openError instanceof Error ? openError.message : "Failed to load automations");
    } finally {
      setIsDialogLoading(false);
    }
  }, []);

  const openPause = useCallback(async (avatar: AvatarCardModel) => {
    setDeployAvatarTarget(null);
    setPauseAvatarTarget(avatar);
    resetDialogState();

    setBusyAvatarId(avatar.id);
    try {
      await pauseAvatar(avatar.id, {});
      setPauseAvatarTarget(null);
      setNotice("Avatar paused successfully.");
      await refetch();
      setBusyAvatarId(null);
      return;
    } catch {
      // Fall through to multi-select picker when backend indicates multiple active bindings.
    } finally {
      setBusyAvatarId(null);
    }

    setIsDialogLoading(true);
    try {
      const data = await listAutomations();
      setAutomations(
        data
          .filter((item) => item.avatar_id === avatar.id && item.status === "active")
          .map((item) => ({
            id: item.id,
            name: item.name,
            status: item.status,
            avatar_id: item.avatar_id,
          }))
      );
    } catch (openError) {
      setDialogError(openError instanceof Error ? openError.message : "Failed to load automations");
    } finally {
      setIsDialogLoading(false);
    }
  }, [refetch]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      void fetchExploreWithParams(
        {
          search: value || undefined,
          sort: sortBy,
        },
        true
      );
    },
    [fetchExploreWithParams, sortBy]
  );

  const handleSortChange = useCallback(
    (sort: "featured" | "popular" | "newest") => {
      setSortBy(sort);
      void fetchExploreWithParams(
        {
          search: searchQuery || undefined,
          sort,
        },
        true
      );
    },
    [fetchExploreWithParams, searchQuery]
  );

  const handleCreate = async () => {
    if (!isAuthenticated) {
      router.push(buildLoginPath("/avatars/create/new"));
      return;
    }

    setActionError(null);
    try {
      const draftId = await triggerCreateAvatar();
      router.push(`/avatars/create/${draftId}`);
    } catch (createError) {
      setActionError(createError instanceof Error ? createError.message : "Failed to create avatar");
    }
  };

  const handleDelete = async (avatar: AvatarCardModel) => {
    setBusyAvatarId(avatar.id);
    setActionError(null);
    try {
      await deleteAvatar(avatar.id);
      setDeleteAvatarTarget(null);
      setDeletedAvatarName(avatar.name || "Untitled Avatar");
      await refetch();
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : "Failed to delete avatar");
    } finally {
      setBusyAvatarId(null);
    }
  };

  const handleRetryTraining = async (avatar: AvatarCardModel) => {
    setBusyAvatarId(avatar.id);
    setActionError(null);
    try {
      await retryLora(avatar.id);
      setNotice("LoRA retraining started.");
      await refetch();
    } catch (retryError) {
      setActionError(retryError instanceof Error ? retryError.message : "Failed to retry LoRA training");
    } finally {
      setBusyAvatarId(null);
    }
  };

  const handleClone = async (avatarId: number) => {
    setBusyAvatarId(avatarId);
    setActionError(null);
    try {
      const cloned = await cloneAvatar(avatarId);
      setNotice("Avatar cloned successfully.");
      router.push(`/avatars/${cloned.avatar.id}/edit`);
    } catch (cloneError) {
      setActionError(cloneError instanceof Error ? cloneError.message : "Failed to clone avatar");
    } finally {
      setBusyAvatarId(null);
    }
  };

  const handleSubmitDeploy = async () => {
    if (!deployAvatarTarget || selectedAutomationIds.length === 0) return;
    setIsDialogLoading(true);
    setDialogError(null);
    try {
      await deployAvatar(deployAvatarTarget.id, {
        automation_ids: selectedAutomationIds,
        confirm_replace: deployConfirmReplace,
      });
      setNotice("Avatar deployed to selected automations.");
      setDeployAvatarTarget(null);
      resetDialogState();
      await refetch();
    } catch (deployError) {
      const message = deployError instanceof Error ? deployError.message : "Failed to deploy avatar";
      setDialogError(message);
      if (message.toLowerCase().includes("replace")) {
        setDeployConfirmReplace(true);
      }
    } finally {
      setIsDialogLoading(false);
    }
  };

  const handleSubmitPause = async () => {
    if (!pauseAvatarTarget || selectedAutomationIds.length === 0) return;
    setIsDialogLoading(true);
    setDialogError(null);
    try {
      await pauseAvatar(pauseAvatarTarget.id, { automation_ids: selectedAutomationIds });
      setNotice("Selected automation bindings paused.");
      setPauseAvatarTarget(null);
      resetDialogState();
      await refetch();
    } catch (pauseError) {
      setDialogError(pauseError instanceof Error ? pauseError.message : "Failed to pause avatar");
    } finally {
      setIsDialogLoading(false);
    }
  };

  const exploreControls = useMemo(() => {
    const sortLabel: Record<"featured" | "popular" | "newest", string> = {
      featured: "Recommendations",
      popular: "Most Popular",
      newest: "New",
    };

    const handleSortClick = () => setSortOpen((prev) => !prev);
    const handleFilterClick = () => setFilterOpen((prev) => !prev);

    const handleSortSelect = (sort: "featured" | "popular" | "newest") => {
      setSortBy(sort);
      setSortOpen(false);
      void fetchExploreWithParams(
        {
          search: searchQuery || undefined,
          sort,
        },
        true
      );
    };

    const handleFilterApply = () => {
      setFilterOpen(false);
      void fetchExploreWithParams(
        {
          search: searchQuery || undefined,
          sort: sortBy,
          gender: filters.gender || undefined,
          ageRange: filters.ageRange || undefined,
          industry: filters.industry || undefined,
        },
        true
      );
    };

    return (
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="min-w-[160px]"
          inputClassName="py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest bg-white/80 border-[#d6dbd4]"
        />
        
        {/* Sort Button */}
        <div className="relative">
          <button
            onClick={handleSortClick}
            className="flex items-center gap-2 rounded-2xl border border-[#d6dbd4] bg-white/80 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#5c6d66] backdrop-blur-sm transition-all hover:border-brand hover:text-brand"
          >
            <span className="material-symbols-outlined !text-[14px]">swap_vert</span>
            {sortLabel[sortBy]}
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-[#d6dbd4] bg-white shadow-lg">
              {(["newest", "popular", "featured"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => handleSortSelect(option)}
                  className={`w-full px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    sortBy === option
                      ? "bg-brand/10 text-brand"
                      : "text-[#5c6d66] hover:bg-gray-50"
                  }`}
                >
                  {sortLabel[option]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={handleFilterClick}
            className="flex items-center gap-2 rounded-2xl border border-[#d6dbd4] bg-white/80 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#5c6d66] backdrop-blur-sm transition-all hover:border-brand hover:text-brand"
          >
            <span className="material-symbols-outlined !text-[14px]">tune</span>
            Filter
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-[#d6dbd4] bg-white p-4 shadow-lg">
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-[#8ca1c5]">Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters((prev) => ({ ...prev, gender: e.target.value }))}
                    className="w-full rounded-lg border border-[#d6dbd4] bg-[#fafcfb] px-3 py-2 text-xs font-medium text-[#1a3a2a]"
                  >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-[#8ca1c5]">Age Range</label>
                  <select
                    value={filters.ageRange}
                    onChange={(e) => setFilters((prev) => ({ ...prev, ageRange: e.target.value }))}
                    className="w-full rounded-lg border border-[#d6dbd4] bg-[#fafcfb] px-3 py-2 text-xs font-medium text-[#1a3a2a]"
                  >
                    <option value="">All Ages</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-55">46-55</option>
                    <option value="55+">55+</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-[#8ca1c5]">Industry</label>
                  <input
                    type="text"
                    placeholder="Enter industry..."
                    value={filters.industry}
                    onChange={(e) => setFilters((prev) => ({ ...prev, industry: e.target.value }))}
                    className="w-full rounded-lg border border-[#d6dbd4] bg-[#fafcfb] px-3 py-2 text-xs font-medium text-[#1a3a2a] placeholder:text-[#8ca1c5]/50"
                  />
                </div>
                <button
                  onClick={handleFilterApply}
                  className="w-full rounded-lg bg-brand px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-hover"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [searchQuery, sortBy, sortOpen, filterOpen, filters, handleSearchChange, fetchExploreWithParams]);

  return (
    <PageContainer>
      <PageHeader
        title="Avatars"
        subtitle="Create and manage your AI avatars"
        action={{ icon: "add_circle", label: "Create Avatar", onClick: handleCreate }}
      />

      {(error || actionError) && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error || actionError}</div>
      )}
      {notice && <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">{notice}</div>}

      <section className="mb-12">
        <SectionHeading title="Continue Creation" description="Resume incomplete drafts" />
        <div className="flex gap-4 overflow-x-auto pb-8 pl-6 pt-6 scrollbar-thin -mx-6">
          {safeDrafts.map((avatar) => (
            <AvatarCard
              key={avatar.id}
              id={avatar.id}
              title={avatar.name || "Untitled Avatar"}
              image={avatar.active_card_image_url || ""}
              status={getBuildStateLabel(avatar.build_state)}
              statusTone={getBuildStateTone(avatar.build_state)}
              modified={formatModified(avatar.updated_at)}
              isTraining={avatar.build_state === "training_lora"}
              type="draft"
              actionLabel={busyAvatarId === avatar.id ? "Working..." : "Continue"}
              onAction={() => router.push(`/avatars/create/${avatar.id}`)}
              secondaryActionLabel={avatar.build_state === "failed_training" ? "Retry" : undefined}
              secondaryActionIcon={avatar.build_state === "failed_training" ? "refresh" : undefined}
              onSecondaryAction={
                avatar.build_state === "failed_training" ? () => void handleRetryTraining(avatar) : undefined
              }
              tertiaryActionLabel="Delete"
              tertiaryActionIcon="delete"
              onTertiaryAction={() => setDeleteAvatarTarget(avatar)}
            />
          ))}
          {safeDrafts.length === 0 && !isLoading && <p className="text-sm text-muted">No drafts in progress.</p>}
        </div>
      </section>

      <section className="mb-12">
        <SectionHeading
          title="My Avatars"
          description="Completed personal avatars"
          rightControls={
            <button
              onClick={() => router.push("/avatars/all")}
              className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover hover:shadow-xl"
            >
              View All
              <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
            </button>
          }
        />
        <div className="flex gap-4 overflow-x-auto pb-8 pl-6 pt-6 scrollbar-thin -mx-6">
          {safeMyAvatars.map((avatar) => {
            const deploymentSummary =
              typeof avatar.deployment_summary === "string" ? avatar.deployment_summary : null;
            const showPause = deploymentSummary === "in_use" || deploymentSummary === "partially_paused";
            return (
              <AvatarCard
                key={avatar.id}
                id={avatar.id}
                title={avatar.name || "Untitled Avatar"}
                image={avatar.active_card_image_url || ""}
                role={avatar.role_paragraph || "Avatar"}
                status={getDeploymentStatusLabel(deploymentSummary)}
                statusTone={deploymentSummary?.includes("paused") ? "amber" : "green"}
                modified={formatModified(avatar.updated_at)}
                type="deployment"
                actionLabel={busyAvatarId === avatar.id ? "Working..." : "Edit"}
                actionIcon="edit"
                onAction={() => router.push(`/avatars/${avatar.id}/edit`)}
                secondaryActionLabel="Use"
                secondaryActionIcon="bolt"
                onSecondaryAction={() => void openDeploy(avatar)}
                tertiaryActionLabel={showPause ? "Pause" : "Delete"}
                tertiaryActionIcon={showPause ? "pause_circle" : "delete"}
                onTertiaryAction={() => (showPause ? void openPause(avatar) : setDeleteAvatarTarget(avatar))}
                quaternaryActionLabel={showPause ? "Delete" : undefined}
                quaternaryActionIcon={showPause ? "delete" : undefined}
                onQuaternaryAction={showPause ? () => setDeleteAvatarTarget(avatar) : undefined}
              />
            );
          })}
          {safeMyAvatars.length === 0 && !isLoading && <p className="text-sm text-muted">No completed avatars yet.</p>}
        </div>
      </section>

      <section className="mb-12">
        <SectionHeading
          title="Organisational Avatars"
          description="Shared team avatars"
          rightControls={
            <button
              onClick={() => router.push("/avatars/all")}
              className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover hover:shadow-xl"
            >
              View All
              <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
            </button>
          }
        />
        <div className="flex gap-4 overflow-x-auto pb-8 pl-6 pt-6 scrollbar-thin -mx-6">
          {safeOrgAvatars.map((avatar) => {
            const deploymentSummary =
              typeof avatar.deployment_summary === "string" ? avatar.deployment_summary : null;
            return (
            <AvatarCard
              key={avatar.id}
              id={avatar.id}
              title={avatar.name || "Untitled Avatar"}
              image={avatar.active_card_image_url || ""}
              role={avatar.role_paragraph || "Org Avatar"}
              status={getDeploymentStatusLabel(deploymentSummary)}
              statusTone={deploymentSummary?.includes("paused") ? "amber" : "green"}
              modified={formatModified(avatar.updated_at)}
              type="deployment"
              actionLabel="Use"
              actionIcon="bolt"
              onAction={() => void openDeploy(avatar)}
              secondaryActionLabel="Pause"
              secondaryActionIcon="pause_circle"
              onSecondaryAction={() => void openPause(avatar)}
            />
          );})}
          {safeOrgAvatars.length === 0 && !isLoading && <p className="text-sm text-muted">No org avatars available.</p>}
        </div>
      </section>

      <section className="border-t border-border pt-12">
        <SectionHeading title="Explore Avatars" description="Clone public personal originals" rightControls={exploreControls} />
        <div className="flex flex-wrap gap-4">
          {safeExploreAvatars.map((avatar) => (
            <AvatarCard
              key={avatar.id}
              id={avatar.id}
              title={avatar.name || "Untitled Avatar"}
              image={avatar.active_card_image_url || ""}
              role={avatar.role_paragraph || avatar.industry?.name || "Public Avatar"}
              modified={`${avatar.clone_count} clones`}
              type="deployment"
              actionLabel={busyAvatarId === avatar.id ? "Cloning..." : "Use Avatar"}
              actionIcon="content_copy"
              onAction={() => void handleClone(avatar.id)}
            />
          ))}
          {safeExploreAvatars.length === 0 && !isLoading && (
            <p className="w-full py-10 text-center text-sm text-muted">No public avatars found for the current filters.</p>
          )}
        </div>

        {safeExploreAvatars.length > 0 && hasMoreExplore && (
          <LoadMoreButton onClick={loadMoreExplore} disabled={isLoadingMore}>
            {isLoadingMore ? "Loading..." : "Load More"}
          </LoadMoreButton>
        )}
      </section>

      {deployAvatarTarget && (
        <DeploymentModal
          title={`Use ${deployAvatarTarget.name || "Avatar"}`}
          confirmLabel={deployConfirmReplace ? "Replace and Use" : "Use"}
          options={automations}
          selected={selectedAutomationIds}
          loading={isDialogLoading}
          error={dialogError}
          onToggle={(id) =>
            setSelectedAutomationIds((current) =>
              current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
            )
          }
          onConfirm={() => void handleSubmitDeploy()}
          onClose={() => {
            setDeployAvatarTarget(null);
            resetDialogState();
          }}
        />
      )}

      {pauseAvatarTarget && (
        <DeploymentModal
          title={`Pause ${pauseAvatarTarget.name || "Avatar"}`}
          confirmLabel="Pause Selected"
          options={automations}
          selected={selectedAutomationIds}
          loading={isDialogLoading}
          error={dialogError}
          onToggle={(id) =>
            setSelectedAutomationIds((current) =>
              current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
            )
          }
          onConfirm={() => void handleSubmitPause()}
          onClose={() => {
            setPauseAvatarTarget(null);
            resetDialogState();
          }}
        />
      )}

      {deleteAvatarTarget && (
        <DeleteModal
          avatar={deleteAvatarTarget}
          loading={busyAvatarId === deleteAvatarTarget.id}
          onConfirm={() => void handleDelete(deleteAvatarTarget)}
          onClose={() => setDeleteAvatarTarget(null)}
        />
      )}

      {deletedAvatarName && (
        <DeleteSuccessModal
          avatarName={deletedAvatarName}
          onClose={() => setDeletedAvatarName(null)}
        />
      )}
    </PageContainer>
  );
}
