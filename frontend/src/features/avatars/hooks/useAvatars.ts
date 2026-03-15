import { useCallback, useEffect, useState } from "react";
import type {
  AvatarCardModel,
  AvatarIndustry,
  ExploreAvatar,
} from "../types";
import {
  createAvatarDraft,
  getAvatarsHub,
  getExploreAvatars,
} from "../services/avatarApi";

interface ExploreParams {
  search?: string;
  sort?: "featured" | "popular" | "newest";
  gender?: string;
  ageRange?: string;
  industry?: string;
}

export function useAvatars() {
  const [drafts, setDrafts] = useState<AvatarCardModel[]>([]);
  const [myAvatars, setMyAvatars] = useState<AvatarCardModel[]>([]);
  const [orgAvatars, setOrgAvatars] = useState<AvatarCardModel[]>([]);
  const [exploreAvatars, setExploreAvatars] = useState<ExploreAvatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [exploreCursor, setExploreCursor] = useState<string | null>(null);
  const [hasMoreExplore, setHasMoreExplore] = useState(true);
  const [exploreParams, setExploreParams] = useState<ExploreParams>({ sort: "newest" });

  const fetchHubAndExplore = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [hubData, exploreData] = await Promise.all([
        getAvatarsHub(),
        getExploreAvatars({ sort: "newest" }),
      ]);

      const continueCreation = Array.isArray(hubData?.continue_creation)
        ? hubData.continue_creation
        : [];
      const mySection = Array.isArray(hubData?.my_avatars) ? hubData.my_avatars : [];
      const orgSection = Array.isArray(hubData?.org_avatars) ? hubData.org_avatars : [];
      const exploreSection = Array.isArray(exploreData?.avatars) ? exploreData.avatars : [];

      setDrafts(continueCreation);
      setMyAvatars(mySection);
      setOrgAvatars(orgSection);
      setExploreAvatars(exploreSection);
      setExploreCursor(exploreData?.next_cursor ?? null);
      setHasMoreExplore(Boolean(exploreData?.has_more));
      setExploreParams({ sort: "newest" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch avatars");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExploreWithParams = useCallback(
    async (params: ExploreParams, reset: boolean = true) => {
      if (reset) {
        setIsLoading(true);
        setExploreAvatars([]);
        setExploreCursor(null);
        setHasMoreExplore(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await getExploreAvatars({
          search: params.search,
          sort: params.sort,
          gender: params.gender,
          ageRange: params.ageRange,
          industry: params.industry,
        });

        if (reset) {
          setExploreAvatars(response.avatars || []);
        } else {
          setExploreAvatars((previous) => [...previous, ...(response.avatars || [])]);
        }
        setExploreCursor(response.next_cursor);
        setHasMoreExplore(response.has_more);
        setExploreParams(params);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch explore avatars");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  const loadMoreExplore = useCallback(async () => {
    if (!exploreCursor || isLoadingMore || !hasMoreExplore) return;

    setIsLoadingMore(true);
    try {
      const response = await getExploreAvatars({
        search: exploreParams.search,
        sort: exploreParams.sort,
        gender: exploreParams.gender,
        ageRange: exploreParams.ageRange,
        industry: exploreParams.industry,
        cursor: exploreCursor,
      });

      setExploreAvatars((previous) => [...previous, ...(response.avatars || [])]);
      setExploreCursor(response.next_cursor);
      setHasMoreExplore(response.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more avatars");
    } finally {
      setIsLoadingMore(false);
    }
  }, [exploreCursor, exploreParams, isLoadingMore, hasMoreExplore]);

  useEffect(() => {
    void fetchHubAndExplore();
  }, [fetchHubAndExplore]);

  const triggerCreateAvatar = useCallback(async () => {
    const draft = await createAvatarDraft("personal");
    return draft.id;
  }, []);

  return {
    drafts,
    myAvatars,
    orgAvatars,
    exploreAvatars,
    isLoading,
    error,
    isLoadingMore,
    hasMoreExplore,
    triggerCreateAvatar,
    refetch: fetchHubAndExplore,
    loadMoreExplore,
    fetchExploreWithParams,
  };
}
