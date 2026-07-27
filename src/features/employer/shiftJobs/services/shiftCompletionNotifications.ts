// App name: Job Mitra
// File name: shiftCompletionNotifications.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\services\shiftCompletionNotifications.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { handleIncomingNotification } from "../../../pulse/pulseEventBridge";
import { employerNotificationsStorage } from "../../../employer/notifications/storage/employerNotifications.storage";
import { employeeNotificationPort } from "../../../../shared/notifications/employeeNotificationPort";

function buildShiftRatePromptSignature(workspaceId: string): string {
  return `[SHIFT_PLEASE_RATE:${workspaceId}]`;
}

function shiftRatePromptAlreadySent(role: "employee" | "employer", signature: string): boolean {
  const notifications =
    role === "employee" ? employeeNotificationPort.getAll() : employerNotificationsStorage.getAll();

  return notifications.some((note) => (note.body ?? "").includes(signature));
}

export function notifyShiftBothPleaseRate(params: {
  employeeName: string;
  companyName: string;
  jobName: string;
  workspaceId: string;
}): void {
  const signature = buildShiftRatePromptSignature(params.workspaceId);

  const employeeRoute = ROUTE_PATHS.employeeShiftWorkspace.replace(
    ":workspaceId",
    params.workspaceId,
  );
  const employerRoute = ROUTE_PATHS.employerShiftWorkspace.replace(
    ":workspaceId",
    params.workspaceId,
  );

  if (!shiftRatePromptAlreadySent("employee", signature)) {
    handleIncomingNotification({
      type: "NEW_RATING",
      domain: "shift",
      affectedUserRole: "employee",
      targetId: params.workspaceId,
      title: "Please rate your experience",
      body: `${signature} Rate your experience as ${params.jobName} at ${params.companyName}.`,
      route: employeeRoute,
    });
  }

  if (!shiftRatePromptAlreadySent("employer", signature)) {
    handleIncomingNotification({
      type: "NEW_RATING",
      domain: "shift",
      affectedUserRole: "employer",
      targetId: params.workspaceId,
      title: "Please rate your employee",
      body: `${signature} Rate ${params.employeeName}'s work as ${params.jobName}.`,
      route: employerRoute,
    });
  }
}
