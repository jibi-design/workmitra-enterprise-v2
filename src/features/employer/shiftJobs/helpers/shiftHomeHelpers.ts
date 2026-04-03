// src/features/employer/shiftJobs/helpers/shiftHomeHelpers.ts
// Cache, count, and status helpers for EmployerShiftHomePage.

import { employerShiftStorage, type ShiftPost } from "../storage/employerShift.storage";

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const APPS_KEY = "wm_employee_shift_applications_v1";
const WS_KEY   = "wm_employee_shift_workspaces_v1";

export const POSTS_CHANGED_EVENT = employerShiftStorage._events.employerShiftPostsChanged;

/* ------------------------------------------------ */
/* Stable-reference posts cache                     */
/* ------------------------------------------------ */
let cachedRaw: string | null = "__init__";
let cachedPosts: ShiftPost[] = [];

export function getPostsSnapshot(): ShiftPost[] {
  const raw = localStorage.getItem("wm_employer_shift_posts_v1");
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedPosts = employerShiftStorage.getPosts();
  }
  return cachedPosts;
}

export function subscribePosts(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(POSTS_CHANGED_EVENT, handler);
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);
  return () => {
    window.removeEventListener(POSTS_CHANGED_EVENT, handler);
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

/* ------------------------------------------------ */
/* Application count helper                         */
/* ------------------------------------------------ */
export function countApplicationsForPost(postId: string, statusFilter?: string): number {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) return 0;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    return parsed.filter((item) => {
      if (typeof item !== "object" || item === null) return false;
      const rec = item as Record<string, unknown>;
      if (rec["postId"] !== postId) return false;
      if (statusFilter) return rec["status"] === statusFilter;
      return true;
    }).length;
  } catch { return 0; }
}

/* ------------------------------------------------ */
/* Active workspace group count                     */
/* ------------------------------------------------ */
export function countActiveWorkspaceGroups(): number {
  try {
    const raw = localStorage.getItem(WS_KEY);
    if (!raw) return 0;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    return parsed.filter(
      (w) => typeof w === "object" && w !== null &&
        (w as Record<string, unknown>)["status"] === "active",
    ).length;
  } catch { return 0; }
}

/* ------------------------------------------------ */
/* Post status display                              */
/* ------------------------------------------------ */
export type PostStatusDisplay = { label: string; color: string };

export function getPostStatusDisplay(post: ShiftPost): PostStatusDisplay {
  if (post.status === "completed") return { label: "Completed", color: "var(--wm-er-muted)" };
  if (post.status === "cancelled") return { label: "Cancelled", color: "var(--wm-error)" };
  if (post.confirmedIds.length > 0) return { label: "Active", color: "var(--wm-success)" };
  if (post.analysisStatus === "done") return { label: "Analyzed", color: "var(--wm-warning)" };
  return { label: "Open", color: "var(--wm-er-accent-shift)" };
}

/* ------------------------------------------------ */
/* KPI zero-value color helper                      */
/* ------------------------------------------------ */
export function tileColor(value: number, activeColor?: string): React.CSSProperties | undefined {
  if (value === 0) return undefined;
  if (activeColor) return { color: activeColor };
  return undefined;
}

/* ------------------------------------------------ */
/* How It Works steps                               */
/* ------------------------------------------------ */
export const HOW_IT_WORKS = [
  { n: "1", text: "Create a shift post with job details" },
  { n: "2", text: "Workers see your post and apply" },
  { n: "3", text: "Open your post and tap Find Best Candidates" },
  { n: "4", text: "Confirm workers \u2014 a Work Group is created" },
] as const;