// src/features/employee/notifications/helpers/employeeNotificationService.detectors.helpers.ts

import { employeeNotificationsStorage } from "../storage/employeeNotifications.storage";
import { handleIncomingNotification } from "../../../pulse/pulseEventBridge";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

export type Snapshot = {
  shiftApps: string | null;
  workspaces: string | null;
  careerApps: string | null;
  leave: string | null;
  tasks: string | null;
  roster: string | null;
  incidents: string | null;
  shiftPosts: string | null;
};

export function takeSnapshot(): Snapshot {
  return {
    shiftApps: localStorage.getItem("wm_employee_shift_applications_v1"),
    workspaces: localStorage.getItem("wm_employee_shift_workspaces_v1"),
    careerApps: localStorage.getItem("wm_employee_career_applications_v1"),
    leave: localStorage.getItem("wm_hr_leave_requests_v1"),
    tasks: localStorage.getItem("wm_task_assignment_v1"),
    roster: localStorage.getItem("wm_roster_planner_v1"),
    incidents: localStorage.getItem("wm_incident_reports_v1"),
    shiftPosts: localStorage.getItem("wm_employer_shift_posts_v1"),
  };
}

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

function sumField(items: Rec[], field: string): number {
  let total = 0;
  for (const item of items) {
    const v = item[field];
    if (typeof v === "number") total += v;
  }
  return total;
}

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

function detectSmartMatch(prev: Snapshot, curr: Snapshot) {
  if (curr.shiftPosts === prev.shiftPosts) return;
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
      break;
    }
  }

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

function detectShiftChanges(prev: Snapshot, curr: Snapshot) {
  if (curr.workspaces === prev.workspaces) return;

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
  if (countByField(newList, "status", "completed") > countByField(oldList, "status", "completed")) {
    handleIncomingNotification({
      type: "GROUP_UPDATE",
      domain: "shift",
      affectedUserRole: "employee",
      title: "Shift completed",
      body: "A shift has been marked as completed.",
    });
  }
}

function detectLeaveChanges(prev: Snapshot, curr: Snapshot) {
  if (curr.leave === prev.leave) return;
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

function detectTaskChanges(prev: Snapshot, curr: Snapshot) {
  if (curr.tasks === prev.tasks) return;
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

function detectRosterChanges(prev: Snapshot, curr: Snapshot) {
  if (curr.roster === prev.roster) return;
  const oldList = safeArray(prev.roster);
  const newList = safeArray(curr.roster);

  if (newList.length > oldList.length) {
    employeeNotificationsStorage.pushEmployment(
      "Schedule updated",
      "You have been assigned to a new schedule.",
    );
  }
}

function detectIncidentChanges(prev: Snapshot, curr: Snapshot) {
  if (curr.incidents === prev.incidents) return;
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

export function handleNotificationChange(prev: Snapshot): Snapshot {
  const curr = takeSnapshot();

  detectShiftChanges(prev, curr);
  detectSmartMatch(prev, curr);
  detectLeaveChanges(prev, curr);
  detectTaskChanges(prev, curr);
  detectRosterChanges(prev, curr);
  detectIncidentChanges(prev, curr);

  return curr;
}
