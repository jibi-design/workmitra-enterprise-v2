// App name: Job Mitra
// File name: useShiftControlCenterState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\useShiftControlCenterState.ts

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { getPendingShiftReviewCount } from "../../../shared/reviewCenter/adapters/employeeShiftReviewCenter.adapter";
import { reviewCenterStorage } from "../../../shared/reviewCenter/storage/reviewCenter.storage";
import { shiftWorkspacesStorage } from "../../shiftJobs/storage/shiftWorkspaces.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { availabilityStorage } from "../storage/availabilityStorage";
import {
  computeControlCenterCounts,
  getBroadcastSnapshot,
  getControlCenterSnapshot,
  subscribeControlCenter,
} from "../storage/shiftControlCenter.storage";

export function useShiftControlCenterState() {
  const nav = useNavigate();

  const data = useSyncExternalStore(
    subscribeControlCenter,
    getControlCenterSnapshot,
    getControlCenterSnapshot,
  );

  const counts = useMemo(
    () => computeControlCenterCounts(data.posts, data.apps, data.workspaces),
    [data.posts, data.apps, data.workspaces],
  );

  const [howOpen, setHowOpen] = useState(() => counts.totalApps === 0);

  const myBroadcast = useSyncExternalStore(
    availabilityStorage.subscribe,
    getBroadcastSnapshot,
    getBroadcastSnapshot,
  );

  const selectedDates = myBroadcast?.selectedDates ?? [];

  const workspaces = useSyncExternalStore(
    shiftWorkspacesStorage.subscribe,
    shiftWorkspacesStorage.getAll,
    shiftWorkspacesStorage.getAll,
  );

  const reviewRequests = useSyncExternalStore(
    reviewCenterStorage.subscribe,
    reviewCenterStorage.getAll,
    reviewCenterStorage.getAll,
  );

  const shiftReviewPendingCount = useMemo(() => {
    const pendingReviewCount = getPendingShiftReviewCount(workspaces);

    const pendingWorkspaceIds = new Set(
      workspaces
        .filter((workspace) => workspace.status === "completed" && !workspace.rating)
        .map((workspace) => workspace.id),
    );

    const incomingRequestCount = reviewRequests.filter((request) => {
      return (
        request.domain === "shift" &&
        request.toRole === "employee" &&
        request.action === "employer_request_employee_review" &&
        request.status === "active" &&
        !pendingWorkspaceIds.has(request.sourceId)
      );
    }).length;

    return pendingReviewCount + incomingRequestCount;
  }, [reviewRequests, workspaces]);

  const previewPosts = useMemo(
    () => counts.discoverablePosts.slice(0, 3),
    [counts.discoverablePosts],
  );

  const openSearch = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftSearch);
  }, [nav]);

  const openApplications = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftApplications);
  }, [nav]);

  const openEarnings = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftEarnings);
  }, [nav]);

  const openWorkspaces = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftWorkspaces);
  }, [nav]);

  const openReviewCenter = useCallback(() => {
    nav(ROUTE_PATHS.employeeReviewCenter);
  }, [nav]);

  const openPost = useCallback(
    (postId: string) => {
      nav(ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", postId));
    },
    [nav],
  );

  const toggleHowOpen = useCallback(() => {
    setHowOpen((current) => !current);
  }, []);

  const handleToggleDay = useCallback((iso: string) => {
    const profile = employeeProfileStorage.get();

    availabilityStorage.toggleMyDate(iso, {
      workerWmId: profile.uniqueId || `anon_${Date.now()}`,
      workerName: profile.fullName.trim() || "Worker",
      city: profile.city.trim() || undefined,
    });
  }, []);

  return {
    counts,
    previewPosts,
    howOpen,
    myBroadcast,
    selectedDates,
    shiftReviewPendingCount,
    openSearch,
    openApplications,
    openEarnings,
    openWorkspaces,
    openReviewCenter,
    openPost,
    toggleHowOpen,
    handleToggleDay,
  };
}
