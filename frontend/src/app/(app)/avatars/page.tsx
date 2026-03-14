"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarCard, LoadMoreButton } from "@/shared/ui";
import { SearchBar } from "@/shared/ui/search-bar";
import { IndustryDropdown } from "@/shared/ui/industry-dropdown";
import { SortTabs } from "@/shared/ui/sort-tabs";
import { PageContainer, PageHeader, SectionHeading } from "@/shared/ui/layout";
import { buildLoginPath, useAuth } from "@/features/auth";
import { useAvatars } from "@/features/avatars/hooks";
import {
  cloneAvatar,
  createAvatarDraft,
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

export default function AvatarsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    drafts,
    myAvatars,
    orgAvatars,
    exploreAvatars,
    industries,
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
  const [selectedIndustry, setSelectedIndustry] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<"featured" | "popular" | "newest">("featured");

  const [busyAvatarId, setBusyAvatarId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [deployAvatarTarget, setDeployAvatarTarget] = useState<AvatarCardModel | null>(null);
  const [pauseAvatarTarget, setPauseAvatarTarget] = useState<AvatarCardModel | null>(null);
  const [deleteAvatarTarget, setDeleteAvatarTarget] = useState<AvatarCardModel | null>(null);
  const [automations, setAutomations] = useState<AutomationOption[]>([]);
  const [selectedAutomationIds, setSelectedAutomationIds] = useState<number[]>([]);
  const [deployConfirmReplace, setDeployConfirmReplace] = useState(false);

  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const resetDialogState = () => {
    setAutomations([]);
    setSelectedAutomationIds([]);
    setDeployConfirmReplace(false);
    setDialogError(null);
  };

  const openDeploy = useCallback(async (avatar: AvatarCardModel) => {
    setDeployAvatarTarget(avatar);
    setPauseAvatarTarget(null);
    resetDialogState();
    setIsDialogLoading(true);
    try {
      const data = await listAutomations();
      setAutomations(
        data.map((item) => ({
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
          industryId: selectedIndustry,
          sort: sortBy,
        },
        true
      );
    },
    [fetchExploreWithParams, selectedIndustry, sortBy]
  );

  const handleIndustryChange = useCallback(
    (industryId: number | undefined) => {
      setSelectedIndustry(industryId);
      void fetchExploreWithParams(
        {
          search: searchQuery || undefined,
          industryId,
          sort: sortBy,
        },
        true
      );
    },
    [fetchExploreWithParams, searchQuery, sortBy]
  );

  const handleSortChange = useCallback(
    (sort: "featured" | "popular" | "newest") => {
      setSortBy(sort);
      void fetchExploreWithParams(
        {
          search: searchQuery || undefined,
          industryId: selectedIndustry,
          sort,
        },
        true
      );
    },
    [fetchExploreWithParams, searchQuery, selectedIndustry]
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

  const handleCreateOrgDraft = async () => {
    setActionError(null);
    try {
      const draft = await createAvatarDraft("org");
      router.push(`/avatars/create/${draft.id}`);
    } catch (createError) {
      setActionError(createError instanceof Error ? createError.message : "Failed to create org avatar");
    }
  };

  const handleDelete = async (avatar: AvatarCardModel) => {
    setBusyAvatarId(avatar.id);
    setActionError(null);
    try {
      await deleteAvatar(avatar.id);
      setDeleteAvatarTarget(null);
      setNotice("Avatar deleted. It can be restored from recycle bin within 10 days.");
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

  const exploreControls = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          placeholder="Search avatars"
          value={searchQuery}
          onChange={handleSearchChange}
          className="min-w-[220px]"
        />
        <IndustryDropdown
          industries={Array.isArray(industries) ? industries : []}
          selectedIndustryId={selectedIndustry}
          onSelect={handleIndustryChange}
        />
        <SortTabs selected={sortBy} onChange={handleSortChange} />
      </div>
    ),
    [handleIndustryChange, handleSearchChange, handleSortChange, industries, searchQuery, selectedIndustry, sortBy]
  );

  return (
    <PageContainer>
      <PageHeader
        title="Avatars"
        subtitle="Create and manage your AI avatars"
        action={{ icon: "add_circle", label: "Create Avatar", onClick: handleCreate }}
      />

      <div className="mb-6 flex gap-3">
        <button
          onClick={handleCreateOrgDraft}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink"
        >
          Create Org Avatar
        </button>
        <button
          onClick={() => router.push("/avatars/all")}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink"
        >
          View All Personal Avatars
        </button>
      </div>

      {(error || actionError) && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error || actionError}</div>
      )}
      {notice && <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">{notice}</div>}

      <section className="mb-12">
        <SectionHeading title="Continue Creation" description="Resume incomplete drafts" />
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
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
        <SectionHeading title="My Avatars" description="Completed personal avatars" />
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
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
        <SectionHeading title="Organisational Avatars" description="Shared team avatars" />
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
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
    </PageContainer>
  );
}
