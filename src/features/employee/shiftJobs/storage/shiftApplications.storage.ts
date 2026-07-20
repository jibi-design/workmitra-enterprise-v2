// App name: Job Mitra
// File name: shiftApplications.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftApplications.storage.ts

import type {
  AnswerState,
  ExperienceLabel,
  ShiftApplicationData,
  ShiftApplicationStatus,
  ShiftPostData,
} from "../../shiftJobs/types/shiftApplicationTypes";

/* ------------------------------------------------ */
/* Keys                                             */
/* ------------------------------------------------ */
const POSTS_KEY = "wm_employer_shift_posts_v1";
const APPS_KEY = "wm_employee_shift_applications_v1";
const APPS_CHANGED = "wm:employee-shift-applications-changed";

/* ------------------------------------------------ */
/* Generic safe-parse helpers                       */
/* ------------------------------------------------ */
type Rec = Record<string, unknown>;

function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null;
}

function str(r: Rec, k: string): string | undefined {
  const value = r[k];
  return typeof value === "string" ? value : undefined;
}

function num(r: Rec, k: string): number | undefined {
  const value = r[k];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function safeArr(raw: string | null): unknown[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------ */
/* Post parser                                      */
/* ------------------------------------------------ */
const VALID_EXP: readonly ExperienceLabel[] = ["helper", "fresher_ok", "experienced"];

function parsePosts(raw: string | null): ShiftPostData[] {
  const out: ShiftPostData[] = [];

  for (const item of safeArr(raw)) {
    if (!isRec(item)) continue;

    const id = str(item, "id");
    const companyName = str(item, "companyName");
    const jobName = str(item, "jobName");
    const experience = VALID_EXP.includes(item.experience as ExperienceLabel)
      ? (item.experience as ExperienceLabel)
      : null;
    const payPerDay = num(item, "payPerDay");
    const locationName = str(item, "locationName");
    const locationAddress = str(item, "locationAddress");
    const mapsLink = str(item, "mapsLink");
    const startAt = num(item, "startAt");
    const endAt = num(item, "endAt");

    if (
      !id ||
      !companyName ||
      !jobName ||
      !experience ||
      payPerDay === undefined ||
      !locationName ||
      startAt === undefined ||
      endAt === undefined
    ) {
      continue;
    }

    const shiftType = str(item, "shiftType") ?? str(item, "jobType") ?? str(item, "category");

    out.push({
      id,
      companyName,
      jobName,
      experience,
      payPerDay,
      locationName,
      locationAddress,
      mapsLink,
      startAt,
      endAt,
      isHiddenFromSearch: Boolean(item.isHiddenFromSearch),
      shiftType,
    });
  }

  return out;
}

/* ------------------------------------------------ */
/* Application parser                               */
/* ------------------------------------------------ */
const VALID_STATUS: readonly ShiftApplicationStatus[] = [
  "applied",
  "shortlisted",
  "waiting",
  "confirmed",
  "rejected",
  "withdrawn",
  "replaced",
  "exited",
];

const VALID_REASON = ["no_show", "schedule_change", "quality_issue", "other"] as const;

function parseApps(raw: string | null): ShiftApplicationData[] {
  const out: ShiftApplicationData[] = [];

  for (const item of safeArr(raw)) {
    if (!isRec(item)) continue;

    const id = str(item, "id");
    const postId = str(item, "postId");
    const createdAt = num(item, "createdAt");
    const status = VALID_STATUS.includes(item.status as ShiftApplicationStatus)
      ? (item.status as ShiftApplicationStatus)
      : null;

    if (!id || !postId || createdAt === undefined || !status) {
      continue;
    }

    const mustHaveAnswers = isRec(item.mustHaveAnswers)
      ? (item.mustHaveAnswers as Record<string, AnswerState>)
      : {};
    const goodToHaveAnswers = isRec(item.goodToHaveAnswers)
      ? (item.goodToHaveAnswers as Record<string, AnswerState>)
      : {};
    const notes = isRec(item.notes) ? (item.notes as Record<string, string>) : {};
    const replacedReason = item.replacedReason;

    out.push({
      id,
      postId,
      createdAt,
      status,
      mustHaveAnswers,
      goodToHaveAnswers,
      notes,
      withdrawnAt: num(item, "withdrawnAt"),
      attendanceConfirmedAt: num(item, "attendanceConfirmedAt"),
      replacedAt: num(item, "replacedAt"),
      replacedReason: VALID_REASON.includes(replacedReason as (typeof VALID_REASON)[number])
        ? (replacedReason as ShiftApplicationData["replacedReason"])
        : undefined,
      planId: str(item, "planId"),
      planApplyBatchId: str(item, "planApplyBatchId"),
      selectedDates: Array.isArray(item.selectedDates)
        ? item.selectedDates.filter((d): d is string => typeof d === "string")
        : undefined,
    });
  }

  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}

/* ------------------------------------------------ */
/* Withdraw action                                  */
/* ------------------------------------------------ */
export type WithdrawShiftApplicationResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "not_found" | "not_withdrawable" | "storage_error";
    };

function isWithdrawableStatus(status: unknown): status is "applied" | "shortlisted" | "waiting" {
  return status === "applied" || status === "shortlisted" || status === "waiting";
}

function withdrawApplication(applicationId: string): WithdrawShiftApplicationResult {
  const rawItems = safeArr(localStorage.getItem(APPS_KEY));

  let found = false;
  let changed = false;
  const withdrawnAt = Date.now();

  const nextItems = rawItems.map((item) => {
    if (!isRec(item)) {
      return item;
    }

    if (str(item, "id") !== applicationId) {
      return item;
    }

    found = true;

    if (!isWithdrawableStatus(item.status)) {
      return item;
    }

    changed = true;

    return {
      ...item,
      status: "withdrawn",
      withdrawnAt,
    };
  });

  if (!found) {
    return { ok: false, reason: "not_found" };
  }

  if (!changed) {
    return { ok: false, reason: "not_withdrawable" };
  }

  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event(APPS_CHANGED));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

export type ConfirmShiftAttendanceResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "not_found" | "not_confirmed" | "already_confirmed" | "storage_error";
    };

