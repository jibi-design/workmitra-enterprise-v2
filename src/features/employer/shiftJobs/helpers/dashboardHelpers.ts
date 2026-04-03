// src/features/employer/shiftJobs/helpers/dashboardHelpers.ts
import { employerShiftStorage, type EmployeeShiftApplication, type EmployerShiftActivityEntry, type ShiftPost } from "../storage/employerShift.storage";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type Tab = "applied" | "shortlist" | "waiting" | "confirmed" | "rejected";
export type AnswerState = "meets" | "not_sure" | "dont_meet";
export type WorkspaceStatus = "active" | "upcoming" | "completed" | "left" | "replaced";

export type WorkspaceLite = {
  id: string;
  postId: string;
  status: WorkspaceStatus;
  lastActivityAt: number;
  startAt: number;
};

/* ------------------------------------------------ */
/* Parsing helpers                                  */
/* ------------------------------------------------ */
type Rec = Record<string, unknown>;

export function isRec(x: unknown): x is Rec { return typeof x === "object" && x !== null; }
export function str(r: Rec, k: string): string | undefined { const v = r[k]; return typeof v === "string" ? v : undefined; }
export function num(r: Rec, k: string): number | undefined { const v = r[k]; return typeof v === "number" && Number.isFinite(v) ? v : undefined; }

function clampAnswer(x: unknown): AnswerState | null { if (x === "meets" || x === "not_sure" || x === "dont_meet") return x; return null; }

export function readAnswerMap(x: unknown): Record<string, AnswerState> {
  if (!isRec(x)) return {};
  const out: Record<string, AnswerState> = {};
  for (const [k, v] of Object.entries(x)) { const sv = clampAnswer(v); if (sv) out[k] = sv; }
  return out;
}

export function readNotesMap(x: unknown): Record<string, string> {
  if (!isRec(x)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(x)) { if (typeof v === "string") out[k] = v; }
  return out;
}

export function safeParseArray(raw: string | null): unknown[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw) as unknown; return Array.isArray(p) ? p : []; } catch { return []; }
}

/* ------------------------------------------------ */
/* Workspace helpers                                */
/* ------------------------------------------------ */
const WORKSPACES_KEY = "wm_employee_shift_workspaces_v1";

function clampWsStatus(x: unknown): WorkspaceStatus {
  if (x === "active" || x === "upcoming" || x === "completed" || x === "left" || x === "replaced") return x;
  return "active";
}

export function normalizeWorkspacesLite(rawList: unknown[]): WorkspaceLite[] {
  const out: WorkspaceLite[] = [];
  for (const item of rawList) {
    if (!isRec(item)) continue;
    const id = str(item, "id"); const postId = str(item, "postId");
    const lastActivityAt = num(item, "lastActivityAt"); const startAt = num(item, "startAt");
    if (!id || !postId || lastActivityAt === undefined || startAt === undefined) continue;
    out.push({ id, postId, status: clampWsStatus(item["status"]), lastActivityAt, startAt });
  }
  out.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  return out;
}

export function findWorkspaceIdForPost(postId: string): string | null {
  for (const item of safeParseArray(localStorage.getItem(WORKSPACES_KEY))) {
    if (!isRec(item)) continue;
    if (str(item, "postId") === postId) return str(item, "id") ?? null;
  }
  return null;
}

export function workspaceNeedsAttention(ws: WorkspaceLite): { needs: boolean; hint: string | null } {
  if (ws.status === "left") return { needs: true, hint: "Worker exited" };
  if (ws.status === "replaced") return { needs: true, hint: "Replaced" };
  return { needs: false, hint: null };
}

/* ------------------------------------------------ */
/* Activity helpers                                 */
/* ------------------------------------------------ */
const ACTIVITY_KEY = "wm_employer_shift_activity_log_v1";

export function normalizeActivity(rawList: unknown[]): EmployerShiftActivityEntry[] {
  const out: EmployerShiftActivityEntry[] = [];
  const validKinds = ["post_created","analysis_run","analysis_reset","hidden","unhidden","move_shortlist","move_waiting","candidate_rejected","confirmed","replaced"];
  for (const item of rawList) {
    if (!isRec(item)) continue;
    const id = str(item, "id"); const postId = str(item, "postId"); const kind = str(item, "kind");
    const createdAt = num(item, "createdAt"); const title = str(item, "title");
    if (!id || !postId || !kind || createdAt === undefined || !title || !validKinds.includes(kind)) continue;
    out.push({ id, postId, kind: kind as EmployerShiftActivityEntry["kind"], createdAt, title, body: typeof item["body"] === "string" ? item["body"] as string : undefined, route: typeof item["route"] === "string" ? item["route"] as string : undefined });
  }
  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}

/* ------------------------------------------------ */
/* Employee apps parser                             */
/* ------------------------------------------------ */
const EMPLOYEE_APPS_KEY = "wm_employee_shift_applications_v1";

