import { useState, useCallback, useEffect } from "react";
import type { AvatarDraft, AvatarDeployment, ExploreAvatar, AvatarIndustry } from "../types";
import { getDrafts, getMyAvatars, getOrgAvatars, getExploreAvatars, getIndustries, createAvatar } from "../services/avatarApi";

interface ExploreParams {
  search?: string;
  industryId?: number;
  sort?: "featured" | "popular" | "newest";
}

export function useAvatars() {
  const [drafts, setDrafts] = useState<AvatarDraft[]>([]);
  const [deployments, setDeployments] = useState<AvatarDeployment[]>([]);
  const [orgAvatars, setOrgAvatars] = useState<AvatarDeployment[]>([]);
  const [exploreAvatars, setExploreAvatars] = useState<ExploreAvatar[]>([]);
  const [industries, setIndustries] = useState<AvatarIndustry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [exploreCursor, setExploreCursor] = useState<string | null>(null);
  const [hasMoreExplore, setHasMoreExplore] = useState(true);
  const [exploreParams, setExploreParams] = useState<ExploreParams>({ sort: "newest" });

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [draftsData, myAvatarsData, orgData, exploreData, industriesData] = await Promise.all([
        getDrafts(),
        getMyAvatars(),
        getOrgAvatars(),
        getExploreAvatars({ sort: "newest" }),
        getIndustries(),
      ]);

      setDrafts(draftsData);
      setDeployments(myAvatarsData);
      setOrgAvatars(orgData);
      setExploreAvatars(exploreData.avatars || []);
      setExploreCursor(exploreData.next_cursor);
      setHasMoreExplore(exploreData.has_more);
      setIndustries(industriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch avatars");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExploreWithParams = useCallback(async (params: ExploreParams, reset: boolean = true) => {
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
        industryId: params.industryId,
        sort: params.sort,
      });

      if (reset) {
        setExploreAvatars(response.avatars || []);
      } else {
        setExploreAvatars(prev => [...prev, ...(response.avatars || [])]);
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
  }, []);

  const loadMoreExplore = useCallback(async () => {
    if (!exploreCursor || isLoadingMore || !hasMoreExplore) return;
    
    setIsLoadingMore(true);
    try {
      const response = await getExploreAvatars({
        search: exploreParams.search,
        industryId: exploreParams.industryId,
        sort: exploreParams.sort,
        cursor: exploreCursor,
      });

      setExploreAvatars(prev => [...prev, ...(response.avatars || [])]);
      setExploreCursor(response.next_cursor);
      setHasMoreExplore(response.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more avatars");
    } finally {
      setIsLoadingMore(false);
    }
  }, [exploreCursor, exploreParams, isLoadingMore, hasMoreExplore]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const triggerCreateAvatar = useCallback(async () => {
    try {
      const draft = await createAvatar();
      return draft.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create avatar");
      throw err;
    }
  }, []);

  const getResumeDraftUrl = useCallback((id: string | number) => {
    return `/avatars/create/${id}`;
  }, []);

  return { 
    drafts, 
    deployments, 
    orgAvatars,
    exploreAvatars,
    industries,
    isLoading,
    error,
    isLoadingMore,
    hasMoreExplore,
    triggerCreateAvatar, 
    getResumeDraftUrl,
    refetch: fetchInitialData,
    loadMoreExplore,
    fetchExploreWithParams,
  };
}
