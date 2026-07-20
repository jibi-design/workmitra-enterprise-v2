// App name: Job Mitra
// File name: employerCareerPostList.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\employerCareerPostList.helpers.ts

import type { CareerJobPost, CareerPostStatus } from "../types/careerTypes";

export type CareerPostStatusFilter = "all" | CareerPostStatus;

const STATUS_ORDER: Record<CareerPostStatus, number> = {
  active: 1,
  paused: 2,
  draft: 3,
  filled: 4,
  closed: 5,
};

export function getCareerPostStatusLabel(status: CareerPostStatus): string {
  if (status === "active") return "Active";
  if (status === "paused") return "Paused";
  if (status === "draft") return "Draft";
  if (status === "filled") return "Filled";
  return "Closed";
}

export function getCareerPostStatusStyle(status: CareerPostStatus): React.CSSProperties {
  if (status === "active") {
    return {
      color: "#1e3a8a",
      background: "rgba(29,78,216,0.1)",
    };
  }

  if (status === "filled") {
    return {
      color: "#3730a3",
      background: "rgba(29,78,216,0.08)",
    };
  }

  if (status === "paused") {
    return {
      color: "#b45309",
      background: "rgba(217,119,6,0.08)",
    };
  }

  return {
    color: "rgba(15,23,42,0.62)",
    background: "rgba(15,23,42,0.055)",
  };
}

export function formatPostDate(timestamp?: number): string {
  if (!timestamp) return "Not recorded";

  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Not recorded";
  }
}

export function sortCareerPostsForList(posts: CareerJobPost[]): CareerJobPost[] {
  return [...posts].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;

    return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
  });
}

export function filterCareerPosts(params: {
  posts: CareerJobPost[];
  query: string;
  status: CareerPostStatusFilter;
}): CareerJobPost[] {
  const normalizedQuery = params.query.trim().toLowerCase();

  return sortCareerPostsForList(params.posts).filter((post) => {
    if (params.status !== "all" && post.status !== params.status) return false;

    if (!normalizedQuery) return true;

    const searchBody = [
      post.jobTitle,
      post.companyName,
      post.department,
      post.location,
      post.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchBody.includes(normalizedQuery);
  });
}