export function safeParseEmployeeApps(raw: string | null): EmployeeShiftApplication[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: EmployeeShiftApplication[] = [];
    for (const item of parsed) {
      if (!isRec(item)) continue;
      const id = str(item, "id"); const postId = str(item, "postId");
      const createdAt = num(item, "createdAt"); const status = str(item, "status");
      if (!id || !postId || createdAt === undefined || !status) continue;
      const valid = ["applied","shortlisted","waiting","confirmed","rejected","withdrawn","replaced","exited"];
      if (!valid.includes(status)) continue;
      const snap = isRec(item["profileSnapshot"]) ? {
          uniqueId: str(item["profileSnapshot"], "uniqueId") || undefined,
          fullName: str(item["profileSnapshot"], "fullName") || undefined,
          city: str(item["profileSnapshot"], "city") || undefined,
          experience: str(item["profileSnapshot"], "experience") || undefined,
          skills: Array.isArray(item["profileSnapshot"]["skills"]) ? (item["profileSnapshot"]["skills"] as string[]).filter((x) => typeof x === "string") : undefined,
          languages: Array.isArray(item["profileSnapshot"]["languages"]) ? (item["profileSnapshot"]["languages"] as string[]).filter((x) => typeof x === "string") : undefined,
        } : undefined;
        out.push({ id, postId, createdAt, status: status as EmployeeShiftApplication["status"], profileSnapshot: snap, mustHaveAnswers: readAnswerMap(item["mustHaveAnswers"]), goodToHaveAnswers: readAnswerMap(item["goodToHaveAnswers"]), notes: readNotesMap(item["notes"]), withdrawnAt: num(item, "withdrawnAt"), replacedAt: num(item, "replacedAt"), replacedReason: (["no_show","schedule_change","quality_issue","other"].includes(item["replacedReason"] as string) ? item["replacedReason"] : undefined) as EmployeeShiftApplication["replacedReason"] });
    }
    out.sort((a, b) => b.createdAt - a.createdAt); return out;
  } catch { return []; }
}

/* ------------------------------------------------ */
/* Cached snapshots for useSyncExternalStore        */
/* ------------------------------------------------ */
const EMP_POSTS_KEY = "wm_employer_shift_posts_v1";
const WORKSPACES_CHANGED = "wm:employee-shift-workspaces-changed";

let pCacheRaw: string | null = null; let pCacheList: ShiftPost[] = [];
export function getPostsSnapshot(): ShiftPost[] {
  const raw = localStorage.getItem(EMP_POSTS_KEY);
  if (raw === pCacheRaw) return pCacheList;
  pCacheRaw = raw; pCacheList = employerShiftStorage.getPosts(); return pCacheList;
}

let aCacheRaw: string | null = null; let aCacheList: EmployeeShiftApplication[] = [];
export function getAppsSnapshot(): EmployeeShiftApplication[] {
  const raw = localStorage.getItem(EMPLOYEE_APPS_KEY);
  if (raw === aCacheRaw) return aCacheList;
  aCacheRaw = raw; aCacheList = safeParseEmployeeApps(raw); return aCacheList;
}

let actCacheRaw: string | null = null; let actCacheList: EmployerShiftActivityEntry[] = [];
export function getActivitySnapshot(): EmployerShiftActivityEntry[] {
  const raw = localStorage.getItem(ACTIVITY_KEY);
  if (raw === actCacheRaw) return actCacheList;
  actCacheRaw = raw; actCacheList = normalizeActivity(safeParseArray(raw)); return actCacheList;
}

let wsCacheRaw: string | null = null; let wsCacheList: WorkspaceLite[] = [];
export function getWorkspacesSnapshot(): WorkspaceLite[] {
  const raw = localStorage.getItem(WORKSPACES_KEY);
  if (raw === wsCacheRaw) return wsCacheList;
  wsCacheRaw = raw; wsCacheList = normalizeWorkspacesLite(safeParseArray(raw)); return wsCacheList;
}

export function subscribeDashboard(cb: () => void): () => void {
  const h = () => cb();
  const evs = ["storage","focus",
    employerShiftStorage._events?.employerShiftPostsChanged ?? "wm:employer-shift-posts-changed",
    employerShiftStorage._events?.employeeAppsChanged ?? "wm:employee-shift-applications-changed",
    employerShiftStorage._events?.employerShiftActivityChanged ?? "wm:employer-shift-activity-changed",
    WORKSPACES_CHANGED];
  for (const ev of evs) window.addEventListener(ev, h);
  document.addEventListener("visibilitychange", h);
  return () => { for (const ev of evs) window.removeEventListener(ev, h); document.removeEventListener("visibilitychange", h); };
}

/* ------------------------------------------------ */
/* Next step logic                                  */
/* ------------------------------------------------ */
export function nextStepText(remaining: number, waitingGap: number, wsId: string | null): { title: string; hint: string } {
  if (remaining > 0) return { title: `Next: Confirm ${remaining} worker(s)`, hint: "Open Selected list and confirm." };
  if (!wsId) return { title: "Next: Confirm 1 worker to create group", hint: "Group appears after first confirm." };
  if (waitingGap > 0) return { title: `Next: Add ${waitingGap} backup candidate(s)`, hint: "Backup list keeps your shift safe." };
  return { title: "Next: Open group", hint: "Use group for updates and replies." };
}

/* ------------------------------------------------ */
/* Format helpers                                   */
/* ------------------------------------------------ */
export function fmtTime(ts: number): string {
  try { return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}
