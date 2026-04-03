// src/features/employer/notifications/helpers/employerNotificationService.ts
//
// Central notification service — listens to domain storage events
// and auto-pushes notifications. Initialized once in EmployerShell.
// Uses snapshot diffing to detect actual changes.

import { employerNotificationsStorage } from "../storage/employerNotifications.storage";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

/* ------------------------------------------------ */
/* Snapshot types                                   */
/* ------------------------------------------------ */
type Snapshot = {
  hrRecords: string | null;
  attendance: string | null;
  tasks: string | null;
  leave: string | null;
  incidents: string | null;
  roster: string | null;
  shiftApps: string | null;
  careerApps: string | null;
};

function takeSnapshot(): Snapshot {
  return {
    hrRecords: localStorage.getItem("wm_hr_management_v1"),
    attendance: localStorage.getItem("wm_attendance_log_v1"),
    tasks: localStorage.getItem("wm_task_assignments_v1"),
    leave: localStorage.getItem("wm_hr_leave_requests_v1"),
    incidents: localStorage.getItem("wm_incident_reports_v1"),
    roster: localStorage.getItem("wm_roster_planner_v1"),
    shiftApps: localStorage.getItem("wm_employee_shift_applications_v1"),
    careerApps: localStorage.getItem("wm_career_applications_v1"),
  };
}

/* ------------------------------------------------ */
/* Diff helpers                                     */
/* ------------------------------------------------ */
type Rec = Record<string, unknown>;

function safeParseArray(raw: string | null): Rec[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is Rec => typeof x === "object" && x !== null);
  } catch {
    return [];
  }
}

function countByField(items: Rec[], field: string, value: string): number {
  return items.filter((r) => r[field] === value).length;
}

/* ------------------------------------------------ */
/* Service                                          */
/* ------------------------------------------------ */
let prevSnapshot: Snapshot | null = null;
let initialized = false;
let cleanupFn: (() => void) | null = null;

