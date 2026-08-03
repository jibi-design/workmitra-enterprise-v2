// App name: Job Mitra
// File name: employerShiftPosts.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\helpers\employerShiftPosts.helpers.ts

import {
  employerShiftStorage,
  type ShiftPost,
} from "../../shiftJobs/storage/employerShift.storage";
import { countApplicationsForPostIndexed } from "./appsByPostIndex";
import { getEmpPostsKey } from "../storage/employerShift.keys";
import { SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT } from "../../../shared/shift/shiftEmployerScope";

let postsRawCache: string | null = null;
let postsKeyCache = "";
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
  return countApplicationsForPostIndexed(postId, "applied");
}

export function getEmployerShiftPostsSnapshot(): ShiftPost[] {
  const key = getEmpPostsKey();
  const raw = localStorage.getItem(key);

  if (raw === postsRawCache && key === postsKeyCache) return postsListCache;

  postsRawCache = raw;
  postsKeyCache = key;
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
  window.addEventListener(SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);
    window.removeEventListener(postsEvent, handler);
    window.removeEventListener(appsEvent, handler);
    window.removeEventListener(SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT, handler);
  };
}
