// App name: Job Mitra
// File name: useEmployerShiftDashboardSnapshots.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\dashboard\useEmployerShiftDashboardSnapshots.ts

import { useMemo, useSyncExternalStore } from "react";
import {
  getActivitySnapshot,
  getAppsSnapshot,
  getPostsSnapshot,
  getWorkspacesSnapshot,
  subscribeDashboard,
} from "../../helpers/dashboardHelpers";

export function useEmployerShiftDashboardSnapshots(postId: string) {
  const posts = useSyncExternalStore(subscribeDashboard, getPostsSnapshot, getPostsSnapshot);
  const appsAll = useSyncExternalStore(subscribeDashboard, getAppsSnapshot, getAppsSnapshot);
  const activityAll = useSyncExternalStore(
    subscribeDashboard,
    getActivitySnapshot,
    getActivitySnapshot,
  );
  const workspacesAll = useSyncExternalStore(
    subscribeDashboard,
    getWorkspacesSnapshot,
    getWorkspacesSnapshot,
  );

  const post = useMemo(() => posts.find((item) => item.id === postId) ?? null, [posts, postId]);

  const apps = useMemo(
    () => appsAll.filter((application) => application.postId === postId),
    [appsAll, postId],
  );

  const activity = useMemo(
    () => activityAll.filter((item) => item.postId === postId).slice(0, 15),
    [activityAll, postId],
  );

  const workspace = useMemo(
    () => workspacesAll.find((item) => item.postId === postId) ?? null,
    [workspacesAll, postId],
  );

  return {
    post,
    apps,
    activity,
    workspace,
    hasApplications: apps.length > 0,
  };
}
