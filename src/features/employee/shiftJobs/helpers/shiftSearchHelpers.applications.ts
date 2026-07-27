import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { employeeSettingsStorage } from "../../settings/storage/employeeSettings.storage";
import { hydrateShiftApplicationsFromServer } from "../../../shift/services/shiftDbTruth.service";
import { isShiftApiSyncEnabled } from "../../../shift/services/shiftGateApi.service";
import { APPS_KEY, POSTS_KEY, safeArray } from "./shiftSearchHelpers.storage";

type ActiveApplicationStatus = "applied" | "shortlisted" | "waiting" | "confirmed";

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
  if (isShiftApiSyncEnabled()) {
    void hydrateShiftApplicationsFromServer();
  }

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
  if (isShiftApiSyncEnabled()) return false;

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
