// App name: Job Mitra
// File name: employmentNotifications.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\employment\employmentNotifications.ts

// Employment lifecycle notifications — routed through the global notification bridge
// so bells use the employment domain and pulse can activate on key lifecycle events.

import { ROUTE_PATHS } from "../../app/router/routePaths";
import { handleIncomingNotification } from "../../features/pulse/pulseEventBridge";
import { employeeNotificationsStorage } from "../../features/employee/notifications/storage/employeeNotifications.storage";
import { employerNotificationsStorage } from "../../features/employer/notifications/storage/employerNotifications.storage";

function buildEmploymentRatePromptSignature(careerPostId: string): string {
  return `[EMPLOYMENT_PLEASE_RATE:${careerPostId}]`;
}

function employmentRatePromptAlreadySent(
  role: "employee" | "employer",
  signature: string,
): boolean {
  const notifications =
    role === "employee"
      ? employeeNotificationsStorage.getAll()
      : employerNotificationsStorage.getAll();

  return notifications.some((note) => (note.body ?? "").includes(signature));
}

function notifyEmployee(
  type: Parameters<typeof handleIncomingNotification>[0]["type"],
  title: string,
  body: string,
): void {
  handleIncomingNotification({
    type,
    domain: "employment",
    affectedUserRole: "employee",
    title,
    body,
    route: ROUTE_PATHS.employeeCareerHome,
  });
}

function notifyEmployer(
  type: Parameters<typeof handleIncomingNotification>[0]["type"],
  title: string,
  body: string,
): void {
  handleIncomingNotification({
    type,
    domain: "employment",
    affectedUserRole: "employer",
    title,
    body,
    route: ROUTE_PATHS.employerCareerHome,
  });
}

export function notifyEmployeeJoined(jobTitle: string, companyName: string): void {
  notifyEmployee(
    "EMPLOYMENT_JOINED",
    "You have been marked as joined",
    `${jobTitle}${companyName ? " at " + companyName : ""} - your employment is now active.`,
  );
}

export function notifyEmployerResignation(employeeName: string, jobTitle: string): void {
  notifyEmployer(
    "EMPLOYMENT_RESIGNATION_SUBMITTED",
    "Employee resignation received",
    `${employeeName} has submitted resignation from ${jobTitle}.`,
  );
}

export function notifyEmployerWithdrawal(employeeName: string, jobTitle: string): void {
  notifyEmployer(
    "EMPLOYMENT_RESIGNATION_WITHDRAWN",
    "Resignation withdrawn",
    `${employeeName} has withdrawn resignation from ${jobTitle}.`,
  );
}

export function notifyEmployeeResignConfirmed(jobTitle: string, companyName: string): void {
  notifyEmployee(
    "EMPLOYMENT_RESIGNATION_CONFIRMED",
    "Resignation confirmed",
    `Your resignation from ${jobTitle}${companyName ? " at " + companyName : ""} has been confirmed.`,
  );
}

export function notifyEmployeeTerminated(jobTitle: string, companyName: string): void {
  notifyEmployee(
    "EMPLOYMENT_TERMINATED",
    "Employment terminated",
    `Your employment as ${jobTitle}${companyName ? " at " + companyName : ""} has been terminated.`,
  );
}

export function notifyBothPleaseRate(
  employeeName: string,
  companyName: string,
  jobTitle: string,
  careerPostId: string,
): void {
  const signature = buildEmploymentRatePromptSignature(careerPostId);

  if (!employmentRatePromptAlreadySent("employee", signature)) {
    handleIncomingNotification({
      type: "EMPLOYMENT_PLEASE_RATE",
      domain: "employment",
      affectedUserRole: "employee",
      targetId: careerPostId,
      title: "Please rate your experience",
      body: `Rate your experience as ${jobTitle}${companyName ? " at " + companyName : ""}. ${signature}`,
      route: ROUTE_PATHS.employeeCareerHome,
    });
  }

  if (!employmentRatePromptAlreadySent("employer", signature)) {
    handleIncomingNotification({
      type: "EMPLOYMENT_PLEASE_RATE",
      domain: "employment",
      affectedUserRole: "employer",
      targetId: careerPostId,
      title: "Please rate your employee",
      body: `Rate ${employeeName}'s work as ${jobTitle}. ${signature}`,
      route: ROUTE_PATHS.employerCareerHome,
    });
  }
}

export function notifyEmployerForceCompleted(employeeName: string, jobTitle: string): void {
  notifyEmployer(
    "EMPLOYMENT_FORCE_COMPLETED",
    "Employment auto-completed",
    `${employeeName}'s employment as ${jobTitle} has been completed automatically. Resignation was not confirmed within the allowed period.`,
  );
}