function handleChange() {
  if (!prevSnapshot) return;

  const curr = takeSnapshot();

  // --- Shift Applications (NEW) ---
  if (curr.shiftApps !== prevSnapshot.shiftApps) {
    const oldList = safeParseArray(prevSnapshot.shiftApps);
    const newList = safeParseArray(curr.shiftApps);
    const oldApplied = countByField(oldList, "status", "applied");
    const newApplied = countByField(newList, "status", "applied");

    if (newApplied > oldApplied) {
      const diff = newApplied - oldApplied;
      employerNotificationsStorage.pushShift(
        `${diff} new shift application${diff > 1 ? "s" : ""} received`,
        "A worker has applied to your shift post.",
        ROUTE_PATHS.employerShiftHome,
      );
    }

    const oldWithdrawn = countByField(oldList, "status", "withdrawn");
    const newWithdrawn = countByField(newList, "status", "withdrawn");
    if (newWithdrawn > oldWithdrawn) {
      employerNotificationsStorage.pushShift(
        "A worker withdrew their shift application",
        "Check your shift posts for updated applicant status.",
        ROUTE_PATHS.employerShiftHome,
      );
    }
  }

  // --- Career Applications (NEW) ---
  if (curr.careerApps !== prevSnapshot.careerApps) {
    const oldList = safeParseArray(prevSnapshot.careerApps);
    const newList = safeParseArray(curr.careerApps);
    const oldApplied = countByField(oldList, "stage", "applied");
    const newApplied = countByField(newList, "stage", "applied");

    if (newApplied > oldApplied) {
      const diff = newApplied - oldApplied;
      employerNotificationsStorage.pushCareer(
        `${diff} new career application${diff > 1 ? "s" : ""} received`,
        "A candidate has applied to your job post.",
        ROUTE_PATHS.employerCareerHome,
      );
    }
  }

  // --- HR Management changes ---
  if (curr.hrRecords !== prevSnapshot.hrRecords) {
    const oldList = safeParseArray(prevSnapshot.hrRecords);
    const newList = safeParseArray(curr.hrRecords);

    if (newList.length > oldList.length) {
      const diff = newList.length - oldList.length;
      employerNotificationsStorage.pushHR(
        `${diff} new employee record${diff > 1 ? "s" : ""} added`,
        "Check HR Management for details.",
        ROUTE_PATHS.employerHRManagement,
      );
    }

    const oldActive = countByField(oldList, "status", "active");
    const newActive = countByField(newList, "status", "active");
    if (newActive > oldActive) {
      const diff = newActive - oldActive;
      employerNotificationsStorage.pushHR(
        `${diff} employee${diff > 1 ? "s" : ""} moved to active`,
        undefined,
        ROUTE_PATHS.employerHRManagement,
      );
    }

    const oldExit = countByField(oldList, "status", "exit_processing");
    const newExit = countByField(newList, "status", "exit_processing");
    if (newExit > oldExit) {
      employerNotificationsStorage.pushHR(
        "Exit processing initiated",
        "An employee has entered exit processing.",
        ROUTE_PATHS.employerHRManagement,
      );
    }
  }

  // --- Leave requests ---
  if (curr.leave !== prevSnapshot.leave) {
    const oldList = safeParseArray(prevSnapshot.leave);
    const newList = safeParseArray(curr.leave);
    const oldPending = countByField(oldList, "status", "pending");
    const newPending = countByField(newList, "status", "pending");

    if (newPending > oldPending) {
      employerNotificationsStorage.pushHR(
        "New leave request submitted",
        `${newPending} pending request${newPending > 1 ? "s" : ""} awaiting approval.`,
        ROUTE_PATHS.employerHRManagement,
      );
    }
  }

  // --- Task assignments ---
  if (curr.tasks !== prevSnapshot.tasks) {
    const oldList = safeParseArray(prevSnapshot.tasks);
    const newList = safeParseArray(curr.tasks);

    if (newList.length > oldList.length) {
      const diff = newList.length - oldList.length;
      employerNotificationsStorage.pushConsole(
        `${diff} new task${diff > 1 ? "s" : ""} assigned`,
        undefined,
        ROUTE_PATHS.employerConsoleTaskAssign,
      );
    }

    const oldCompleted = countByField(oldList, "status", "completed");
    const newCompleted = countByField(newList, "status", "completed");
    if (newCompleted > oldCompleted) {
      const diff = newCompleted - oldCompleted;
      employerNotificationsStorage.pushConsole(
        `${diff} task${diff > 1 ? "s" : ""} completed`,
        "Check task assignment for details.",
        ROUTE_PATHS.employerConsoleTaskAssign,
      );
    }
  }

  // --- Attendance ---
  if (curr.attendance !== prevSnapshot.attendance) {
    const oldList = safeParseArray(prevSnapshot.attendance);
    const newList = safeParseArray(curr.attendance);

    if (newList.length > oldList.length) {
      const diff = newList.length - oldList.length;
      employerNotificationsStorage.pushConsole(
        `Attendance marked for ${diff} record${diff > 1 ? "s" : ""}`,
        undefined,
        ROUTE_PATHS.employerConsoleAttendance,
      );
    }
  }

  // --- Incident reports ---
  if (curr.incidents !== prevSnapshot.incidents) {
    const oldList = safeParseArray(prevSnapshot.incidents);
    const newList = safeParseArray(curr.incidents);

    const oldReported = countByField(oldList, "status", "reported");
    const newReported = countByField(newList, "status", "reported");
    if (newReported > oldReported) {
      employerNotificationsStorage.pushConsole(
        "New incident report submitted",
        "An employee has reported an issue.",
        ROUTE_PATHS.employerConsoleIncidents,
      );
    }

    const oldResolved = countByField(oldList, "status", "resolved");
    const newResolved = countByField(newList, "status", "resolved");
    if (newResolved > oldResolved) {
      employerNotificationsStorage.pushConsole(
        "Incident report resolved",
        undefined,
        ROUTE_PATHS.employerConsoleIncidents,
      );
    }
  }

  // --- Roster ---
  if (curr.roster !== prevSnapshot.roster) {
    const oldList = safeParseArray(prevSnapshot.roster);
    const newList = safeParseArray(curr.roster);

    if (newList.length > oldList.length) {
      const diff = newList.length - oldList.length;
      employerNotificationsStorage.pushConsole(
        `${diff} new roster assignment${diff > 1 ? "s" : ""} created`,
        undefined,
        ROUTE_PATHS.employerConsoleRoster,
      );
    }
  }

  prevSnapshot = curr;
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */

/** Initialize once — call in EmployerShell useEffect */
export function initEmployerNotificationService(): () => void {
  if (initialized && cleanupFn) return cleanupFn;

  prevSnapshot = takeSnapshot();
  initialized = true;

  const EVENTS = [
    "wm:hr-management-changed",
    "wm:attendance-log-changed",
    "wm:task-assignment-changed",
    "wm:hr-leave-changed",
    "wm:incident-reports-changed",
    "wm:roster-planner-changed",
    "wm:employee-shift-applications-changed",
    "wm:career-applications-changed",
  ];

  const handler = () => handleChange();
  for (const ev of EVENTS) window.addEventListener(ev, handler);

  cleanupFn = () => {
    for (const ev of EVENTS) window.removeEventListener(ev, handler);
    initialized = false;
    prevSnapshot = null;
    cleanupFn = null;
  };

  return cleanupFn;
}