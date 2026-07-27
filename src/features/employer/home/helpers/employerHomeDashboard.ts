/** Employer home dashboard snapshot — launch keys by default; phase2 gated. */

import {
  CAREER_POSTS_CHANGED,
  CAREER_APPS_CHANGED,
} from "../../careerJobs/helpers/careerStorageUtils";
import { showPhase2Features } from "../../../../shared/config/featureFlags";
import { hrManagementStorage } from "../../hrManagement/storage/hrManagement.storage";
import { attendanceLogStorage } from "../../hrManagement/storage/attendanceLog.storage";
import { taskAssignmentStorage } from "../../hrManagement/storage/taskAssignment.storage";
import { incidentReportStorage } from "../../hrManagement/storage/incidentReport.storage";
import { computeLaunchDashboard, LAUNCH_STORAGE_KEYS } from "./employerHomeDashboard.launchCompute";
import {
  computePhase2DashboardSlice,
  PHASE2_STORAGE_KEYS,
} from "./employerHomeDashboard.phase2Compute";
import type { DashboardData } from "./employerHomeDashboard.types";

export type { DashboardData } from "./employerHomeDashboard.types";

const LAUNCH_EVENTS = [
  "wm:employer-shift-posts-changed",
  "wm:employee-shift-workspaces-changed",
  "wm:employee-shift-applications-changed",
  CAREER_POSTS_CHANGED,
  CAREER_APPS_CHANGED,
  "storage",
  "focus",
] as const;

const PHASE2_EVENTS = [
  hrManagementStorage.CHANGED_EVENT,
  attendanceLogStorage.CHANGED_EVENT,
  taskAssignmentStorage.CHANGED_EVENT,
  incidentReportStorage.CHANGED_EVENT,
] as const;

let cacheKey = "";
let cacheData: DashboardData | null = null;

function fingerprintKeys(keys: readonly string[]): string {
  return keys.map((key) => localStorage.getItem(key) ?? "").join("|");
}

function computeDashboard(): DashboardData {
  const launch = computeLaunchDashboard();
  if (!showPhase2Features) return launch;
  return { ...launch, ...computePhase2DashboardSlice() };
}

export function getDashboardSnapshot(): DashboardData {
  const keys = showPhase2Features
    ? [...LAUNCH_STORAGE_KEYS, ...PHASE2_STORAGE_KEYS]
    : [...LAUNCH_STORAGE_KEYS];
  const newKey = `${showPhase2Features ? "p2" : "p0"}|${fingerprintKeys(keys)}`;

  if (newKey === cacheKey && cacheData) return cacheData;

  cacheKey = newKey;
  cacheData = computeDashboard();
  return cacheData;
}

export function subscribeDashboard(cb: () => void): () => void {
  let rafId = 0;
  const handler = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      cb();
    });
  };

  const events = showPhase2Features ? [...LAUNCH_EVENTS, ...PHASE2_EVENTS] : [...LAUNCH_EVENTS];

  for (const eventName of events) {
    window.addEventListener(eventName, handler);
  }
  document.addEventListener("visibilitychange", handler);

  return () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    for (const eventName of events) {
      window.removeEventListener(eventName, handler);
    }
    document.removeEventListener("visibilitychange", handler);
  };
}
