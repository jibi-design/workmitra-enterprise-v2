// App name: Job Mitra
// File name: useCareerDashboardData.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\hooks\careerPostDashboard\useCareerDashboardData.ts

import { useMemo, useSyncExternalStore } from "react";
import type { CareerTab } from "../../components/CareerPipelineTabs";
import {
  fmtDateTime,
  getCareerActivitySnapshot,
  getCareerAppsSnapshot,
  getCareerPostsSnapshot,
  subscribeCareerDashboard,
} from "../../helpers/careerDashboardHelpers";
import type { CareerApplication } from "../../types/careerTypes";

export function useCareerDashboardData(postId: string) {
  const posts = useSyncExternalStore(
    subscribeCareerDashboard,
    getCareerPostsSnapshot,
    getCareerPostsSnapshot,
  );

  const appsAll = useSyncExternalStore(
    subscribeCareerDashboard,
    getCareerAppsSnapshot,
    getCareerAppsSnapshot,
  );

  const activityAll = useSyncExternalStore(
    subscribeCareerDashboard,
    getCareerActivitySnapshot,
    getCareerActivitySnapshot,
  );

  const post = useMemo(() => posts.find((item) => item.id === postId) ?? null, [posts, postId]);

  const apps = useMemo(() => appsAll.filter((app) => app.jobId === postId), [appsAll, postId]);

  const activity = useMemo(
    () => activityAll.filter((entry) => entry.postId === postId).slice(0, 20),
    [activityAll, postId],
  );

  const appliedApps = useMemo(() => apps.filter((app) => app.stage === "applied"), [apps]);

  const shortlistedApps = useMemo(() => apps.filter((app) => app.stage === "shortlisted"), [apps]);

  const interviewApps = useMemo(() => apps.filter((app) => app.stage === "interview"), [apps]);

  const offeredApps = useMemo(
    () => apps.filter((app) => app.stage === "offered" || app.stage === "offer_accepted"),
    [apps],
  );

  const hiredApps = useMemo(() => apps.filter((app) => app.stage === "hired"), [apps]);

  const rejectedApps = useMemo(
    () => apps.filter((app) => app.stage === "rejected" || app.stage === "withdrawn"),
    [apps],
  );

  const tabCounts: Record<CareerTab, number> = {
    applied: appliedApps.length,
    backup: 0,
    shortlisted: shortlistedApps.length,
    interview: interviewApps.length,
    offered: offeredApps.length,
    hired: hiredApps.length,
    rejected: rejectedApps.length,
  };

  const tabApps: Record<CareerTab, CareerApplication[]> = {
    applied: appliedApps,
    backup: [],
    shortlisted: shortlistedApps,
    interview: interviewApps,
    offered: offeredApps,
    hired: hiredApps,
    rejected: rejectedApps,
  };

  const postClosingText = post?.closingDate ? fmtDateTime(post.closingDate) : "";

  return {
    post,
    apps,
    activity,
    tabCounts,
    tabApps,
    postClosingText,
  };
}
