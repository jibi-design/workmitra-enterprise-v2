// src/features/employer/careerJobs/helpers/careerDashboardHelpers.ts
//
// Cached snapshots for useSyncExternalStore + subscription helper.
// Career Jobs domain — Indigo accent.

import type {
  CareerJobPost,
  CareerApplication,
  EmployerCareerActivityEntry,
} from "../types/careerTypes";

import {
  CAREER_POSTS_CHANGED,
  CAREER_APPS_CHANGED,
  CAREER_ACTIVITY_CHANGED,
  CAREER_WORKSPACES_CHANGED,
} from "./careerStorageUtils";

import { tryResolveCareerEmployerScopedKey } from "../../../shared/career/careerEmployerScope";
import { readCareerPosts, readCareerApps, readCareerActivityAll } from "./careerNormalizers";

import { recomputePostAnalytics } from "./careerValidation";

// ─────────────────────────────────────────────────────────────────────────────
// localStorage Keys (read-only references for cache comparison)
// ─────────────────────────────────────────────────────────────────────────────

function appsLsKey(): string | null {
  return tryResolveCareerEmployerScopedKey("career_applications_v1");
}

function postsLsKey(): string | null {
  return tryResolveCareerEmployerScopedKey("career_posts_v1");
}

function activityLsKey(): string | null {
  return tryResolveCareerEmployerScopedKey("career_activity_log_v1");
}

// ─────────────────────────────────────────────────────────────────────────────
// Cached Snapshots (avoid re-parsing on every render)
// ─────────────────────────────────────────────────────────────────────────────

let postsCacheRaw: string | null = null;
let postsAppsCacheRaw: string | null = null;
let postsCacheList: CareerJobPost[] = [];

export function getCareerPostsSnapshot(): CareerJobPost[] {
  const postKey = postsLsKey();
  const appKey = appsLsKey();
  if (!postKey || !appKey) {
    postsCacheRaw = null;
    postsAppsCacheRaw = null;
    postsCacheList = [];
    return postsCacheList;
  }

  try {
    const raw = localStorage.getItem(postKey);
    const appsRaw = localStorage.getItem(appKey);

    if (raw === postsCacheRaw && appsRaw === postsAppsCacheRaw) {
      return postsCacheList;
    }

    postsCacheRaw = raw;
    postsAppsCacheRaw = appsRaw;

    const posts = readCareerPosts();
    const apps = readCareerApps();

    postsCacheList = posts.map((p) => recomputePostAnalytics(p, apps));
    return postsCacheList;
  } catch {
    postsCacheList = [];
    return postsCacheList;
  }
}

let appsCacheRaw: string | null = null;
let appsCacheList: CareerApplication[] = [];

export function getCareerAppsSnapshot(): CareerApplication[] {
  const key = appsLsKey();
  if (!key) {
    appsCacheRaw = null;
    appsCacheList = [];
    return appsCacheList;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw === appsCacheRaw) return appsCacheList;
    appsCacheRaw = raw;
    appsCacheList = readCareerApps();
    return appsCacheList;
  } catch {
    appsCacheList = [];
    return appsCacheList;
  }
}

let actCacheRaw: string | null = null;
let actCacheList: EmployerCareerActivityEntry[] = [];

export function getCareerActivitySnapshot(): EmployerCareerActivityEntry[] {
  const key = activityLsKey();
  if (!key) {
    actCacheRaw = null;
    actCacheList = [];
    return actCacheList;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw === actCacheRaw) return actCacheList;
    actCacheRaw = raw;
    actCacheList = readCareerActivityAll();
    return actCacheList;
  } catch {
    actCacheList = [];
    return actCacheList;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription (same-tab real-time sync)
// ─────────────────────────────────────────────────────────────────────────────

export function subscribeCareerDashboard(cb: () => void): () => void {
  const handler = () => cb();

  const events: string[] = [
    "storage",
    "focus",
    CAREER_POSTS_CHANGED,
    CAREER_APPS_CHANGED,
    CAREER_ACTIVITY_CHANGED,
    CAREER_WORKSPACES_CHANGED,
  ];

  for (const ev of events) window.addEventListener(ev, handler);
  document.addEventListener("visibilitychange", handler);

  return () => {
    for (const ev of events) window.removeEventListener(ev, handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Format Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function fmtDateTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function fmtDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
