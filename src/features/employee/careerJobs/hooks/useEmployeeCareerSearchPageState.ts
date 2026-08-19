// App name: Job Mitra
// File name: useEmployeeCareerSearchPageState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\hooks\useEmployeeCareerSearchPageState.ts

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { jobAlertStorage } from "../../../../shared/utils/jobAlertStorage";
import type { CareerAlertCriteria } from "../../../../shared/utils/jobAlertTypes";
import {
  buildCareerDiscoveryTabs,
  getCareerDiscoveryPosts,
  getCareerDiscoveryResultTitle,
} from "../helpers/careerDiscoveryHelpers";
import type { CareerDiscoveryTabId } from "../helpers/careerDiscoveryHelpers";
import {
  filterCareerPosts,
  getCareerApplicationsRawSnapshot,
  getCareerSearchSnapshot,
  getDiscoverableCareerPosts,
  getMyCareerApplicationStatusMap,
  subscribeCareerSearch,
} from "../helpers/careerSearchHelpers";
import type {
  ExperienceFilter,
  JobTypeFilter,
  WorkModeFilter,
} from "../helpers/careerSearchHelpers";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import {
  getNearbyCareerIds,
  getNearbyCareerIdsKey,
  subscribeNearbyCareerIds,
} from "../helpers/careerNearby.cache";
import { hydrateNearbyCareerIdsFromServer } from "../helpers/careerNearby.hydrate";
import {
  mapCareerIdsToPosts,
  selectCareerDiscoveryVisiblePosts,
} from "../helpers/selectCareerDiscoveryVisiblePosts";
import { employeeCareerSavedJobsStorage } from "../storage/employeeCareerSavedJobs.storage";
import { hydrateCareerSavedJobsFromServer } from "../storage/employeeCareerSavedJobs.sync";
import { employeeCareerRecentlyViewedJobsStorage } from "../storage/employeeCareerRecentlyViewedJobs.storage";

const MAX_SEARCH_QUERY_LENGTH = 80;
const MAX_LOCATION_QUERY_LENGTH = 80;

function normalizeSearchText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").slice(0, maxLength);
}

