// src/features/employee/notifications/helpers/employeeNotificationService.ts
//
// Central notification service for employee side.
// Listens to domain storage events and auto-pushes notifications.
// Initialized once in EmployeeShell via useEffect.
//
// Level 1 = Always Notify (prominent notification + badge count)
// Level 2 = Silent Update (no notification, data update only)
// Level 3 = Never Notify (employer-private — employee never sees)

import { employeeNotificationsStorage } from "../storage/employeeNotifications.storage";
import { handleIncomingNotification } from "../../../pulse/pulseEventBridge";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

/* ------------------------------------------------ */
/* Snapshot                                         */
/* ------------------------------------------------ */
type Snapshot = {
  shiftApps: string | null;
  workspaces: string | null;
  careerApps: string | null;
  leave: string | null;
  tasks: string | null;
  roster: string | null;
  incidents: string | null;
  shiftPosts: string | null;
};

function takeSnapshot(): Snapshot {
  return {
    shiftApps: localStorage.getItem("wm_employee_shift_applications_v1"),
    workspaces: localStorage.getItem("wm_employee_shift_workspaces_v1"),
    careerApps: localStorage.getItem("wm_career_applications_v1"),
    leave: localStorage.getItem("wm_hr_leave_requests_v1"),
    tasks: localStorage.getItem("wm_task_assignments_v1"),
    roster: localStorage.getItem("wm_roster_planner_v1"),
    incidents: localStorage.getItem("wm_incident_reports_v1"),
    shiftPosts: localStorage.getItem("wm_employer_shift_posts_v1"),
  };
}

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
type Rec = Record<string, unknown>;

