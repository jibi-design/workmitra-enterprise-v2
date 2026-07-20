/** Job Mitra | shiftSearch.storage.ts | C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftSearch.storage.ts */

import type {
  ShiftApplicationRecord,
  ShiftPayBasis,
  ShiftPostDemo,
  ShiftWorkspaceRecord,
} from "../types/shiftSearch.types";

const POSTS_KEY = "wm_employee_shift_search_v1";
const APPS_KEY = "wm_employee_shift_applications_v1";
const WORKSPACES_KEY = "wm_employee_shift_workspaces_v1";

const POSTS_CHANGED_EVENT = "wm:employee-shift-search-changed";
const APPS_CHANGED_EVENT = "wm:employee-shift-applications-changed";
const WORKSPACES_CHANGED_EVENT = "wm:employee-shift-workspaces-changed";

let cachedPostsRaw: string | null = null;
let cachedPostsSnapshot: ShiftPostDemo[] = [];

let cachedAppsRaw: string | null = null;
let cachedAppsSnapshot: ShiftApplicationRecord[] = [];

let cachedWorkspacesRaw: string | null = null;
let cachedWorkspacesSnapshot: ShiftWorkspaceRecord[] = [];

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(item: Record<string, unknown>, key: string, fallback = ""): string {
  const value = item[key];
  return typeof value === "string" ? value : fallback;
}

