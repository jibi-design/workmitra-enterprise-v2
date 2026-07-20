// App name: Job Mitra
// File name: shiftSearchHelpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\helpers\shiftSearchHelpers.ts

import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { employeeSettingsStorage } from "../../settings/storage/employeeSettings.storage";

type Rec = Record<string, unknown>;
type ActiveApplicationStatus = "applied" | "shortlisted" | "waiting" | "confirmed";

function safeArray(key: string): Rec[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is Rec => typeof x === "object" && x !== null);
  } catch {
    return [];
  }
}

function safeStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

const ACTIVE_APPLICATION_STATUSES = new Set<ActiveApplicationStatus>([
  "applied",
  "shortlisted",
  "waiting",
  "confirmed",
]);

function isActiveApplicationStatus(value: unknown): value is ActiveApplicationStatus {
  return (
    value === "applied" || value === "shortlisted" || value === "waiting" || value === "confirmed"
  );
}

const VIEWS_KEY = "wm_employee_shift_views_v1";
const FAVORITES_KEY = "wm_employee_shift_favorites_v1";
const MAX_VIEWS = 5;
const MAX_FAVORITES = 30;

export function trackShiftView(postId: string): void {
  try {
    const existing = safeStringArray(VIEWS_KEY);
    const filtered = existing.filter((id) => id !== postId);
    const next = [postId, ...filtered].slice(0, MAX_VIEWS);
    localStorage.setItem(VIEWS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("wm:employee-shift-views-changed"));
  } catch {
    /* local-first safe */
  }
}

export function getRecentlyViewedIds(): string[] {
  return safeStringArray(VIEWS_KEY).slice(0, MAX_VIEWS);
}

export function getFavoriteShiftIds(): string[] {
  return safeStringArray(FAVORITES_KEY).slice(0, MAX_FAVORITES);
}

export function isFavoriteShift(postId: string): boolean {
  return getFavoriteShiftIds().includes(postId);
}

export function toggleFavoriteShift(postId: string): string[] {
  const existing = getFavoriteShiftIds();
  const isSaved = existing.includes(postId);

  const next = isSaved
    ? existing.filter((id) => id !== postId)
    : [postId, ...existing.filter((id) => id !== postId)].slice(0, MAX_FAVORITES);

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("wm:employee-shift-favorites-changed"));
  } catch {
    /* local-first safe */
  }

  return next;
}

const APPS_KEY = "wm_employee_shift_applications_v1";
const POSTS_KEY = "wm_employer_shift_posts_v1";

export function getAppliedCategories(): string[] {
  const apps = safeArray(APPS_KEY);
  const posts = safeArray(POSTS_KEY);
  const postMap = new Map<string, string>();

  for (const p of posts) {
    const id = p["id"];
    const cat = p["category"];
    if (typeof id === "string" && typeof cat === "string") {
      postMap.set(id, cat);
    }
  }

  const cats = new Set<string>();
  for (const a of apps) {
    const postId = a["postId"];
    if (typeof postId === "string") {
      const cat = postMap.get(postId);
      if (cat) cats.add(cat);
    }
  }

  return Array.from(cats);
}

export function hasAnyApplications(): boolean {
  return safeArray(APPS_KEY).length > 0;
}

export function getActiveApplicationPostIds(): Set<string> {
  const apps = safeArray(APPS_KEY);
  const postIds = new Set<string>();

  for (const app of apps) {
    const postId = app["postId"];
    const status = app["status"];

    if (typeof postId === "string" && isActiveApplicationStatus(status)) {
      postIds.add(postId);
    }
  }

  return postIds;
}

export function isInActiveApplicationFlow(postId: string): boolean {
  return getActiveApplicationPostIds().has(postId);
}

export function isQuickApplyEnabled(): boolean {
  const settings = employeeSettingsStorage.get();
  return settings.quickApplyEnabled === true;
}

export function isProfileComplete(): boolean {
  const profile = employeeProfileStorage.get();
  return !!(profile.fullName.trim() && profile.city.trim() && profile.skills.length > 0);
}

