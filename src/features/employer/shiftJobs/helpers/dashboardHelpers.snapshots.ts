import {
  employerShiftStorage,
  type EmployeeShiftApplication,
  type EmployerShiftActivityEntry,
  type ShiftPost,
} from "../../shiftJobs/storage/employerShift.storage";
import { activityKey, normalizeActivity } from "./dashboardHelpers.activity";
import { safeParseEmployeeApps } from "./dashboardHelpers.apps";
import { safeParseArray } from "./dashboardHelpers.parsing";
import type { WorkspaceLite } from "./dashboardHelpers.types";
import { normalizeWorkspacesLite } from "./dashboardHelpers.workspace";
import {
  getEmpPostsKey,
  getEmployerApplicationsKey,
  getEmployerWorkspacesKey,
} from "../storage/employerShift.keys";
import { SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT } from "../../../shared/shift/shiftEmployerScope";

const WORKSPACES_CHANGED = "wm:employee-shift-workspaces-changed";

let pCacheRaw: string | null = null;
let pCacheKey = "";
let pCacheList: ShiftPost[] = [];
export function getPostsSnapshot(): ShiftPost[] {
  const key = getEmpPostsKey();
  const raw = localStorage.getItem(key);
  if (raw === pCacheRaw && key === pCacheKey) return pCacheList;
  pCacheRaw = raw;
  pCacheKey = key;
  pCacheList = employerShiftStorage.getPosts();
  return pCacheList;
}

let aCacheRaw: string | null = null;
let aCacheKey = "";
let aCacheList: EmployeeShiftApplication[] = [];
export function getAppsSnapshot(): EmployeeShiftApplication[] {
  const key = getEmployerApplicationsKey();
  const raw = localStorage.getItem(key);
  if (raw === aCacheRaw && key === aCacheKey) return aCacheList;
  aCacheRaw = raw;
  aCacheKey = key;
  aCacheList = safeParseEmployeeApps(raw);
  return aCacheList;
}

let actCacheRaw: string | null = null;
let actCacheKey = "";
let actCacheList: EmployerShiftActivityEntry[] = [];
export function getActivitySnapshot(): EmployerShiftActivityEntry[] {
  const key = activityKey();
  const raw = localStorage.getItem(key);
  if (raw === actCacheRaw && key === actCacheKey) return actCacheList;
  actCacheRaw = raw;
  actCacheKey = key;
  actCacheList = normalizeActivity(safeParseArray(raw));
  return actCacheList;
}

let wsCacheRaw: string | null = null;
let wsCacheKey = "";
let wsCacheList: WorkspaceLite[] = [];
export function getWorkspacesSnapshot(): WorkspaceLite[] {
  const key = getEmployerWorkspacesKey();
  const raw = localStorage.getItem(key);
  if (raw === wsCacheRaw && key === wsCacheKey) return wsCacheList;
  wsCacheRaw = raw;
  wsCacheKey = key;
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
    SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT,
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
