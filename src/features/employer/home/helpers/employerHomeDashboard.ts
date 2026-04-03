// src/features/employer/home/helpers/employerHomeDashboard.ts

import {
  CAREER_POSTS_KEY,
  CAREER_APPS_KEY,
  CAREER_POSTS_CHANGED,
  CAREER_APPS_CHANGED,
} from "../../careerJobs/helpers/careerStorageUtils";
import { hrManagementStorage } from "../../hrManagement/storage/hrManagement.storage";
import { attendanceLogStorage } from "../../hrManagement/storage/attendanceLog.storage";
import { taskAssignmentStorage } from "../../hrManagement/storage/taskAssignment.storage";
import { incidentReportStorage } from "../../hrManagement/storage/incidentReport.storage";

/* ------------------------------------------------ */
/* localStorage helpers                             */
/* ------------------------------------------------ */
function safeParseArray(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type Rec = Record<string, unknown>;
function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null;
}

/* ------------------------------------------------ */
/* Dashboard data type                              */
/* ------------------------------------------------ */
export type DashboardData = {
  /* Top tiles */
  pendingShifts: number;
  openJobs: number;
  broadcastMessages: number;
  /* Shift chips */
  shiftActive: number;
  shiftPending: number;
  shiftApplications: number;
  shiftConfirmed: number;
  shiftGroups: number;
  /* Career chips */
  careerActive: number;
  careerApplications: number;
  careerInterviews: number;
  careerOffered: number;
  careerHired: number;
  /* Workforce */
  upcomingWorkforce: number;
  /* HR Management stats */
  hrTotal: number;
  hrActive: number;
  hrPending: number;
  hrExited: number;
  /* Manager Console stats */
  consolePresentToday: number;
  consoleAbsentToday: number;
  consoleActiveTasks: number;
  consoleAlerts: number;
   /* Insights */
  shiftTotalPosts: number;
  /* Flags */
  shiftPostsExist: boolean;
};