function safeArray(raw: string | null): Rec[] {
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
/* Change detection                                 */
/* ------------------------------------------------ */
let prev: Snapshot | null = null;
let initialized = false;
let cleanupFn: (() => void) | null = null;

function handleChange() {
  if (!prev) return;
  const curr = takeSnapshot();

  detectShiftChanges(curr);
  detectSmartMatch(curr);
  detectLeaveChanges(curr);
  detectTaskChanges(curr);
  detectRosterChanges(curr);
  detectIncidentChanges(curr);

  prev = curr;
}

/* ------------------------------------------------ */
/* SMART MATCH — new shift matches worker profile   */
/* ------------------------------------------------ */
function getAppliedCategories(): Set<string> {
  const apps = safeArray(localStorage.getItem("wm_employee_shift_applications_v1"));
  const posts = safeArray(localStorage.getItem("wm_employer_shift_posts_v1"));
  const postMap = new Map<string, string>();
  for (const p of posts) {
    const id = p["id"];
    const cat = p["category"];
    if (typeof id === "string" && typeof cat === "string") postMap.set(id, cat);
  }
  const cats = new Set<string>();
  for (const a of apps) {
    const pid = a["postId"];
    if (typeof pid === "string") {
      const c = postMap.get(pid);
      if (c) cats.add(c);
    }
  }
  return cats;
}

function detectSmartMatch(curr: Snapshot) {
  if (!prev || curr.shiftPosts === prev.shiftPosts) return;
  const oldList = safeArray(prev.shiftPosts);
  const newList = safeArray(curr.shiftPosts);
  if (newList.length <= oldList.length) return;

  const oldIds = new Set(oldList.map((p) => p["id"] as string));
  const newPosts = newList.filter(
    (p) =>
      typeof p["id"] === "string" && !oldIds.has(p["id"] as string) && !p["isHiddenFromSearch"],
  );
  if (newPosts.length === 0) return;

  const appliedCats = getAppliedCategories();

  for (const post of newPosts) {
    const cat = typeof post["category"] === "string" ? post["category"] : "";
    const job = typeof post["jobName"] === "string" ? post["jobName"] : "shift";
    const company = typeof post["companyName"] === "string" ? post["companyName"] : "";
    const pay = typeof post["payPerDay"] === "number" ? post["payPerDay"] : 0;
    const loc = typeof post["locationName"] === "string" ? post["locationName"] : "";

    if (appliedCats.size > 0 && cat && appliedCats.has(cat)) {
      handleIncomingNotification({
        type: "SHIFT_POSTS_NEARBY",
        domain: "shift",
        affectedUserRole: "employee",
        title: `New ${cat} shift matches your profile`,
        body: `${job}${company ? " at " + company : ""}${loc ? " \u2014 " + loc : ""}${pay > 0 ? ". Pay: " + pay + "/day" : ""}`,
        route: ROUTE_PATHS.employeeShiftSearch,
      });
      break; /* max 1 smart match notification per batch */
    }
  }

  /* If no category match but worker has availability broadcast → generic nudge */
  if (appliedCats.size === 0 && newPosts.length > 0) {
    const avRaw = localStorage.getItem("wm_employee_availability_broadcast_v1");
    if (avRaw) {
      handleIncomingNotification({
        type: "SHIFT_POSTS_NEARBY",
        domain: "shift",
        affectedUserRole: "employee",
        title: `${newPosts.length} new shift${newPosts.length !== 1 ? "s" : ""} posted near you`,
        body: "New shifts are available. Check them out.",
        route: ROUTE_PATHS.employeeShiftSearch,
      });
    }
  }
}

/* ------------------------------------------------ */
/* SHIFT domain detectors                           */
/* ------------------------------------------------ */
function detectShiftChanges(curr: Snapshot) {
  if (!prev || curr.workspaces === prev.workspaces) return;

  if (curr.workspaces !== prev.workspaces) {
    const oldList = safeArray(prev.workspaces);
    const newList = safeArray(curr.workspaces);

    const oldUnread = sumField(oldList, "unreadCount");
    const newUnread = sumField(newList, "unreadCount");
    if (newUnread > oldUnread) {
      handleIncomingNotification({
        type: "GROUP_UPDATE",
        domain: "shift",
        affectedUserRole: "employee",
        title: "New workspace update",
        body: "You have a new message in your shift group.",
      });
    }
    if (
      countByField(newList, "status", "completed") > countByField(oldList, "status", "completed")
    ) {
      handleIncomingNotification({
        type: "GROUP_UPDATE",
        domain: "shift",
        affectedUserRole: "employee",
        title: "Shift completed",
        body: "A shift has been marked as completed.",
      });
    }
  }
}

/* ------------------------------------------------ */
/* CAREER domain — routed via pulseEventBridge      */
/* ------------------------------------------------ */

/* ------------------------------------------------ */
/* EMPLOYMENT domain detectors (Level 1)            */
/* ------------------------------------------------ */
function detectLeaveChanges(curr: Snapshot) {
  if (!prev || curr.leave === prev.leave) return;
  const oldList = safeArray(prev.leave);
  const newList = safeArray(curr.leave);

  if (countByField(newList, "status", "approved") > countByField(oldList, "status", "approved")) {
    employeeNotificationsStorage.pushEmployment(
      "Leave approved",
      "Your leave request has been approved.",
    );
  }
  if (countByField(newList, "status", "rejected") > countByField(oldList, "status", "rejected")) {
    employeeNotificationsStorage.pushEmployment(
      "Leave not approved",
      "Your leave request was not approved.",
    );
  }
}

function detectTaskChanges(curr: Snapshot) {
  if (!prev || curr.tasks === prev.tasks) return;
  const oldList = safeArray(prev.tasks);
  const newList = safeArray(curr.tasks);

  if (newList.length > oldList.length) {
    const diff = newList.length - oldList.length;
    employeeNotificationsStorage.pushEmployment(
      "New task assigned",
      `You have been assigned ${diff} new task${diff > 1 ? "s" : ""}.`,
    );
  }
}

function detectRosterChanges(curr: Snapshot) {
  if (!prev || curr.roster === prev.roster) return;
  const oldList = safeArray(prev.roster);
  const newList = safeArray(curr.roster);

  if (newList.length > oldList.length) {
    employeeNotificationsStorage.pushEmployment(
      "Schedule updated",
      "You have been assigned to a new schedule.",
    );
  }
}

function detectIncidentChanges(curr: Snapshot) {
  if (!prev || curr.incidents === prev.incidents) return;
  const oldList = safeArray(prev.incidents);
  const newList = safeArray(curr.incidents);

  if (
    countByField(newList, "status", "investigating") >
    countByField(oldList, "status", "investigating")
  ) {
    employeeNotificationsStorage.pushEmployment(
      "Incident update",
      "Your incident report is being investigated.",
    );
  }
  if (countByField(newList, "status", "resolved") > countByField(oldList, "status", "resolved")) {
    employeeNotificationsStorage.pushEmployment(
      "Incident update",
      "Your incident report has been resolved.",
    );
  }
}

/* ------------------------------------------------ */
/* Utility                                          */
/* ------------------------------------------------ */
function sumField(items: Rec[], field: string): number {
  let total = 0;
  for (const item of items) {
    const v = item[field];
    if (typeof v === "number") total += v;
  }
  return total;
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
/** Initialize once — call in EmployeeShell useEffect */
export function initEmployeeNotificationService(): () => void {
  if (initialized && cleanupFn) return cleanupFn;

  prev = takeSnapshot();
  initialized = true;

  const EVENTS = [
    "wm:employer-shift-posts-changed",
    "wm:employee-shift-applications-changed",
    "wm:employee-shift-workspaces-changed",
    "wm:career-applications-changed",
    "wm:hr-leave-changed",
    "wm:task-assignment-changed",
    "wm:roster-planner-changed",
    "wm:incident-reports-changed",
  ];

  const handler = () => handleChange();
  for (const ev of EVENTS) window.addEventListener(ev, handler);

  cleanupFn = () => {
    for (const ev of EVENTS) window.removeEventListener(ev, handler);
    initialized = false;
    prev = null;
    cleanupFn = null;
  };

  return cleanupFn;
}
