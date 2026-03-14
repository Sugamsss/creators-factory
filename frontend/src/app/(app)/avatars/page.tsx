"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StaggerContainer, StaggerItem } from "@/shared/ui/animations";
import { AvatarCard } from "@/shared/ui";
import { SearchBar } from "@/shared/ui/search-bar";
import { IndustryDropdown } from "@/shared/ui/industry-dropdown";
import { SortTabs } from "@/shared/ui/sort-tabs";
import { PageContainer, PageHeader, SectionHeading } from "@/shared/ui/layout";
import { LoadMoreButton } from "@/shared/ui/buttons";
import { useAvatars } from "@/features/avatars/hooks";
import { cloneAvatar, deleteAvatar, retryAvatarTraining } from "@/features/avatars/services/avatarApi";
import { RemoveFromAutomationsModal } from "@/shared/ui/remove-from-automations-modal";
import { useAuth, setAuthRedirect, getAuthRedirect, clearAuthRedirect } from "@/features/auth";

function getStatusLabel(buildState: string): string {
  const labels: Record<string, string> = {
    draft_visual: "Visual Setup",
    draft_appearance: "Appearance",
    training_lora: "Training Identity",
    failed_training: "Training Failed",
    draft_personality: "Personality",
    ready: "Ready",
  };
  return labels[buildState] || buildState;
}

