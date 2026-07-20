// App name: Job Mitra
// File name: careerDiscoveryHelpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerDiscoveryHelpers.ts

import type { CareerSearchApplicationState, CareerSearchPost } from "./careerSearchHelpers";

export type CareerDiscoveryTabId = "best" | "new" | "closing" | "saved" | "applied" | "recent";

export type CareerDiscoveryTab = {
  id: CareerDiscoveryTabId;
  label: string;
  count: number;
  helper: string;
};

const NEW_JOB_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const CLOSING_SOON_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function isNewCareerJob(post: CareerSearchPost, now = Date.now()): boolean {
  return post.createdAt > 0 && now - post.createdAt <= NEW_JOB_WINDOW_MS;
}

export function isClosingSoonCareerJob(post: CareerSearchPost, now = Date.now()): boolean {
  return post.closingDate > now && post.closingDate - now <= CLOSING_SOON_WINDOW_MS;
}

export function buildCareerDiscoveryTabs({
  posts,
  savedJobIds,
  recentJobIds,
  applicationStatusByPostId,
  now = Date.now(),
}: {
  posts: CareerSearchPost[];
  savedJobIds: string[];
  recentJobIds: string[];
  applicationStatusByPostId: Record<string, CareerSearchApplicationState>;
  now?: number;
}): CareerDiscoveryTab[] {
  return [
    {
      id: "best",
      label: "Best Match",
      count: posts.length,
      helper: "Sorted by local job signals.",
    },
    {
      id: "new",
      label: "New Jobs",
      count: posts.filter((post) => isNewCareerJob(post, now)).length,
      helper: "Fresh career posts.",
    },
    {
      id: "closing",
      label: "Closing Soon",
      count: posts.filter((post) => isClosingSoonCareerJob(post, now)).length,
      helper: "Roles near deadline.",
    },
    {
      id: "saved",
      label: "Saved",
      count: posts.filter((post) => savedJobIds.includes(post.id)).length,
      helper: "Jobs saved to review later.",
    },
    {
      id: "applied",
      label: "Applied",
      count: posts.filter((post) => Boolean(applicationStatusByPostId[post.id])).length,
      helper: "Applications already submitted.",
    },
    {
      id: "recent",
      label: "Recent",
      count: posts.filter((post) => recentJobIds.includes(post.id)).length,
      helper: "Recently opened jobs.",
    },
  ];
}

export function getCareerDiscoveryPosts({
  activeTab,
  posts,
  savedJobIds,
  recentJobIds,
  applicationStatusByPostId,
  now = Date.now(),
}: {
  activeTab: CareerDiscoveryTabId;
  posts: CareerSearchPost[];
  savedJobIds: string[];
  recentJobIds: string[];
  applicationStatusByPostId: Record<string, CareerSearchApplicationState>;
  now?: number;
}): CareerSearchPost[] {
  if (activeTab === "new") {
    return posts.filter((post) => isNewCareerJob(post, now));
  }

  if (activeTab === "closing") {
    return posts.filter((post) => isClosingSoonCareerJob(post, now));
  }

  if (activeTab === "saved") {
    return posts.filter((post) => savedJobIds.includes(post.id));
  }

  if (activeTab === "applied") {
    return posts.filter((post) => Boolean(applicationStatusByPostId[post.id]));
  }

  if (activeTab === "recent") {
    return recentJobIds
      .map((id) => posts.find((post) => post.id === id) ?? null)
      .filter((post): post is CareerSearchPost => post !== null);
  }

  return [...posts].sort((a, b) => {
    const scoreA = scoreCareerPost(a, savedJobIds, applicationStatusByPostId, now);
    const scoreB = scoreCareerPost(b, savedJobIds, applicationStatusByPostId, now);

    if (scoreA !== scoreB) return scoreB - scoreA;
    return b.createdAt - a.createdAt;
  });
}

export function getCareerDiscoveryResultTitle(activeTab: CareerDiscoveryTabId): string {
  if (activeTab === "new") return "New career jobs";
  if (activeTab === "closing") return "Closing soon";
  if (activeTab === "saved") return "Saved jobs";
  if (activeTab === "applied") return "Applied jobs";
  if (activeTab === "recent") return "Recently viewed";
  return "Best matches";
}

export function getCareerDiscoveryLabels({
  post,
  isSaved,
  applicationStatus,
  now = Date.now(),
}: {
  post: CareerSearchPost;
  isSaved: boolean;
  applicationStatus?: CareerSearchApplicationState;
  now?: number;
}): string[] {
  const labels: string[] = [];

  if (applicationStatus) labels.push(formatApplicationStage(applicationStatus.stage));
  if (isSaved) labels.push("Saved");
  if (isNewCareerJob(post, now)) labels.push("New");
  if (isClosingSoonCareerJob(post, now)) labels.push("Closing soon");
  if (typeof post.noticePeriodDays === "number" && post.noticePeriodDays <= 0)
    labels.push("No notice");

  return labels.slice(0, 3);
}

function scoreCareerPost(
  post: CareerSearchPost,
  savedJobIds: string[],
  applicationStatusByPostId: Record<string, CareerSearchApplicationState>,
  now: number,
): number {
  let score = 0;

  if (savedJobIds.includes(post.id)) score += 14;
  if (isNewCareerJob(post, now)) score += 12;
  if (isClosingSoonCareerJob(post, now)) score += 10;
  if (typeof post.noticePeriodDays === "number" && post.noticePeriodDays <= 30) score += 8;
  if (post.salaryMin > 0 || post.salaryMax > 0) score += 5;
  if (post.location.trim()) score += 3;
  if (applicationStatusByPostId[post.id]) score -= 30;

  return score;
}

function formatApplicationStage(stage: CareerSearchApplicationState["stage"]): string {
  if (stage === "shortlisted") return "Shortlisted";
  if (stage === "interview") return "Interview";
  if (stage === "offered") return "Offer";
  if (stage === "offer_accepted") return "Offer Accepted";
  if (stage === "hired") return "Hired";
  return "Applied";
}
