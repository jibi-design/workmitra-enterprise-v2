// src/features/employee/shiftJobs/storage/shiftApplications.storage.ts
//
// Storage layer for employee shift applications + shift posts.
// Safe parsing, snapshot caching, localStorage subscription.

import type {
  ExperienceLabel,
  ShiftApplicationStatus,
  ShiftPostData,
  ShiftApplicationData,
  AnswerState,
} from "../types/shiftApplicationTypes";

/* ------------------------------------------------ */
/* Keys                                             */
/* ------------------------------------------------ */
const POSTS_KEY = "wm_employee_shift_posts_demo_v1";
const APPS_KEY = "wm_employee_shift_applications_v1";
const APPS_CHANGED = "wm:employee-shift-applications-changed";

/* ------------------------------------------------ */
/* Generic safe-parse helpers                       */
/* ------------------------------------------------ */
type Rec = Record<string, unknown>;
function isRec(x: unknown): x is Rec { return typeof x === "object" && x !== null; }
function str(r: Rec, k: string): string | undefined { const v = r[k]; return typeof v === "string" ? v : undefined; }
function num(r: Rec, k: string): number | undefined { const v = r[k]; return typeof v === "number" && Number.isFinite(v) ? v : undefined; }

function safeArr(raw: string | null): unknown[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw) as unknown; return Array.isArray(p) ? p : []; } catch { return []; }
}

/* ------------------------------------------------ */
/* Post parser                                      */
/* ------------------------------------------------ */
const VALID_EXP: ExperienceLabel[] = ["helper", "fresher_ok", "experienced"];

function parsePosts(raw: string | null): ShiftPostData[] {
  const out: ShiftPostData[] = [];
  for (const x of safeArr(raw)) {
    if (!isRec(x)) continue;
    const id = str(x, "id"), companyName = str(x, "companyName"), jobName = str(x, "jobName");
    const exp = VALID_EXP.includes(x["experience"] as ExperienceLabel) ? (x["experience"] as ExperienceLabel) : null;
    const payPerDay = num(x, "payPerDay"), locationName = str(x, "locationName");
    const startAt = num(x, "startAt"), endAt = num(x, "endAt");
    if (!id || !companyName || !jobName || !exp || payPerDay === undefined || !locationName || startAt === undefined || endAt === undefined) continue;
const shiftType = str(x, "shiftType") ?? str(x, "jobType") ?? str(x, "category");
    out.push({ id, companyName, jobName, experience: exp, payPerDay, locationName, startAt, endAt, isHiddenFromSearch: !!x["isHiddenFromSearch"], shiftType });
  }
  return out;
}

/* ------------------------------------------------ */
/* Application parser                               */
/* ------------------------------------------------ */
const VALID_STATUS: ShiftApplicationStatus[] = ["applied", "shortlisted", "waiting", "confirmed", "rejected", "withdrawn", "replaced", "exited"];
const VALID_REASON = ["no_show", "schedule_change", "quality_issue", "other"] as const;

function parseApps(raw: string | null): ShiftApplicationData[] {
  const out: ShiftApplicationData[] = [];
  for (const x of safeArr(raw)) {
    if (!isRec(x)) continue;
    const id = str(x, "id"), postId = str(x, "postId"), createdAt = num(x, "createdAt");
    const status = VALID_STATUS.includes(x["status"] as ShiftApplicationStatus) ? (x["status"] as ShiftApplicationStatus) : null;
    if (!id || !postId || createdAt === undefined || !status) continue;
    const mustHaveAnswers = isRec(x["mustHaveAnswers"]) ? (x["mustHaveAnswers"] as Record<string, AnswerState>) : {};
    const goodToHaveAnswers = isRec(x["goodToHaveAnswers"]) ? (x["goodToHaveAnswers"] as Record<string, AnswerState>) : {};
    const notes = isRec(x["notes"]) ? (x["notes"] as Record<string, string>) : {};
    const rr = x["replacedReason"];
    out.push({
      id, postId, createdAt, status, mustHaveAnswers, goodToHaveAnswers, notes,
      withdrawnAt: num(x, "withdrawnAt"), replacedAt: num(x, "replacedAt"),
      replacedReason: VALID_REASON.includes(rr as typeof VALID_REASON[number]) ? (rr as ShiftApplicationData["replacedReason"]) : undefined,
    });
  }
  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}

/* ------------------------------------------------ */
/* Cached snapshots                                 */
/* ------------------------------------------------ */
let pRaw: string | null = "__init__";
let pList: ShiftPostData[] = [];
let aRaw: string | null = "__init__";
let aList: ShiftApplicationData[] = [];

function getPosts(): ShiftPostData[] {
  const r = localStorage.getItem(POSTS_KEY);
  if (r !== pRaw) { pRaw = r; pList = parsePosts(r); }
  return pList;
}

function getApps(): ShiftApplicationData[] {
  const r = localStorage.getItem(APPS_KEY);
  if (r !== aRaw) { aRaw = r; aList = parseApps(r); }
  return aList;
}

function subscribe(cb: () => void): () => void {
  const h = () => cb();
  window.addEventListener("storage", h);
  window.addEventListener("focus", h);
  document.addEventListener("visibilitychange", h);
  window.addEventListener(APPS_CHANGED, h);
  return () => {
    window.removeEventListener("storage", h);
    window.removeEventListener("focus", h);
    document.removeEventListener("visibilitychange", h);
    window.removeEventListener(APPS_CHANGED, h);
  };
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const shiftApplicationsStorage = {
  getPosts,
  getApps,
  subscribe,
} as const;