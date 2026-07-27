// App name: Job Mitra
// Cascade-reject open shift applications when a post closes (Wave 1 P1-7)

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import { pushEmployerActivity } from "../storage/employerShift.activityStorage";
import {
  readEmployeeApplications,
  writeEmployeeApplications,
} from "../storage/employerShift.employeeBridge";
import type { ApplicantStatus } from "../storage/employerShift.types";

const OPEN_STATUSES = new Set<ApplicantStatus>(["applied", "shortlisted", "waiting"]);

export function cascadeRejectOpenShiftApplications(params: {
  postId: string;
  jobName: string;
  companyName: string;
  reason: string;
}): { rejectedCount: number; rejectedAppIds: string[] } {
  const { postId, jobName, companyName, reason } = params;
  const apps = readEmployeeApplications();
  const now = Date.now();
  const rejectedAppIds: string[] = [];

  const next = apps.map((app) => {
    if (app.postId !== postId) return app;
    if (!OPEN_STATUSES.has(app.status)) return app;

    rejectedAppIds.push(app.id);
    return {
      ...app,
      status: "rejected" as const,
      statusChangedAt: now,
    };
  });

  if (rejectedAppIds.length === 0) {
    return { rejectedCount: 0, rejectedAppIds: [] };
  }

  const writeResult = writeEmployeeApplications(next);
  if (!writeResult.ok) {
    return { rejectedCount: 0, rejectedAppIds: [] };
  }

  pushEmployerActivity({
    postId,
    kind: "post_closed",
    title: "Open applications closed",
    body: `${rejectedAppIds.length} open application(s) closed for ${jobName}. Reason: ${reason}`,
    route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
  });

  const signature = `[SHIFT_APPLICATIONS_CLOSED:${postId}:${now}]`;
  notifyCrossRole({
    type: "SHIFT_APPLICATION_REJECTED",
    domain: "shift",
    affectedUserRole: "employee",
    postId,
    title: "Application update",
    body: `${signature} ${rejectedAppIds.length} application(s) for ${jobName} at ${companyName} were closed. ${reason}`,
    route: ROUTE_PATHS.employeeShiftApplications,
  });

  return {
    rejectedCount: rejectedAppIds.length,
    rejectedAppIds,
  };
}