function readNumber(item: Record<string, unknown>, key: string, fallback = 0): number {
  const value = item[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readOptionalNumber(item: Record<string, unknown>, key: string): number | undefined {
  const value = item[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readStringArray(item: Record<string, unknown>, key: string): string[] {
  const value = item[key];
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

function normalizePayBasis(value: unknown): ShiftPayBasis | undefined {
  if (
    value === "per_hour" ||
    value === "per_day" ||
    value === "fixed_total" ||
    value === "not_listed"
  ) {
    return value;
  }

  return undefined;
}

function normalizeQuickQuestions(value: unknown): { id: string; text: string }[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((question) => ({
      id: readString(question, "id"),
      text: readString(question, "text"),
    }))
    .filter((question) => question.id.length > 0 && question.text.length > 0);
}

function normalizeJobType(value: unknown): ShiftPostDemo["jobType"] {
  if (value === "weekly" || value === "custom") return value;
  return "one-time";
}

function normalizePost(raw: unknown): ShiftPostDemo | null {
  if (!isRecord(raw)) return null;

  const id = readString(raw, "id");
  const jobName = readString(raw, "jobName");
  const companyName = readString(raw, "companyName");

  if (!id || !jobName || !companyName) return null;

  const experienceRaw = readString(raw, "experience", "helper");
  const experience =
    experienceRaw === "fresher_ok" || experienceRaw === "experienced" || experienceRaw === "helper"
      ? experienceRaw
      : "helper";

  const startAt = readNumber(raw, "startAt", 0);

  return {
    id,
    companyName,
    jobName,
    category: readString(raw, "category", "General"),
    experience,
    payPerDay: readNumber(raw, "payPerDay", 0),
    payBasis: normalizePayBasis(raw["payBasis"]),
    locationName: readString(raw, "locationName", "Work location"),
    distanceKm: readNumber(raw, "distanceKm", 0),
    startAt,
    endAt: readNumber(raw, "endAt", startAt),
    description: readString(raw, "description"),
    shiftTiming: readString(raw, "shiftTiming"),
    mapsLink: readString(raw, "mapsLink"),
    vacancies: readOptionalNumber(raw, "vacancies"),
    isHiddenFromSearch: raw.isHiddenFromSearch === true,
    mustHave: readStringArray(raw, "mustHave"),
    goodToHave: readStringArray(raw, "goodToHave"),
    whatWeProvide: readStringArray(raw, "whatWeProvide"),
    quickQuestions: normalizeQuickQuestions(raw["quickQuestions"]),
    dressCode: readString(raw, "dressCode"),
    jobType: normalizeJobType(raw["jobType"]),
  };
}

function normalizeApplication(raw: unknown): ShiftApplicationRecord | null {
  if (!isRecord(raw)) return null;

  const id = readString(raw, "id");
  const postId = readString(raw, "postId");
  const statusRaw = readString(raw, "status", "applied");

  if (!id || !postId) return null;

  const status =
    statusRaw === "applied" ||
    statusRaw === "shortlisted" ||
    statusRaw === "waiting" ||
    statusRaw === "confirmed" ||
    statusRaw === "rejected" ||
    statusRaw === "withdrawn" ||
    statusRaw === "replaced" ||
    statusRaw === "exited"
      ? statusRaw
      : "applied";

  return {
    id,
    postId,
    createdAt: readNumber(raw, "createdAt", 0),
    status,
  };
}

function normalizeWorkspace(raw: unknown): ShiftWorkspaceRecord | null {
  if (!isRecord(raw)) return null;

  const id = readString(raw, "id");
  const postId = readString(raw, "postId");
  const statusRaw = readString(raw, "status", "active");

  if (!id || !postId) return null;

  const status =
    statusRaw === "active" ||
    statusRaw === "upcoming" ||
    statusRaw === "completed" ||
    statusRaw === "left" ||
    statusRaw === "replaced"
      ? statusRaw
      : "active";

  return {
    id,
    postId,
    status,
  };
}

export function getShiftSearchPostsSnapshot(): ShiftPostDemo[] {
  const raw = localStorage.getItem(POSTS_KEY);

  if (raw === cachedPostsRaw) {
    return cachedPostsSnapshot;
  }

  cachedPostsRaw = raw;
  cachedPostsSnapshot = safeParseArray<unknown>(raw)
    .map(normalizePost)
    .filter((post): post is ShiftPostDemo => post !== null);

  return cachedPostsSnapshot;
}

export function getShiftSearchAppsSnapshot(): ShiftApplicationRecord[] {
  const raw = localStorage.getItem(APPS_KEY);

  if (raw === cachedAppsRaw) {
    return cachedAppsSnapshot;
  }

  cachedAppsRaw = raw;
  cachedAppsSnapshot = safeParseArray<unknown>(raw)
    .map(normalizeApplication)
    .filter((app): app is ShiftApplicationRecord => app !== null);

  return cachedAppsSnapshot;
}

export function getShiftSearchWorkspacesSnapshot(): ShiftWorkspaceRecord[] {
  const raw = localStorage.getItem(WORKSPACES_KEY);

  if (raw === cachedWorkspacesRaw) {
    return cachedWorkspacesSnapshot;
  }

  cachedWorkspacesRaw = raw;
  cachedWorkspacesSnapshot = safeParseArray<unknown>(raw)
    .map(normalizeWorkspace)
    .filter((workspace): workspace is ShiftWorkspaceRecord => workspace !== null);

  return cachedWorkspacesSnapshot;
}

export function subscribeShiftSearchPosts(callback: () => void): () => void {
  window.addEventListener(POSTS_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(POSTS_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function subscribeShiftSearchApps(callback: () => void): () => void {
  window.addEventListener(APPS_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(APPS_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function subscribeShiftSearchWorkspaces(callback: () => void): () => void {
  window.addEventListener(WORKSPACES_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(WORKSPACES_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function purgeDemoShiftSearchSeeds(): void {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    const posts = getShiftSearchPostsSnapshot();
    const cleaned = posts.filter((post) => !post.id.toLowerCase().startsWith("demo_"));

    if (cleaned.length !== posts.length) {
      const nextRaw = JSON.stringify(cleaned);

      localStorage.setItem(POSTS_KEY, nextRaw);
      cachedPostsRaw = nextRaw;
      cachedPostsSnapshot = cleaned;

      window.dispatchEvent(new Event(POSTS_CHANGED_EVENT));
      return;
    }

    cachedPostsRaw = raw;
  } catch {
    // Local-first safe: never block page render for storage cleanup.
  }
}
