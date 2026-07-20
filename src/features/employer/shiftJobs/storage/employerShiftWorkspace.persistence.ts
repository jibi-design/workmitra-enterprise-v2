// App name: Job Mitra
// File name: employerShiftWorkspace.persistence.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShiftWorkspace.persistence.ts

// Single read/write/cache layer for wm_employee_shift_workspaces_v1 (employer paths).
// shiftWorkspaceStorage.ts and employerShift.employeeWorkspaces.ts must use this only.

import type {
  ShiftWorkspace,
  ShiftWorkspaceCategory,
  ShiftWorkspaceStatus,
  ShiftWorkspaceUpdate,
} from "../types/shiftWorkspaceTypes";
import { EMPLOYEE_WORKSPACES_CHANGED_EVENT, EMPLOYEE_WORKSPACES_KEY } from "./employerShift.keys";
import { safeWrite, type JsonStorageWriteResult } from "./employerShift.utils";

export type EmployerShiftWorkspaceWriteResult = JsonStorageWriteResult;

type Rec = Record<string, unknown>;

function isRec(value: unknown): value is Rec {
  return typeof value === "object" && value !== null;
}

function str(record: Rec, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function num(record: Rec, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function clampCategory(value: unknown): ShiftWorkspaceCategory {
  if (
    value === "construction" ||
    value === "kitchen" ||
    value === "office" ||
    value === "delivery"
  ) {
    return value;
  }

  return "other";
}

function clampStatus(value: unknown): ShiftWorkspaceStatus {
  if (
    value === "active" ||
    value === "upcoming" ||
    value === "completed" ||
    value === "left" ||
    value === "replaced" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "active";
}

function clampUpdateKind(value: unknown): ShiftWorkspaceUpdate["kind"] {
  if (value === "broadcast" || value === "direct" || value === "system") return value;
  return "system";
}

function clampRating(value: unknown): ShiftWorkspace["rating"] | undefined {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) {
    return value;
  }

  return undefined;
}

function normalizeUpdates(value: unknown): ShiftWorkspaceUpdate[] {
  if (!Array.isArray(value)) return [];

  const output: ShiftWorkspaceUpdate[] = [];

  for (const item of value) {
    if (!isRec(item)) continue;

    const id = str(item, "id");
    const createdAt = num(item, "createdAt");
    const title = str(item, "title");

    if (!id || createdAt === undefined || !title) continue;

    const kind = clampUpdateKind(item["kind"]);
    const body = typeof item["body"] === "string" ? item["body"] : undefined;
    const base: ShiftWorkspaceUpdate = { id, createdAt, kind, title };

    output.push(body ? { ...base, body } : base);
  }

  return output;
}

function normalizeEmployerShiftWorkspace(raw: unknown): ShiftWorkspace | null {
  if (!isRec(raw)) return null;

  const id = str(raw, "id");
  const postId = str(raw, "postId");
  const companyName = str(raw, "companyName");
  const jobName = str(raw, "jobName");
  const locationName = str(raw, "locationName");
  const startAt = num(raw, "startAt");
  const endAt = num(raw, "endAt");
  const lastActivityAt = num(raw, "lastActivityAt");
  const unreadCount = num(raw, "unreadCount");

  if (!id || !postId || !companyName || !jobName || !locationName) return null;
  if (
    startAt === undefined ||
    endAt === undefined ||
    lastActivityAt === undefined ||
    unreadCount === undefined
  ) {
    return null;
  }

  const exitReasonRaw = raw["exitReason"];
  const exitReason =
    exitReasonRaw === "emergency" ||
    exitReasonRaw === "sick" ||
    exitReasonRaw === "travel" ||
    exitReasonRaw === "other"
      ? (exitReasonRaw as ShiftWorkspace["exitReason"])
      : undefined;

  const replacedReasonRaw = raw["replacedReason"];
  const replacedReason =
    replacedReasonRaw === "no_show" ||
    replacedReasonRaw === "schedule_change" ||
    replacedReasonRaw === "quality_issue" ||
    replacedReasonRaw === "other"
      ? (replacedReasonRaw as ShiftWorkspace["replacedReason"])
      : undefined;

  return {
    id,
    postId,
    appId: str(raw, "appId"),
    workerWmId: str(raw, "workerWmId"),
    workerName: str(raw, "workerName"),
    companyName,
    jobName,
    category: clampCategory(raw["category"]),
    locationName,
    locationAddress: str(raw, "locationAddress"),
    mapsLink: str(raw, "mapsLink"),
    startAt,
    endAt,
    lastActivityAt,
    unreadCount,
    status: clampStatus(raw["status"]),
    updates: normalizeUpdates(raw["updates"]),
    exitedAt: num(raw, "exitedAt"),
    exitReason,
    exitNote: typeof raw["exitNote"] === "string" ? raw["exitNote"] : undefined,
    replacedAt: num(raw, "replacedAt"),
    replacedReason,
    rating: clampRating(raw["rating"]),
    ratingComment: str(raw, "ratingComment"),
    ratedAt: num(raw, "ratedAt"),
    employerRating: num(raw, "employerRating"),
    employerRatingComment: str(raw, "employerRatingComment"),
    employerRatedAt: num(raw, "employerRatedAt"),
  };
}

function safeParseArray(raw: string | null): unknown[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeEmployerShiftWorkspaces(rawList: unknown[]): ShiftWorkspace[] {
  const output = rawList
    .map(normalizeEmployerShiftWorkspace)
    .filter((workspace): workspace is ShiftWorkspace => workspace !== null);

  output.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  return output;
}

let cacheRaw: string | null = "__init__";
let cacheList: ShiftWorkspace[] = [];

function syncCacheFromRaw(raw: string | null): ShiftWorkspace[] {
  cacheRaw = raw;
  cacheList = normalizeEmployerShiftWorkspaces(safeParseArray(raw));
  return cacheList;
}

export function invalidateEmployerShiftWorkspaceCache(): void {
  cacheRaw = "__dirty__";
}

export function readEmployerShiftWorkspaces(): ShiftWorkspace[] {
  const raw = localStorage.getItem(EMPLOYEE_WORKSPACES_KEY);

  if (raw === cacheRaw) {
    return cacheList;
  }

  return syncCacheFromRaw(raw);
}

export function writeEmployerShiftWorkspaces(
  list: ShiftWorkspace[],
): EmployerShiftWorkspaceWriteResult {
  const result = safeWrite(EMPLOYEE_WORKSPACES_KEY, list);

  if (!result.ok) {
    return result;
  }

  try {
    cacheRaw = localStorage.getItem(EMPLOYEE_WORKSPACES_KEY);
    cacheList = list.slice().sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  } catch {
    invalidateEmployerShiftWorkspaceCache();
  }

  safeDispatch(EMPLOYEE_WORKSPACES_CHANGED_EVENT);
  return { ok: true };
}

function safeDispatch(eventName: string): void {
  try {
    window.dispatchEvent(new Event(eventName));
  } catch (error) {
    console.warn("[employerShiftWorkspace.persistence] Failed to dispatch change event", {
      event: eventName,
      error,
    });
  }
}

export function subscribeEmployerShiftWorkspaces(callback: () => void): () => void {
  const handler = () => {
    invalidateEmployerShiftWorkspaceCache();
    callback();
  };

  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);
  window.addEventListener(EMPLOYEE_WORKSPACES_CHANGED_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);
    window.removeEventListener(EMPLOYEE_WORKSPACES_CHANGED_EVENT, handler);
  };
}
