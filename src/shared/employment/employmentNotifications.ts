// src/shared/employment/employmentNotifications.ts
// Session 17: Direct notification push for employment lifecycle events.
// Pushes cross-role: employer acts → employee notified, and vice versa.
// Domain: "career" — employment lifecycle is part of Career Jobs mini-HR.
// Pattern: Same as careerNotifications.ts — direct localStorage write.

import { ROUTE_PATHS } from "../../app/router/routePaths";

/* ── Storage Keys & Events (match existing notification storages) ── */
const EMPLOYEE_NOTIF_KEY = "wm_employee_notifications_v1";
const EMPLOYER_NOTIF_KEY = "wm_employer_notifications_v1";
const EMPLOYEE_NOTIF_EVENT = "wm:employee-notifications-changed";
const EMPLOYER_NOTIF_EVENT = "wm:employer-notifications-changed";
const MAX_ITEMS = 200;

/* ── Notification Shape ── */
type NotifEntry = {
  readonly id: string;
  readonly domain: string;
  readonly title: string;
  readonly body: string;
  readonly createdAt: number;
  readonly isRead: boolean;
  readonly route: string;
};

/* ── Internal Helpers ── */
function makeId(): string {
  return `en_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function pushTo(key: string, event: string, title: string, body: string, route: string): void {
  try {
    const raw = localStorage.getItem(key);
    const existing: NotifEntry[] = raw ? (JSON.parse(raw) as NotifEntry[]) : [];
    const entry: NotifEntry = {
      id: makeId(),
      domain: "career",
      title,
      body,
      createdAt: Date.now(),
      isRead: false,
      route,
    };
    localStorage.setItem(key, JSON.stringify([entry, ...existing].slice(0, MAX_ITEMS)));
    window.dispatchEvent(new Event(event));
  } catch { /* storage-safe — non-critical */ }
}

function toEmployee(title: string, body: string): void {
  pushTo(EMPLOYEE_NOTIF_KEY, EMPLOYEE_NOTIF_EVENT, title, body, ROUTE_PATHS.employeeCareerHome);
}

function toEmployer(title: string, body: string): void {
  pushTo(EMPLOYER_NOTIF_KEY, EMPLOYER_NOTIF_EVENT, title, body, ROUTE_PATHS.employerCareerHome);
}

/* ── Notification Triggers ── */

/** Employer marked employee as joined → notify employee. */
export function notifyEmployeeJoined(jobTitle: string, companyName: string): void {
  toEmployee(
    "You have been marked as joined",
    `${jobTitle}${companyName ? " at " + companyName : ""} — your employment is now active.`,
  );
}

/** Employee resigned → notify employer. */
export function notifyEmployerResignation(employeeName: string, jobTitle: string): void {
  toEmployer(
    "Employee resignation received",
    `${employeeName} has submitted resignation from ${jobTitle}.`,
  );
}

/** Employee withdrew resignation → notify employer. */
export function notifyEmployerWithdrawal(employeeName: string, jobTitle: string): void {
  toEmployer(
    "Resignation withdrawn",
    `${employeeName} has withdrawn resignation from ${jobTitle}.`,
  );
}

/** Employer confirmed resignation → notify employee. */
export function notifyEmployeeResignConfirmed(jobTitle: string, companyName: string): void {
  toEmployee(
    "Resignation confirmed",
    `Your resignation from ${jobTitle}${companyName ? " at " + companyName : ""} has been confirmed.`,
  );
}

/** Employer terminated employee → notify employee. */
export function notifyEmployeeTerminated(jobTitle: string, companyName: string): void {
  toEmployee(
    "Employment terminated",
    `Your employment as ${jobTitle}${companyName ? " at " + companyName : ""} has been terminated.`,
  );
}

/** Employment completed → both sides get "Please rate" reminder. */
export function notifyBothPleaseRate(
  employeeName: string,
  companyName: string,
  jobTitle: string,
): void {
  toEmployee(
    "Please rate your experience",
    `Rate your experience as ${jobTitle}${companyName ? " at " + companyName : ""}.`,
  );
  toEmployer(
    "Please rate your employee",
    `Rate ${employeeName}'s work as ${jobTitle}.`,
  );
}