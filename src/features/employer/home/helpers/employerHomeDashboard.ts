// App name: Job Mitra
// File name: employerHomeDashboard.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\home\helpers\employerHomeDashboard.ts

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
  /* Launch-safe hero KPIs */
  activeHiring: number;
  newApplications: number;
  workVaultActivity: number;

  /* Business clarity summary */
  totalPosts: number;
  applicationsActivity: number;
  hiringActivity: number;
  workVaultDocumentRecords: number;

  /* Existing top tiles - kept for compatibility */
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

  /* Workforce - hidden/future launch module */
  upcomingWorkforce: number;

  /* HR Management stats - hidden/future launch module */
  hrTotal: number;
  hrActive: number;
  hrPending: number;
  hrExited: number;

  /* Manager Console stats - hidden/future launch module */
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

  const careerPosts = safeParseArray(CAREER_POSTS_KEY);
  const careerApps = safeParseArray(CAREER_APPS_KEY);

  const workVaultAccessLog = safeParseArray("wm_doc_access_log_v1");
  const workVaultDocuments = safeParseArray("wm_work_vault_documents_v1");

  let careerActive = 0;

  for (const post of careerPosts) {
    if (!isRec(post)) continue;
    if (post["status"] === "active") careerActive++;
  }

  let careerApplications = 0;
  let careerInterviews = 0;
  let careerOffered = 0;
  let careerHired = 0;

  for (const application of careerApps) {
    if (!isRec(application)) continue;

    const stage = application["stage"];

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

  const shiftPending = shiftPosts.filter((post) => {
    if (!isRec(post)) return false;

    const status = post["status"];
    return status !== "completed" && status !== "cancelled";
  }).length;

  const shiftApplications = employeeApps.filter((application) => {
    if (!isRec(application)) return false;
    return application["status"] === "applied";
  }).length;

  let shiftGroups = 0;

  for (const workspace of workspaces) {
    if (!isRec(workspace)) continue;

    const status = workspace["status"];
    if (status === "active" || status === "upcoming") shiftGroups++;
  }

  let broadcastMessages = 0;

  for (const workspace of workspaces) {
    if (!isRec(workspace)) continue;

    const unread = workspace["unreadCount"];
    if (typeof unread === "number" && unread > 0) broadcastMessages += unread;
  }

  const hrAll = hrManagementStorage.getAll();
  const hrTotal = hrAll.length;
  const hrActive = hrAll.filter((record) => record.status === "active").length;
  const hrPending = hrAll.filter(
    (record) =>
      record.status === "offer_pending" ||
      record.status === "offered" ||
      record.status === "onboarding",
  ).length;
  const hrExited = hrAll.filter((record) => record.status === "exit_processing").length;

  const activeStaff = hrAll.filter((record) => record.status === "active");
  const todayKey = attendanceLogStorage.toDateKey(new Date());

  let consolePresentToday = 0;
  let consoleAbsentToday = 0;

  for (const employee of activeStaff) {
    const entry = attendanceLogStorage.getDayEntry(employee.id, todayKey);

    if (!entry) continue;
    if (entry.status === "present") consolePresentToday++;
    if (entry.status === "absent") consoleAbsentToday++;
  }

  let consoleActiveTasks = 0;

  for (const employee of activeStaff) {
    consoleActiveTasks += taskAssignmentStorage.getActiveTasks(employee.id).length;
  }

  const consoleAlerts = incidentReportStorage.getPendingCount();

  const activeHiring = careerActive + shiftActive;
  const newApplications = careerApplications + shiftApplications;
  const workVaultDocumentRecords = workVaultDocuments.length;
  const workVaultActivity = workVaultAccessLog.length + workVaultDocumentRecords;
  const totalPosts = careerPosts.length + shiftPosts.length;
  const applicationsActivity = careerApplications + shiftApplications;
  const hiringActivity = careerInterviews + careerOffered + careerHired + shiftConfirmed;

  return {
    activeHiring,
    newApplications,
    workVaultActivity,
    totalPosts,
    applicationsActivity,
    hiringActivity,
    workVaultDocumentRecords,

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
/* Snapshot + Subscribe                             */
/* ------------------------------------------------ */
const EVENTS = [
  "wm:employer-shift-posts-changed",
  "wm:employee-shift-workspaces-changed",
  "wm:employee-shift-applications-changed",
  "wm:doc-access-session-changed",
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
    localStorage.getItem("wm_employee_shift_applications_v1"),
    localStorage.getItem(CAREER_POSTS_KEY),
    localStorage.getItem(CAREER_APPS_KEY),
    localStorage.getItem("wm_doc_access_log_v1"),
    localStorage.getItem("wm_work_vault_documents_v1"),
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
  const handler = () => cb();

  for (const eventName of EVENTS) {
    window.addEventListener(eventName, handler);
  }

  document.addEventListener("visibilitychange", handler);

  return () => {
    for (const eventName of EVENTS) {
      window.removeEventListener(eventName, handler);
    }

    document.removeEventListener("visibilitychange", handler);
  };
}
