// App name: Job Mitra
// File name: employerShiftPosts.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\helpers\employerShiftPosts.helpers.ts

import {
  employerShiftStorage,
  type ShiftPost,
} from "../../shiftJobs/storage/employerShift.storage";

const APPS_KEY = "wm_employee_shift_applications_v1";

let postsRawCache: string | null = null;
let postsListCache: ShiftPost[] = [];

export function formatShiftPostDateRange(startAt: number, endAt: number): string {
  try {
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    const startText = startDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    const endText = endDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    return startDate.toDateString() === endDate.toDateString()
      ? startText
      : `${startText} - ${endText}`;
  } catch {
    return "Date";
  }
}

export function getShiftPostStatusLabel(post: ShiftPost): string {
  if (post.status === "completed") return "Completed";
  if (post.status === "cancelled") return post.endAt < Date.now() ? "Expired" : "Cancelled";
  if (post.confirmedIds.length > 0) return "Active";
  if (post.analysisStatus === "done") return "Reviewed";
  return "Open";
}

export function getShiftPostStatusColor(post: ShiftPost): string {
  if (post.status === "completed") return "var(--wm-er-muted)";
  if (post.status === "cancelled") return "var(--wm-error, #dc2626)";
  if (post.confirmedIds.length > 0) return "var(--wm-success)";
  if (post.analysisStatus === "done") return "var(--wm-warning)";
  return "var(--wm-er-accent-shift)";
}

export function countAppliedAppsForPost(postId: string): number {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) return 0;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;

    return parsed.filter((item) => {
      if (typeof item !== "object" || item === null) return false;

      const record = item as Record<string, unknown>;

      return record["postId"] === postId && record["status"] === "applied";
    }).length;
  } catch {
    return 0;
  }
}

export function getEmployerShiftPostsSnapshot(): ShiftPost[] {
  const raw = localStorage.getItem("wm_employer_shift_posts_v1");

  if (raw === postsRawCache) return postsListCache;

  postsRawCache = raw;
  postsListCache = employerShiftStorage.getPosts();

  return postsListCache;
}

export function subscribeEmployerShiftPosts(callback: () => void): () => void {
  const handler = () => callback();

  const postsEvent =
    employerShiftStorage._events?.employerShiftPostsChanged ?? "wm:employer-shift-posts-changed";

  const appsEvent =
    employerShiftStorage._events?.employeeAppsChanged ?? "wm:employee-shift-applications-changed";

  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);
  window.addEventListener(postsEvent, handler);
  window.addEventListener(appsEvent, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);
    window.removeEventListener(postsEvent, handler);
    window.removeEventListener(appsEvent, handler);
  };
}