export function useEmployeeCareerSearchPageState() {
  const nav = useNavigate();

  const allPosts = useSyncExternalStore(
    subscribeCareerSearch,
    getCareerSearchSnapshot,
    getCareerSearchSnapshot,
  );

  const applicationSnapshot = useSyncExternalStore(
    subscribeCareerSearch,
    getCareerApplicationsRawSnapshot,
    getCareerApplicationsRawSnapshot,
  );

  const savedSnapshot = useSyncExternalStore(
    employeeCareerSavedJobsStorage.subscribe,
    employeeCareerSavedJobsStorage.getSnapshotKey,
    employeeCareerSavedJobsStorage.getSnapshotKey,
  );

  const recentSnapshot = useSyncExternalStore(
    employeeCareerRecentlyViewedJobsStorage.subscribe,
    employeeCareerRecentlyViewedJobsStorage.getSnapshotKey,
    employeeCareerRecentlyViewedJobsStorage.getSnapshotKey,
  );

  const discoverablePosts = useMemo(() => getDiscoverableCareerPosts(allPosts), [allPosts]);

  const [query, setQueryState] = useState("");
  const [locationQuery, setLocationQueryState] = useState("");
  const [jobType, setJobType] = useState<JobTypeFilter>("any");
  const [workMode, setWorkMode] = useState<WorkModeFilter>("any");
  const [experience, setExperience] = useState<ExperienceFilter>("any");
  const [activeTab, setActiveTab] = useState<CareerDiscoveryTabId>("best");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(
    () =>
      filterCareerPosts(
        discoverablePosts,
        query,
        jobType,
        workMode,
        experience,
        "any",
        locationQuery,
      ),
    [discoverablePosts, experience, jobType, locationQuery, query, workMode],
  );

  const savedJobIds = useMemo(() => {
    void savedSnapshot;
    return employeeCareerSavedJobsStorage.getIds();
  }, [savedSnapshot]);

  const recentJobIds = useMemo(() => {
    void recentSnapshot;
    return employeeCareerRecentlyViewedJobsStorage.getIds();
  }, [recentSnapshot]);

  const applicationStatusByPostId = useMemo(() => {
    void applicationSnapshot;
    return getMyCareerApplicationStatusMap();
  }, [applicationSnapshot]);

  const discoveryTabs = useMemo(
    () =>
      buildCareerDiscoveryTabs({
        posts: filtered,
        savedJobIds,
        recentJobIds,
        applicationStatusByPostId,
      }),
    [applicationStatusByPostId, filtered, recentJobIds, savedJobIds],
  );

  const profileKey = useSyncExternalStore(
    employeeProfileStorage.subscribe,
    () => {
      const profile = employeeProfileStorage.get();
      return `${profile.basePincode}|${profile.careerCommuteRadius}`;
    },
    () => "",
  );

  useEffect(() => {
    void hydrateNearbyCareerIdsFromServer();
    void hydrateCareerSavedJobsFromServer();
  }, [profileKey]);

  const nearbyKey = useSyncExternalStore(
    subscribeNearbyCareerIds,
    getNearbyCareerIdsKey,
    getNearbyCareerIdsKey,
  );

  const visiblePosts = useMemo(() => {
    void nearbyKey;
    const profile = employeeProfileStorage.get();
    return selectCareerDiscoveryVisiblePosts({
      discovered: getCareerDiscoveryPosts({
        activeTab,
        posts: filtered,
        savedJobIds,
        recentJobIds,
        applicationStatusByPostId,
      }),
      filtered,
      activeTab,
      query,
      locationQuery,
      nearbyIds: getNearbyCareerIds(),
      workerPincode: profile.basePincode,
      commuteRadiusKm: profile.careerCommuteRadius,
    });
  }, [
    activeTab,
    applicationStatusByPostId,
    filtered,
    locationQuery,
    nearbyKey,
    query,
    recentJobIds,
    savedJobIds,
  ]);

  const savedPosts = useMemo(
    () => mapCareerIdsToPosts(savedJobIds, discoverablePosts),
    [discoverablePosts, savedJobIds],
  );

  const recentPosts = useMemo(
    () => mapCareerIdsToPosts(recentJobIds, discoverablePosts),
    [discoverablePosts, recentJobIds],
  );

  const appliedPosts = useMemo(
    () =>
      discoverablePosts
        .filter((post) => Boolean(applicationStatusByPostId[post.id]))
        .sort(
          (a, b) =>
            (applicationStatusByPostId[b.id]?.updatedAt ?? 0) -
            (applicationStatusByPostId[a.id]?.updatedAt ?? 0),
        ),
    [applicationStatusByPostId, discoverablePosts],
  );

  const hasFilters =
    query.trim().length > 0 ||
    locationQuery.trim().length > 0 ||
    jobType !== "any" ||
    workMode !== "any" ||
    experience !== "any";

  function setQuery(value: string) {
    setQueryState(normalizeSearchText(value, MAX_SEARCH_QUERY_LENGTH));
  }

  function setLocationQuery(value: string) {
    setLocationQueryState(normalizeSearchText(value, MAX_LOCATION_QUERY_LENGTH));
  }

  function clearFilters() {
    setQueryState("");
    setLocationQueryState("");
    setJobType("any");
    setWorkMode("any");
    setExperience("any");
    setActiveTab("best");
  }

  function isDiscoverablePost(postId: string): boolean {
    return discoverablePosts.some((post) => post.id === postId);
  }

  function openDetails(postId: string) {
    if (!isDiscoverablePost(postId)) {
      setNotice("This job is no longer available.");
      return;
    }

    employeeCareerRecentlyViewedJobsStorage.markViewed(postId);
    nav(ROUTE_PATHS.employeeCareerPostDetails.replace(":postId", postId));
  }

  function openApplications() {
    nav(ROUTE_PATHS.employeeCareerApplications);
  }

  function toggleSaved(postId: string) {
    if (!isDiscoverablePost(postId)) {
      setNotice("This job is no longer available to save.");
      return;
    }

    const result = employeeCareerSavedJobsStorage.toggle(postId);
    setNotice(result.saved ? "Job saved." : "Job removed from saved jobs.");
  }

  function saveSearch() {
    if (!hasFilters) {
      setNotice("Choose a search term, location, or filter before saving this search.");
      return;
    }

    const combinedQuery = [query.trim(), locationQuery.trim()].filter(Boolean).join(" ");

    const criteria: CareerAlertCriteria = {
      domain: "career",
      query: combinedQuery || undefined,
      jobType: jobType !== "any" ? jobType : undefined,
      workMode: workMode !== "any" ? workMode : undefined,
      experience: experience !== "any" ? experience : undefined,
    };

    const result = jobAlertStorage.save("career", criteria);

    setNotice(
      result.success ? "Search saved on this device." : (result.reason ?? "Could not save search."),
    );
  }

  return {
    query,
    setQuery,
    locationQuery,
    setLocationQuery,
    jobType,
    setJobType,
    workMode,
    setWorkMode,
    experience,
    setExperience,
    activeTab,
    setActiveTab,
    notice,
    filtered,
    visiblePosts,
    discoveryTabs,
    activeResultTitle: getCareerDiscoveryResultTitle(activeTab),
    hasFilters,
    savedJobIds,
    savedPosts,
    recentPosts,
    appliedPosts,
    applicationStatusByPostId,
    clearFilters,
    openDetails,
    openApplications,
    toggleSaved,
    saveSearch,
  };
}