function getStatusTone(buildState: string): "amber" | "red" | "green" | "blue" {
  if (buildState === "training_lora") return "amber";
  if (buildState === "failed_training") return "red";
  if (buildState === "ready") return "green";
  return "blue";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Modified ${diffMins}m ago`;
  if (diffHours < 24) return `Modified ${diffHours}h ago`;
  if (diffDays < 7) return `Modified ${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function AvatarsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { 
    drafts, 
    deployments, 
    orgAvatars,
    exploreAvatars,
    industries,
    isLoading,
    isLoadingMore,
    hasMoreExplore,
    triggerCreateAvatar, 
    loadMoreExplore,
    fetchExploreWithParams,
  } = useAvatars();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<"featured" | "popular" | "newest">("newest");
  const [, startTransition] = useTransition();
  const [cloningId, setCloningId] = useState<number | null>(null);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [cloneSuccess, setCloneSuccess] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState<{ id: number; name: string } | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    startTransition(() => {
      fetchExploreWithParams({
        search: value || undefined,
        industryId: selectedIndustry,
        sort: sortBy,
      }, true);
    });
  }, [fetchExploreWithParams, selectedIndustry, sortBy]);

  const handleIndustryChange = useCallback((industryId: number | undefined) => {
    setSelectedIndustry(industryId);
    startTransition(() => {
      fetchExploreWithParams({
        search: searchQuery || undefined,
        industryId: industryId,
        sort: sortBy,
      }, true);
    });
  }, [fetchExploreWithParams, searchQuery, sortBy]);

  const handleSortChange = useCallback((sort: "featured" | "popular" | "newest") => {
    setSortBy(sort);
    startTransition(() => {
      fetchExploreWithParams({
        search: searchQuery || undefined,
        industryId: selectedIndustry,
        sort: sort,
      }, true);
    });
  }, [fetchExploreWithParams, searchQuery, selectedIndustry]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    const redirectUrl = getAuthRedirect();
    if (redirectUrl) {
      clearAuthRedirect();
      if (redirectUrl === "/avatars/create/new") {
        // Create a new avatar draft and redirect to its creation page
        setIsCreating(true);
        triggerCreateAvatar()
          .then((draftId) => {
            router.push(`/avatars/create/${draftId}`);
          })
          .catch((err) => {
            console.error("Failed to create avatar after login:", err);
            // fallback to avatars list
            router.push("/avatars");
          })
          .finally(() => {
            setIsCreating(false);
          });
      } else {
        router.push(redirectUrl);
      }
    }
  }, [isAuthLoading, isAuthenticated, router, triggerCreateAvatar]);

  const handleCreateNew = async () => {
    if (!isAuthenticated) {
      setAuthRedirect("/avatars/create/new");
      router.push("/login");
      return;
    }

    setIsCreating(true);
    try {
      const draftId = await triggerCreateAvatar();
      clearAuthRedirect();
      router.push(`/avatars/create/${draftId}`);
    } catch (err) {
      console.error("Create avatar error:", err);
      if (err instanceof Error && err.message === "Session expired. Please log in again.") {
        setAuthRedirect("/avatars/create/new");
        router.push("/login");
      } else {
        alert(err instanceof Error ? err.message : "Failed to create avatar. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleResumeDraft = (id: string | number) => {
    router.push(`/avatars/create/${id}`);
  };

  const handleViewDetails = (id: number) => {
    router.push(`/avatars/${id}`);
  };

  const handleDelete = useCallback(async (avatarId: number) => {
    if (!confirm("Are you sure you want to delete this avatar?")) return;
    setActionLoading(avatarId);
    setActionError(null);
    try {
      await deleteAvatar(avatarId);
      window.location.reload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to delete avatar");
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleRetryTraining = useCallback(async (avatarId: number) => {
    setActionLoading(avatarId);
    setActionError(null);
    try {
      await retryAvatarTraining(avatarId);
      window.location.reload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to retry training");
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleClone = useCallback(async (avatarId: number) => {
    setCloneError(null);
    setCloningId(avatarId);
    try {
      const clonedAvatar = await cloneAvatar(avatarId);
      setCloneSuccess(avatarId);
      setTimeout(() => setCloneSuccess(null), 3000);
      router.push(`/avatars/${clonedAvatar.id}`);
    } catch (error) {
      setCloneError(error instanceof Error ? error.message : "Failed to clone avatar");
    } finally {
      setCloningId(null);
    }
  }, [router]);

  const exploreControls = (
    <div className="flex items-center gap-4">
      <SearchBar 
        placeholder="SEARCH AVATARS..." 
        value={searchQuery}
        onChange={handleSearchChange}
        className="min-w-[200px]"
      />
      <IndustryDropdown
        industries={industries}
        selectedIndustryId={selectedIndustry}
        onSelect={handleIndustryChange}
      />
      <SortTabs selected={sortBy} onChange={handleSortChange} />
    </div>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Avatars"
        subtitle="Manage, train, and deploy your intelligent digital workforce"
        action={{ icon: "add_circle", label: isCreating ? "Creating..." : "Create Avatar", onClick: handleCreateNew }}
      />

      {actionError && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {actionError}
        </div>
      )}

      <section className="mb-10">
        <SectionHeading title="Continue" description="pickup where you left off" />
        <StaggerContainer className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {drafts.map((card) => (
            <StaggerItem key={card.id}>
              <AvatarCard
                id={card.id}
                title={card.name || "Untitled Avatar"}
                image={card.active_card_image_url || ""}
                status={getStatusLabel(card.build_state)}
                statusTone={getStatusTone(card.build_state)}
                modified={formatDate(card.updated_at)}
                isTraining={card.build_state === "training_lora"}
                type="draft"
                actionLabel={actionLoading === card.id ? "Loading..." : "Continue"}
                actionIcon="play_arrow"
                onAction={() => handleResumeDraft(card.id)}
                secondaryActionLabel={card.build_state === "failed_training" ? "Retry" : undefined}
                secondaryActionIcon={card.build_state === "failed_training" ? "refresh" : undefined}
                onSecondaryAction={card.build_state === "failed_training" ? () => handleRetryTraining(card.id) : undefined}
                tertiaryActionLabel="Delete"
                tertiaryActionIcon="delete"
                onTertiaryAction={() => handleDelete(card.id)}
              />
            </StaggerItem>
          ))}
          {drafts.length === 0 && !isLoading && (
            <p className="text-muted text-sm">No drafts yet. Create your first avatar!</p>
          )}
        </StaggerContainer>
      </section>

      <section>
        <SectionHeading title="My Avatars" description="all the avatars you created" />
        <StaggerContainer className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {deployments.map((card) => (
            <StaggerItem key={card.id}>
              <AvatarCard
                id={card.id}
                title={card.name || "Unnamed Avatar"}
                image={card.active_card_image_url || ""}
                role={card.role_paragraph || ""}
                modified={formatDate(card.updated_at)}
                type="deployment"
                actionLabel="Use"
                actionIcon="play_circle"
                onAction={() => handleViewDetails(card.id)}
                secondaryActionLabel="Remove"
                secondaryActionIcon="link_off"
                onSecondaryAction={() => setShowRemoveModal({ id: card.id, name: card.name || "Unnamed Avatar" })}
                tertiaryActionLabel="Delete"
                tertiaryActionIcon="delete_forever"
                onTertiaryAction={() => handleDelete(card.id)}
              />
            </StaggerItem>
          ))}
          {deployments.length === 0 && !isLoading && (
            <p className="text-muted text-sm">No completed avatars yet.</p>
          )}
        </StaggerContainer>
      </section>

      {orgAvatars.length > 0 && (
        <section className="mb-14 mt-14">
          <SectionHeading title="Organisation's Avatars" description="Shared Avatars Across Your Team" />
          <StaggerContainer className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {orgAvatars.map((card) => (
              <StaggerItem key={card.id}>
                <AvatarCard
                  id={card.id}
                  title={card.name || "Unnamed Avatar"}
                  image={card.active_card_image_url || ""}
                  role={card.role_paragraph || "Corporate Avatar"}
                  modified={formatDate(card.updated_at)}
                  type="deployment"
                  actionLabel="Use"
                  actionIcon="play_circle"
                  onAction={() => handleViewDetails(card.id)}
                  secondaryActionLabel="Clone"
                  secondaryActionIcon="content_copy"
                  onSecondaryAction={() => handleClone(card.id)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      <section className="mt-14 border-t border-border pt-12">
        <SectionHeading 
          title="Other Avatars" 
          description="marketplace to buy and use other avatars"
          rightControls={exploreControls}
        />

        {cloneError && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {cloneError}
          </div>
        )}

        <StaggerContainer className="flex flex-wrap gap-x-4 gap-y-8">
          {exploreAvatars.map((card) => (
            <StaggerItem key={card.id}>
              <AvatarCard
                id={card.id}
                title={card.name || "Unnamed Avatar"}
                image={card.active_card_image_url || ""}
                role={card.role_paragraph || "Public Identity"}
                modified={`${card.clone_count} clones`}
                type="deployment"
                actionLabel={cloneSuccess === card.id ? "Bought!" : (cloningId === card.id ? "Buying..." : "Buy")}
                actionIcon={cloneSuccess === card.id ? "check" : "shopping_cart"}
                onAction={() => handleClone(card.id)}
              />
            </StaggerItem>
          ))}
          {exploreAvatars.length === 0 && !isLoading && (
            <p className="text-muted text-sm w-full text-center py-8">
              No public avatars available. Check back later!
            </p>
          )}
        </StaggerContainer>

        {exploreAvatars.length > 0 && hasMoreExplore && (
          <LoadMoreButton onClick={loadMoreExplore} disabled={isLoadingMore}>
            {isLoadingMore ? "Loading..." : "Load More Avatars"}
          </LoadMoreButton>
        )}
      </section>

      {showRemoveModal && (
        <RemoveFromAutomationsModal
          avatarId={showRemoveModal.id}
          avatarName={showRemoveModal.name}
          onClose={() => setShowRemoveModal(null)}
          onRemoved={() => window.location.reload()}
        />
      )}
    </PageContainer>
  );
}