export function quickApply(postId: string): boolean {
  if (!isQuickApplyEnabled() || !isProfileComplete()) return false;

  const apps = safeArray(APPS_KEY);
  const alreadyApplied = apps.some(
    (a) =>
      a["postId"] === postId &&
      ACTIVE_APPLICATION_STATUSES.has(a["status"] as ActiveApplicationStatus),
  );
  if (alreadyApplied) return false;

  const profile = employeeProfileStorage.get();
  const newApp = {
    id: `app_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
    postId,
    createdAt: Date.now(),
    status: "applied",
    profileSnapshot: {
      uniqueId: profile.uniqueId || undefined,
      fullName: profile.fullName.trim() || undefined,
      city: profile.city.trim() || undefined,
      experience: profile.experience || undefined,
      skills: profile.skills.length > 0 ? profile.skills : undefined,
      languages: profile.languages.length > 0 ? profile.languages : undefined,
    },
    mustHaveAnswers: {},
    goodToHaveAnswers: {},
    notes: {},
  };

  try {
    const raw = localStorage.getItem(APPS_KEY);
    const existing: unknown[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(APPS_KEY, JSON.stringify([newApp, ...existing]));
    window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
    return true;
  } catch {
    return false;
  }
}

export function isAlreadyApplied(postId: string): boolean {
  const apps = safeArray(APPS_KEY);
  return apps.some(
    (a) =>
      a["postId"] === postId &&
      ACTIVE_APPLICATION_STATUSES.has(a["status"] as ActiveApplicationStatus),
  );
}

export type PlanGroup = {
  key: string;
  planName: string;
  companyName: string;
  locationName: string;
  category: string;
  postIds: string[];
};

export function groupPostsByPlan(
  posts: {
    id: string;
    jobName: string;
    companyName: string;
    locationName: string;
    category: string;
  }[],
): PlanGroup[] {
  const map = new Map<string, PlanGroup>();

  for (const p of posts) {
    const key = `${p.jobName.trim().toLowerCase()}||${p.companyName.trim().toLowerCase()}`;
    const existing = map.get(key);

    if (existing) {
      existing.postIds.push(p.id);
    } else {
      map.set(key, {
        key,
        planName: p.jobName,
        companyName: p.companyName,
        locationName: p.locationName,
        category: p.category,
        postIds: [p.id],
      });
    }
  }

  return Array.from(map.values()).filter((g) => g.postIds.length >= 2);
}

export function multiApplyGroup(
  postIds: string[],
  meta?: { planId?: string; planApplyBatchId?: string; selectedDates?: string[] },
): number {
  if (!isProfileComplete()) return 0;

  const profile = employeeProfileStorage.get();
  const raw = localStorage.getItem(APPS_KEY);
  const existing: unknown[] = raw ? JSON.parse(raw) : [];

  const batchId = meta?.planApplyBatchId ?? `pb_${Date.now().toString(36)}`;

  const appliedPostIds = new Set(
    (existing as Rec[])
      .filter((a) => ACTIVE_APPLICATION_STATUSES.has(a["status"] as ActiveApplicationStatus))
      .map((a) => a["postId"] as string),
  );

  const newApps: unknown[] = [];

  for (const postId of postIds) {
    if (appliedPostIds.has(postId)) continue;

    newApps.push({
      id: `app_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
      postId,
      createdAt: Date.now(),
      status: "applied",
      planId: meta?.planId,
      planApplyBatchId: batchId,
      selectedDates: meta?.selectedDates,
      profileSnapshot: {
        uniqueId: profile.uniqueId || undefined,
        fullName: profile.fullName.trim() || undefined,
        city: profile.city.trim() || undefined,
        experience: profile.experience || undefined,
        skills: profile.skills.length > 0 ? profile.skills : undefined,
        languages: profile.languages.length > 0 ? profile.languages : undefined,
      },
      mustHaveAnswers: {},
      goodToHaveAnswers: {},
      notes: {},
    });
  }

  if (newApps.length === 0) return 0;

  try {
    localStorage.setItem(APPS_KEY, JSON.stringify([...newApps, ...existing]));
    window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
    return newApps.length;
  } catch {
    return 0;
  }
}
