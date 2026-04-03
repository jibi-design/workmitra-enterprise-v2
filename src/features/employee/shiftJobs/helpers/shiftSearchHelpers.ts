// src/features/employee/shiftJobs/helpers/shiftSearchHelpers.ts

import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { employeeSettingsStorage } from "../../settings/storage/employeeSettings.storage";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
type Rec = Record<string, unknown>;

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

/* ------------------------------------------------ */
/* Recently Viewed                                  */
/* ------------------------------------------------ */
const VIEWS_KEY = "wm_employee_shift_views_v1";
const MAX_VIEWS = 5;

export function trackShiftView(postId: string): void {
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((id) => id !== postId);
    const next = [postId, ...filtered].slice(0, MAX_VIEWS);
    localStorage.setItem(VIEWS_KEY, JSON.stringify(next));
  } catch { /* demo-safe */ }
}

export function getRecentlyViewedIds(): string[] {
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------ */
/* Recommended — based on past application categories */
/* ------------------------------------------------ */
const APPS_KEY = "wm_employee_shift_applications_v1";
const POSTS_KEY = "wm_employee_shift_posts_demo_v1";

export function getAppliedCategories(): string[] {
  const apps = safeArray(APPS_KEY);
  const posts = safeArray(POSTS_KEY);
  const postMap = new Map<string, string>();

  for (const p of posts) {
    const id = p["id"];
    const cat = p["category"];
    if (typeof id === "string" && typeof cat === "string") postMap.set(id, cat);
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

/* ------------------------------------------------ */
/* Quick Apply                                      */
/* ------------------------------------------------ */
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
    (a) => a["postId"] === postId && a["status"] === "applied",
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
    try { window.dispatchEvent(new Event("wm:employee-shift-applications-changed")); } catch { /* */ }
    return true;
  } catch {
    return false;
  }
}

export function isAlreadyApplied(postId: string): boolean {
  const apps = safeArray(APPS_KEY);
  return apps.some((a) => a["postId"] === postId && a["status"] === "applied");
}

/* ------------------------------------------------ */
/* Multi-day plan grouping                          */
/* ------------------------------------------------ */
export type PlanGroup = {
  key: string;
  planName: string;
  companyName: string;
  locationName: string;
  category: string;
  postIds: string[];
};

/** Group posts that share same jobName + companyName (2+ posts = plan) */
export function groupPostsByPlan(posts: { id: string; jobName: string; companyName: string; locationName: string; category: string }[]): PlanGroup[] {
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

/** Apply to multiple posts at once — skips already-applied */
export function multiApplyGroup(postIds: string[]): number {
  if (!isProfileComplete()) return 0;
  const profile = employeeProfileStorage.get();
  const raw = localStorage.getItem(APPS_KEY);
  const existing: unknown[] = raw ? JSON.parse(raw) : [];
  const appliedPostIds = new Set(
    (existing as Rec[])
      .filter((a) => a["status"] === "applied")
      .map((a) => a["postId"] as string)
  );

  const newApps: unknown[] = [];
  for (const postId of postIds) {
    if (appliedPostIds.has(postId)) continue;
    newApps.push({
      id: `app_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
      postId,
      createdAt: Date.now(),
      status: "applied",
      profileSnapshot: {
        uniqueId:   profile.uniqueId || undefined,
        fullName:   profile.fullName.trim() || undefined,
        city:       profile.city.trim() || undefined,
        experience: profile.experience || undefined,
        skills:     profile.skills.length > 0 ? profile.skills : undefined,
        languages:  profile.languages.length > 0 ? profile.languages : undefined,
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
  } catch { return 0; }
}