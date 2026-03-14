"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarCard } from "@/shared/ui";
import { PageContainer, PageHeader, SectionHeading } from "@/shared/ui/layout";
import { SearchBar } from "@/shared/ui/search-bar";
import { getAllAvatars } from "@/features/avatars/services/avatarApi";
import type { AvatarCardModel, AvatarDeploymentSummary } from "@/features/avatars/types";

function statusLabel(summary: AvatarDeploymentSummary | null): string {
  if (summary === "in_use") return "In Use";
  if (summary === "partially_paused") return "Partially Paused";
  if (summary === "fully_paused") return "Paused";
  return "Not In Use";
}

export default function AvatarsAllPage() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<AvatarCardModel[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sourceType, setSourceType] = useState<"" | "original" | "clone">("");
  const [visibility, setVisibility] = useState<"" | "public" | "private">("");
  const [deploymentSummary, setDeploymentSummary] = useState<"" | AvatarDeploymentSummary>("");
  const [sort, setSort] = useState<"newest" | "oldest" | "recently_edited" | "alphabetical">("newest");

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    void getAllAvatars({
      search: search || undefined,
      sourceType: sourceType || undefined,
      visibility: visibility || undefined,
      deploymentSummary: deploymentSummary || undefined,
      sort,
    })
      .then((response) => {
        if (controller.signal.aborted) return;
        setAvatars(response.avatars);
        setTotal(response.total);
      })
      .catch((loadError) => {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load avatars");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [deploymentSummary, search, sort, sourceType, visibility]);

  const controls = useMemo(
    () => (
      <div className="mb-6 flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or description" className="min-w-[240px]" />

        <select
          value={sourceType}
          onChange={(event) => setSourceType(event.target.value as "" | "original" | "clone")}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          <option value="">All Sources</option>
          <option value="original">Original</option>
          <option value="clone">Cloned</option>
        </select>

        <select
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as "" | "public" | "private")}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          <option value="">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <select
          value={deploymentSummary}
          onChange={(event) =>
            setDeploymentSummary(event.target.value as "" | AvatarDeploymentSummary)
          }
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          <option value="">All Deployment States</option>
          <option value="not_in_use">Not In Use</option>
          <option value="in_use">In Use</option>
          <option value="partially_paused">Partially Paused</option>
          <option value="fully_paused">Paused</option>
        </select>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value as "newest" | "oldest" | "recently_edited" | "alphabetical")
          }
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="recently_edited">Recently Edited</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>
    ),
    [deploymentSummary, search, sort, sourceType, visibility]
  );

  return (
    <PageContainer>
      <PageHeader title="All Personal Avatars" subtitle="Search, filter, and sort completed personal avatars" />
      {controls}

      <SectionHeading title={`Results (${total})`} />

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-sm text-muted">Loading...</p>}

      {!isLoading && avatars.length === 0 && <p className="text-sm text-muted">No avatars match the current filters.</p>}

      <div className="flex flex-wrap gap-4 pb-8">
        {avatars.map((avatar) => (
          <AvatarCard
            key={avatar.id}
            id={avatar.id}
            title={avatar.name || "Untitled Avatar"}
            image={avatar.active_card_image_url || ""}
            role={avatar.role_paragraph || "Avatar"}
            status={statusLabel(avatar.deployment_summary)}
            statusTone={avatar.deployment_summary?.includes("paused") ? "amber" : "green"}
            modified={new Date(avatar.updated_at).toLocaleDateString()}
            type="deployment"
            actionLabel="Edit"
            actionIcon="edit"
            onAction={() => router.push(`/avatars/${avatar.id}/edit`)}
          />
        ))}
      </div>
    </PageContainer>
  );
}
