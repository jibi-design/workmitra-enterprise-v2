import {
  employerShiftStorage,
  type EmployeeShiftApplication,
  type EmployerShiftActivityEntry,
  type ShiftPost,
} from "../../shiftJobs/storage/employerShift.storage";
import { ACTIVITY_KEY, normalizeActivity } from "./dashboardHelpers.activity";
import { EMPLOYEE_APPS_KEY, safeParseEmployeeApps } from "./dashboardHelpers.apps";
import { safeParseArray } from "./dashboardHelpers.parsing";
import type { WorkspaceLite } from "./dashboardHelpers.types";
import { WORKSPACES_KEY, normalizeWorkspacesLite } from "./dashboardHelpers.workspace";

const EMP_POSTS_KEY = "wm_employer_shift_posts_v1";
const WORKSPACES_CHANGED = "wm:employee-shift-workspaces-changed";

let pCacheRaw: string | null = null;
let pCacheList: ShiftPost[] = [];
export function getPostsSnapshot(): ShiftPost[] {
  const raw = localStorage.getItem(EMP_POSTS_KEY);
  if (raw === pCacheRaw) return pCacheList;
  pCacheRaw = raw;
  pCacheList = employerShiftStorage.getPosts();
  return pCacheList;
}

let aCacheRaw: string | null = null;
let aCacheList: EmployeeShiftApplication[] = [];
export function getAppsSnapshot(): EmployeeShiftApplication[] {
  const raw = localStorage.getItem(EMPLOYEE_APPS_KEY);
  if (raw === aCacheRaw) return aCacheList;
  aCacheRaw = raw;
  aCacheList = safeParseEmployeeApps(raw);
  return aCacheList;
}

let actCacheRaw: string | null = null;
let actCacheList: EmployerShiftActivityEntry[] = [];
export function getActivitySnapshot(): EmployerShiftActivityEntry[] {
  const raw = localStorage.getItem(ACTIVITY_KEY);
  if (raw === actCacheRaw) return actCacheList;
  actCacheRaw = raw;
  actCacheList = normalizeActivity(safeParseArray(raw));
  return actCacheList;
}

let wsCacheRaw: string | null = null;
let wsCacheList: WorkspaceLite[] = [];
export function getWorkspacesSnapshot(): WorkspaceLite[] {
  const raw = localStorage.getItem(WORKSPACES_KEY);
  if (raw === wsCacheRaw) return wsCacheList;
  wsCacheRaw = raw;
  wsCacheList = normalizeWorkspacesLite(safeParseArray(raw));
  return wsCacheList;
}

export function subscribeDashboard(cb: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const DEBOUNCE_MS = 100;

  const flush = () => {
    timer = null;
    cb();
  };

  const h = (ev?: Event) => {
    const type = ev?.type ?? "";
    const debounce = type === "storage" || type === "focus" || type === "visibilitychange";

    if (!debounce) {
      cb();
      return;
    }

    if (timer != null) clearTimeout(timer);
    timer = setTimeout(flush, DEBOUNCE_MS);
  };

  const evs = [
    "storage",
    "focus",
    employerShiftStorage._events?.employerShiftPostsChanged ?? "wm:employer-shift-posts-changed",
    employerShiftStorage._events?.employeeAppsChanged ?? "wm:employee-shift-applications-changed",
    employerShiftStorage._events?.employerShiftActivityChanged ??
      "wm:employer-shift-activity-changed",
    WORKSPACES_CHANGED,
  ];
  for (const ev of evs) window.addEventListener(ev, h);
  document.addEventListener("visibilitychange", h);
  return () => {
    if (timer != null) clearTimeout(timer);
    for (const ev of evs) window.removeEventListener(ev, h);
    document.removeEventListener("visibilitychange", h);
  };
}

export function nextStepText(
  remaining: number,
  waitingGap: number,
  wsId: string | null,
): { title: string; hint: string } {
  if (remaining > 0)
    return {
      title: `Next: Confirm ${remaining} worker(s)`,
      hint: "Open Selected list and confirm.",
    };
  if (!wsId)
    return {
      title: "Next: Confirm 1 worker to create group",
      hint: "Group appears after first confirm.",
    };
  if (waitingGap > 0)
    return {
      title: `Next: Add ${waitingGap} backup candidate(s)`,
      hint: "Backup list keeps your shift safe.",
    };
  return { title: "Next: Open group", hint: "Use group for updates and replies." };
}

export function fmtTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