function confirmAttendance(applicationId: string): ConfirmShiftAttendanceResult {
  const rawItems = safeArr(localStorage.getItem(APPS_KEY));

  let found = false;
  let changed = false;
  let alreadyConfirmed = false;
  const attendanceConfirmedAt = Date.now();

  const nextItems = rawItems.map((item) => {
    if (!isRec(item)) {
      return item;
    }

    if (str(item, "id") !== applicationId) {
      return item;
    }

    found = true;

    if (item.status !== "confirmed") {
      return item;
    }

    if (num(item, "attendanceConfirmedAt") !== undefined) {
      alreadyConfirmed = true;
      return item;
    }

    changed = true;

    return {
      ...item,
      attendanceConfirmedAt,
    };
  });

  if (!found) {
    return { ok: false, reason: "not_found" };
  }

  if (alreadyConfirmed && !changed) {
    return { ok: false, reason: "already_confirmed" };
  }

  if (!changed) {
    return { ok: false, reason: "not_confirmed" };
  }

  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event(APPS_CHANGED));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

/* ------------------------------------------------ */
/* Cached snapshots                                 */
/* ------------------------------------------------ */
let pRaw: string | null = "__init__";
let pList: ShiftPostData[] = [];
let aRaw: string | null = "__init__";
let aList: ShiftApplicationData[] = [];

function getPosts(): ShiftPostData[] {
  const raw = localStorage.getItem(POSTS_KEY);

  if (raw !== pRaw) {
    pRaw = raw;
    pList = parsePosts(raw);
  }

  return pList;
}

function getApps(): ShiftApplicationData[] {
  const raw = localStorage.getItem(APPS_KEY);

  if (raw !== aRaw) {
    aRaw = raw;
    aList = parseApps(raw);
  }

  return aList;
}

function subscribe(cb: () => void): () => void {
  const handler = () => cb();

  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);
  window.addEventListener(APPS_CHANGED, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);
    window.removeEventListener(APPS_CHANGED, handler);
  };
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const shiftApplicationsStorage = {
  getPosts,
  getApps,
  subscribe,
  withdrawApplication,
  confirmAttendance,
} as const;