/* ------------------------------------------------ */
/* Compute                                          */
/* ------------------------------------------------ */
function computeDashboard(): DashboardData {
  const shiftPosts = safeParseArray("wm_employer_shift_posts_v1");
  const workspaces = safeParseArray("wm_employee_shift_workspaces_v1");
  const employeeApps = safeParseArray("wm_employee_shift_applications_v1");

  /* Career data */
  const careerPosts = safeParseArray(CAREER_POSTS_KEY);
  const careerApps = safeParseArray(CAREER_APPS_KEY);

  let careerActive = 0;
  for (const p of careerPosts) {
    if (!isRec(p)) continue;
    if (p["status"] === "active") careerActive++;
  }

  let careerApplications = 0;
  let careerInterviews = 0;
  let careerOffered = 0;
  let careerHired = 0;
  for (const a of careerApps) {
    if (!isRec(a)) continue;
    const stage = a["stage"];
    if (stage === "applied" || stage === "shortlisted") careerApplications++;
    if (stage === "interview") careerInterviews++;
    if (stage === "offered") careerOffered++;
    if (stage === "hired") careerHired++;
  }

  let shiftActive = 0;
  let shiftConfirmed = 0;

  for (const item of shiftPosts) {
    if (!isRec(item)) continue;

    const confirmedIds = item["confirmedIds"];
    const status = item["status"];
    const confirmed = Array.isArray(confirmedIds) ? confirmedIds.length : 0;

    shiftConfirmed += confirmed;

    if (status === "completed" || status === "cancelled") continue;

    shiftActive++;
  }

  const shiftPending = shiftPosts.filter((p) => {
    if (!isRec(p)) return false;
    const s = p["status"];
    return s !== "completed" && s !== "cancelled";
  }).length;

  const shiftApplications = employeeApps.filter((a) => {
    if (!isRec(a)) return false;
    return a["status"] === "applied";
  }).length;

  /* Count active work groups */
  let shiftGroups = 0;
  for (const ws of workspaces) {
    if (!isRec(ws)) continue;
    const status = ws["status"];
    if (status === "active" || status === "upcoming") shiftGroups++;
  }

  /* Broadcast messages — count unread from workspaces updates */
  let broadcastMessages = 0;
  for (const ws of workspaces) {
    if (!isRec(ws)) continue;
    const unread = ws["unreadCount"];
    if (typeof unread === "number" && unread > 0) broadcastMessages += unread;
  }

  /* HR Management stats */
  const hrAll = hrManagementStorage.getAll();
  const hrTotal = hrAll.length;
  const hrActive = hrAll.filter((r) => r.status === "active").length;
  const hrPending = hrAll.filter((r) => r.status === "offer_pending" || r.status === "offered" || r.status === "onboarding").length;
  const hrExited = hrAll.filter((r) => r.status === "exit_processing").length;

  /* Manager Console stats */
  const activeStaff = hrAll.filter((r) => r.status === "active");
  const todayKey = attendanceLogStorage.toDateKey(new Date());
  let consolePresentToday = 0;
  let consoleAbsentToday = 0;
  for (const emp of activeStaff) {
    const entry = attendanceLogStorage.getDayEntry(emp.id, todayKey);
    if (!entry) continue;
    if (entry.status === "present") consolePresentToday++;
    if (entry.status === "absent") consoleAbsentToday++;
  }

  let consoleActiveTasks = 0;
  for (const emp of activeStaff) {
    consoleActiveTasks += taskAssignmentStorage.getActiveTasks(emp.id).length;
  }

  const consoleAlerts = incidentReportStorage.getPendingCount();

  return {
    pendingShifts: shiftPending,
    openJobs: careerActive,
    broadcastMessages,
    shiftActive,
    shiftPending,
    shiftApplications,
    shiftConfirmed,
    shiftGroups,
    careerActive,
    careerApplications,
    careerInterviews,
    careerOffered,
    careerHired,
    upcomingWorkforce: 0,
    hrTotal,
    hrActive,
    hrPending,
    hrExited,
    consolePresentToday,
    consoleAbsentToday,
    consoleActiveTasks,
    consoleAlerts,
     shiftTotalPosts: shiftPosts.length,
    shiftPostsExist: shiftPosts.length > 0,
  };
}

/* ------------------------------------------------ */
/* Snapshot + Subscribe (for useSyncExternalStore)   */
/* ------------------------------------------------ */
const EVENTS = [
  "wm:employer-shift-posts-changed",
  "wm:employee-shift-workspaces-changed",
  "wm:employee-shift-applications-changed",
  CAREER_POSTS_CHANGED,
  CAREER_APPS_CHANGED,
  hrManagementStorage.CHANGED_EVENT,
  attendanceLogStorage.CHANGED_EVENT,
  taskAssignmentStorage.CHANGED_EVENT,
  incidentReportStorage.CHANGED_EVENT,
  "storage",
  "focus",
];

let cacheKey = "";
let cacheData: DashboardData | null = null;

export function getDashboardSnapshot(): DashboardData {
  const newKey = [
    localStorage.getItem("wm_employer_shift_posts_v1"),
    localStorage.getItem("wm_employee_shift_workspaces_v1"),
    localStorage.getItem(CAREER_POSTS_KEY),
    localStorage.getItem(CAREER_APPS_KEY),
    localStorage.getItem("wm_hr_management_v1"),
    localStorage.getItem("wm_attendance_log_v1"),
    localStorage.getItem("wm_task_assignments_v1"),
    localStorage.getItem("wm_incident_reports_v1"),
  ].join("|");

  if (newKey === cacheKey && cacheData) return cacheData;
  cacheKey = newKey;
  cacheData = computeDashboard();
  return cacheData;
}

export function subscribeDashboard(cb: () => void): () => void {
  const h = () => cb();
  for (const ev of EVENTS) window.addEventListener(ev, h);
  document.addEventListener("visibilitychange", h);
  return () => {
    for (const ev of EVENTS) window.removeEventListener(ev, h);
    document.removeEventListener("visibilitychange", h);
  };
}