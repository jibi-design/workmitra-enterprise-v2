// src/features/employer/shiftJobs/helpers/shiftHomeHelpers.ts
// Cache, count, and status helpers for EmployerShiftHomePage.

import {
  employerShiftStorage,
  type ShiftPost,
} from "../../shiftJobs/storage/employerShift.storage";
import { countApplicationsForPostIndexed } from "./appsByPostIndex";
import { getEmpPostsKey, getEmployerWorkspacesKey } from "../storage/employerShift.keys";
import { SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT } from "../../../shared/shift/shiftEmployerScope";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */

export const POSTS_CHANGED_EVENT = employerShiftStorage._events.employerShiftPostsChanged;

/* ------------------------------------------------ */
/* Stable-reference posts cache                     */
/* ------------------------------------------------ */
let cachedRaw: string | null = "__init__";
let cachedKey = "";
let cachedPosts: ShiftPost[] = [];

export function getPostsSnapshot(): ShiftPost[] {
  const key = getEmpPostsKey();
  const raw = localStorage.getItem(key);
  if (raw !== cachedRaw || key !== cachedKey) {
    cachedRaw = raw;
    cachedKey = key;
    cachedPosts = employerShiftStorage.getPosts();
  }
  return cachedPosts;
}

export function subscribePosts(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(POSTS_CHANGED_EVENT, handler);
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  window.addEventListener(SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT, handler);
  document.addEventListener("visibilitychange", handler);
  return () => {
    window.removeEventListener(POSTS_CHANGED_EVENT, handler);
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    window.removeEventListener(SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT, handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

/* ------------------------------------------------ */
/* Application count helper                         */
/* ------------------------------------------------ */
export function countApplicationsForPost(postId: string, statusFilter?: string): number {
  return countApplicationsForPostIndexed(postId, statusFilter);
}

export type ConfirmWaitingPost = {
  readonly postId: string;
  readonly jobName: string;
  readonly shortlisted: number;
  readonly remaining: number;
};

export function findConfirmWaitingPost(posts: readonly ShiftPost[]): ConfirmWaitingPost | null {
  for (const post of posts) {
    if (post.status === "completed" || post.status === "cancelled") continue;
    const remaining = Math.max(0, post.vacancies - post.confirmedIds.length);
    const shortlisted = countApplicationsForPost(post.id, "shortlisted");
    if (remaining > 0 && shortlisted > 0) {
      return { postId: post.id, jobName: post.jobName, shortlisted, remaining };
    }
  }
  return null;
}

export function shiftPostDashboardPath(
  postId: string,
  tab?: "shortlisted" | "applied" | "selected",
): string {
  const base = ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId);
  return tab ? `${base}?tab=${tab}` : base;
}

/* ------------------------------------------------ */
/* Active workspace group count                     */
/* ------------------------------------------------ */
export function countActiveWorkspaceGroups(): number {
  try {
    const raw = localStorage.getItem(getEmployerWorkspacesKey());
    if (!raw) return 0;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    return parsed.filter(
      (w) =>
        typeof w === "object" &&
        w !== null &&
        (w as Record<string, unknown>)["status"] === "active",
    ).length;
  } catch {
    return 0;
  }
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
