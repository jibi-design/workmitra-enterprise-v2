// src/features/employer/shiftJobs/storage/shiftWorkspaceStorage.ts
//
// localStorage storage + stable-reference cache for EmployerShiftWorkspacePage.

import type {
  ShiftWorkspace, ShiftWorkspaceCategory, ShiftWorkspaceStatus, ShiftWorkspaceUpdate,
} from "../types/shiftWorkspaceTypes";

/* ------------------------------------------------ */
/* Keys & Events                                    */
/* ------------------------------------------------ */
export const WORKSPACES_KEY = "wm_employee_shift_workspaces_v1";
export const WORKSPACES_CHANGED = "wm:employee-shift-workspaces-changed";

const EMPLOYEE_NOTES_KEY = "wm_employee_notifications_v1";
const EMPLOYEE_NOTES_CHANGED = "wm:employee-notifications-changed";

/* ------------------------------------------------ */
/* Parse helpers                                    */
/* ------------------------------------------------ */
type Rec = Record<string, unknown>;
function isRec(x: unknown): x is Rec { return typeof x === "object" && x !== null; }
function str(r: Rec, k: string): string | undefined { const v = r[k]; return typeof v === "string" ? v : undefined; }
function num(r: Rec, k: string): number | undefined { const v = r[k]; return typeof v === "number" && Number.isFinite(v) ? v : undefined; }

function clampCategory(x: unknown): ShiftWorkspaceCategory {
  if (x === "construction" || x === "kitchen" || x === "office" || x === "delivery") return x;
  return "other";
}

function clampStatus(x: unknown): ShiftWorkspaceStatus {
  if (x === "active" || x === "upcoming" || x === "completed" || x === "left" || x === "replaced") return x;
  return "active";
}

function clampUpdateKind(x: unknown): ShiftWorkspaceUpdate["kind"] {
  if (x === "broadcast" || x === "direct" || x === "system") return x;
  return "system";
}

function normalizeUpdates(x: unknown): ShiftWorkspaceUpdate[] {
  if (!Array.isArray(x)) return [];
  const out: ShiftWorkspaceUpdate[] = [];
  for (const u of x) {
    if (!isRec(u)) continue;
    const uid = str(u, "id");
    const createdAt = num(u, "createdAt");
    const title = str(u, "title");
    if (!uid || createdAt === undefined || !title) continue;
    const kind = clampUpdateKind(u["kind"]);
    const body = typeof u["body"] === "string" ? u["body"] : undefined;
    const base: ShiftWorkspaceUpdate = { id: uid, createdAt, kind, title };
    out.push(body ? { ...base, body } : base);
  }
  return out;
}

function normalizeWorkspaces(rawList: unknown[]): ShiftWorkspace[] {
  const out: ShiftWorkspace[] = [];
  for (const item of rawList) {
    if (!isRec(item)) continue;
    const id = str(item, "id");
    const postId = str(item, "postId");
    const companyName = str(item, "companyName");
    const jobName = str(item, "jobName");
    const locationName = str(item, "locationName");
    const startAt = num(item, "startAt");
    const endAt = num(item, "endAt");
    const lastActivityAt = num(item, "lastActivityAt");
    const unreadCount = num(item, "unreadCount");
    if (!id || !postId || !companyName || !jobName || !locationName) continue;
    if (startAt === undefined || endAt === undefined || lastActivityAt === undefined || unreadCount === undefined) continue;
    const exitReasonRaw = item["exitReason"];
    const exitReason =
      exitReasonRaw === "emergency" || exitReasonRaw === "sick" ||
      exitReasonRaw === "travel" || exitReasonRaw === "other"
        ? (exitReasonRaw as ShiftWorkspace["exitReason"]) : undefined;
    const replacedReasonRaw = item["replacedReason"];
    const replacedReason =
      replacedReasonRaw === "no_show" || replacedReasonRaw === "schedule_change" ||
      replacedReasonRaw === "quality_issue" || replacedReasonRaw === "other"
        ? (replacedReasonRaw as ShiftWorkspace["replacedReason"]) : undefined;
    out.push({
      id, postId, companyName, jobName, locationName,
      category: clampCategory(item["category"]),
      startAt, endAt, lastActivityAt, unreadCount,
      status: clampStatus(item["status"]),
      updates: normalizeUpdates(item["updates"]),
      exitedAt: num(item, "exitedAt"),
      exitReason,
      exitNote: typeof item["exitNote"] === "string" ? item["exitNote"] : undefined,
      replacedAt: num(item, "replacedAt"),
      replacedReason,
    });
  }
  out.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  return out;
}

function safeParseArray(raw: string | null): unknown[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw) as unknown; return Array.isArray(p) ? p : []; }
  catch { return []; }
}

/* ------------------------------------------------ */
/* Stable-reference cache                           */
/* ------------------------------------------------ */
let _cacheRaw: string | null = null;
let _cacheList: ShiftWorkspace[] = [];

export function getWorkspacesSnapshot(): ShiftWorkspace[] {
  const raw = localStorage.getItem(WORKSPACES_KEY);
  if (raw === _cacheRaw) return _cacheList;
  _cacheRaw = raw;
  _cacheList = normalizeWorkspaces(safeParseArray(raw));
  return _cacheList;
}

export function subscribeWorkspaces(cb: () => void): () => void {
  const h = () => cb();
  window.addEventListener("storage", h);
  window.addEventListener("focus", h);
  document.addEventListener("visibilitychange", h);
  window.addEventListener(WORKSPACES_CHANGED, h);
  return () => {
    window.removeEventListener("storage", h);
    window.removeEventListener("focus", h);
    document.removeEventListener("visibilitychange", h);
    window.removeEventListener(WORKSPACES_CHANGED, h);
  };
}

/* ------------------------------------------------ */
/* Write helpers                                    */
/* ------------------------------------------------ */
function safeDispatch(event: string) {
  try { window.dispatchEvent(new Event(event)); } catch { /* safe */ }
}

export function saveWorkspaces(list: ShiftWorkspace[]) {
  try { localStorage.setItem(WORKSPACES_KEY, JSON.stringify(list)); } catch { /* safe */ }
  _cacheRaw = null;
  safeDispatch(WORKSPACES_CHANGED);
}

/* ------------------------------------------------ */
/* Employee notification push                       */
/* ------------------------------------------------ */
type EmployeeNote = {
  id: string; domain: "shift"; title: string;
  body?: string; createdAt: number; isRead: boolean; route?: string;
};

function noteId(): string {
  return `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function pushEmployeeShiftNotification(title: string, body: string, route?: string) {
  const note: EmployeeNote = {
    id: noteId(), domain: "shift", title, body,
    createdAt: Date.now(), isRead: false, route,
  };
  const existing = safeParseArray(localStorage.getItem(EMPLOYEE_NOTES_KEY));
  const next = [note, ...(existing as EmployeeNote[])].slice(0, 120);
  try { localStorage.setItem(EMPLOYEE_NOTES_KEY, JSON.stringify(next)); } catch { /* safe */ }
  safeDispatch(EMPLOYEE_NOTES_CHANGED);
}