// App name: Job Mitra
// File name: useShiftSearchPageState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\useShiftSearchPageState.ts

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import {
  getAppliedCategories,
  getFavoriteShiftIds,
  getRecentlyViewedIds,
  hasAnyApplications,
  isAlreadyApplied,
  isProfileComplete,
  isQuickApplyEnabled,
  quickApply,
  toggleFavoriteShift,
  trackShiftView,
} from "../../shiftJobs/helpers/shiftSearchHelpers";
import { getMatchQuality, getTopMatches } from "../helpers/smartMatchEngine";
import type { MatchablePost } from "../helpers/smartMatchEngine";
import { filterShiftPosts, hasActiveShiftSearchFilters } from "../helpers/shiftSearchFilters";
import {
  getBlockedPostIds,
  getShiftCategories,
  isShiftOpenForDiscovery,
  toShiftCardData,
} from "../helpers/shiftSearchViewHelpers";
import {
  getShiftSearchAppsSnapshot,
  getShiftSearchPostsSnapshot,
  getShiftSearchWorkspacesSnapshot,
  purgeDemoShiftSearchSeeds,
  subscribeShiftSearchApps,
  subscribeShiftSearchPosts,
  subscribeShiftSearchWorkspaces,
} from "../storage/shiftSearch.storage";
import type { DurOpt, ExpOpt, ShiftPostDemo, TimeOpt } from "../types/shiftSearch.types";

export function useShiftSearchPageState() {
  const nav = useNavigate();

  useEffect(() => {
    purgeDemoShiftSearchSeeds();
  }, []);

  const allPosts = useSyncExternalStore(
    subscribeShiftSearchPosts,
    getShiftSearchPostsSnapshot,
    getShiftSearchPostsSnapshot,
  );

  const applications = useSyncExternalStore(
    subscribeShiftSearchApps,
    getShiftSearchAppsSnapshot,
    getShiftSearchAppsSnapshot,
  );

  const workspaces = useSyncExternalStore(
    subscribeShiftSearchWorkspaces,
    getShiftSearchWorkspacesSnapshot,
    getShiftSearchWorkspacesSnapshot,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [timeOpt, setTimeOpt] = useState<TimeOpt>("any");
  const [exp, setExp] = useState<ExpOpt>("any");
  const [dur, setDur] = useState<DurOpt>("any");
  const [toast, setToast] = useState("");
  const [multiAppliedIds, setMultiAppliedIds] = useState<Set<string>>(() => new Set());
  const [catFilter, setCatFilter] = useState("any");
  const [appliedIds, setAppliedIds] = useState<Set<string>>(() => new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(getFavoriteShiftIds()));

  const profile = useMemo(() => employeeProfileStorage.get(), []);
  const profileCity = (profile.city ?? "").trim();
  const hasProfileSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
  const isDiscoveryProfileReady = Boolean(profileCity) && hasProfileSkills;

  const showToast = useCallback((message: string, durationMs = 2500) => {
    setToast(message);
    window.setTimeout(() => setToast(""), durationMs);
  }, []);

  const blockedPostIds = useMemo(() => {
    return getBlockedPostIds(applications, workspaces);
  }, [applications, workspaces]);

  const discoverablePosts = useMemo(() => {
    return allPosts.filter((post) => isShiftOpenForDiscovery(post) && !blockedPostIds.has(post.id));
  }, [allPosts, blockedPostIds]);

  const categories = useMemo(() => getShiftCategories(discoverablePosts), [discoverablePosts]);

  const filteredPosts = useMemo(() => {
    return filterShiftPosts({
      posts: discoverablePosts,
      searchQuery,
      timeOpt,
      exp,
      catFilter,
      dur,
    });
  }, [catFilter, discoverablePosts, dur, exp, searchQuery, timeOpt]);

  const appliedCats = useMemo(() => getAppliedCategories(), []);
  const hasApps = useMemo(() => hasAnyApplications(), []);

  const recommended = useMemo(() => {
    if (hasApps && appliedCats.length > 0) {
      return discoverablePosts
        .filter((post) => appliedCats.includes(post.category))
        .slice(0, 3)
        .map(toShiftCardData);
    }

    return discoverablePosts.slice(0, 3).map(toShiftCardData);
  }, [appliedCats, discoverablePosts, hasApps]);

  const recTitle = hasApps ? "Recommended for You" : "Available Now";
  const recSubtitle = hasApps
    ? "Based on your past applications"
    : isDiscoveryProfileReady
      ? "Open shifts matching your current search area."
      : "Open shifts available now. Complete your profile to improve matching.";

  const favoriteCards = useMemo(() => {
    const postMap = new Map(discoverablePosts.map((post) => [post.id, post]));

    return Array.from(favoriteIds)
      .map((id) => postMap.get(id))
      .filter((post): post is ShiftPostDemo => Boolean(post))
      .map(toShiftCardData);
  }, [discoverablePosts, favoriteIds]);

  const recentlyViewed = useMemo(() => {
    const ids = getRecentlyViewedIds();
    const postMap = new Map(discoverablePosts.map((post) => [post.id, post]));

    return ids
      .map((id) => postMap.get(id))
      .filter((post): post is ShiftPostDemo => Boolean(post))
      .map(toShiftCardData);
  }, [discoverablePosts]);

  const smartMatches = useMemo(() => {
    return getTopMatches(discoverablePosts as MatchablePost[], 4);
  }, [discoverablePosts]);

  const matchQuality = useMemo(() => getMatchQuality(), []);
  const quickApplyEnabled = useMemo(() => isQuickApplyEnabled() && isProfileComplete(), []);

  const hasFilters = useMemo(() => {
    return hasActiveShiftSearchFilters({
      timeOpt,
      exp,
      catFilter,
      dur,
      searchQuery,
    });
  }, [catFilter, dur, exp, searchQuery, timeOpt]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setTimeOpt("any");
    setExp("any");
    setCatFilter("any");
    setDur("any");
  }, []);

  const openDetails = useCallback(
    (postId: string) => {
      trackShiftView(postId);
      nav(ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", postId));
    },
    [nav],
  );

  const openProfile = useCallback(() => {
    nav(ROUTE_PATHS.employeeProfile);
  }, [nav]);

  const handleToggleFavorite = useCallback(
    (postId: string) => {
      const next = toggleFavoriteShift(postId);
      const nextSet = new Set(next);
      setFavoriteIds(nextSet);
      showToast(nextSet.has(postId) ? "Shift saved." : "Shift removed from saved.");
    },
    [showToast],
  );

  const handleQuickApply = useCallback(
    (event: MouseEvent, postId: string) => {
      event.stopPropagation();

      if (appliedIds.has(postId) || isAlreadyApplied(postId)) return;

      const ok = quickApply(postId);

      if (ok) {
        setAppliedIds((prev) => new Set(prev).add(postId));
      }
    },
    [appliedIds],
  );

  return {
    searchQuery,
    setSearchQuery,
    timeOpt,
    setTimeOpt,
    exp,
    setExp,
    dur,
    setDur,
    catFilter,
    setCatFilter,
    toast,
    categories,
    filteredPosts,
    discoverablePosts,
    recommended,
    recTitle,
    recSubtitle,
    recentlyViewed,
    favoriteCards,
    favoriteIds,
    smartMatches,
    matchQuality,
    quickApplyEnabled,
    hasFilters,
    appliedIds,
    multiAppliedIds,
    setMultiAppliedIds,
    profileCity,
    hasProfileSkills,
    isDiscoveryProfileReady,
    showToast,
    clearFilters,
    openDetails,
    openProfile,
    handleToggleFavorite,
    handleQuickApply,
  };
}
