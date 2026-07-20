// Job Mitra | plannerEmployeeNotifications.service.ts | Section 8.5

import { notifyCrossRole } from "../../../pulse/pulseEventBridge";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employeePlanApplicationSummaryPath } from "../../planner/helpers/plannerEmployeeRoutes";

function notifyPlannerEmployee(title: string, body: string, route: string): void {
  notifyCrossRole({
    type: "GROUP_UPDATE",
    domain: "shift",
    affectedUserRole: "employee",
    title,
    body,
    route,
  });
}

export const plannerEmployeeNotifications = {
  batchApplied(planName: string, dayCount: number, planId: string): void {
    notifyPlannerEmployee(
      `Applied to ${dayCount} day${dayCount !== 1 ? "s" : ""} — ${planName}`,
      "Your project plan application batch was submitted.",
      employeePlanApplicationSummaryPath(planId),
    );
  },

  planCancelled(planName: string, planId: string): void {
    notifyCrossRole({
      type: "PLAN_CANCELLED",
      domain: "shift",
      affectedUserRole: "employee",
      postId: planId,
      severity: "warning",
      title: `${planName} was cancelled by employer`,
      body: "Pending day applications for this project are no longer available.",
      route: employeePlanApplicationSummaryPath(planId),
    });
  },

  planCancelledConfirmedWorker(
    planName: string,
    jobName: string,
    planId: string,
    postId: string,
    appId: string,
  ): void {
    notifyCrossRole({
      type: "SHIFT_PLAN_CANCELLED_CONFIRMED_WORKER",
      domain: "shift",
      affectedUserRole: "employee",
      postId,
      appId,
      severity: "urgent",
      title: `${planName} was cancelled`,
      body: `Your confirmed assignment for ${jobName} is cancelled because the employer closed this project.`,
      route: employeePlanApplicationSummaryPath(planId),
    });
  },

  crewBroadcast(planName: string, workspaceRoute: string): void {
    notifyPlannerEmployee(
      `Project update — ${planName}`,
      "Your employer sent a private project broadcast to your workspace.",
      workspaceRoute,
    );
  },

  confirmedDay(planName: string, dateLabel: string, workspaceRoute?: string): void {
    notifyPlannerEmployee(
      `Confirmed for ${dateLabel} — ${planName}`,
      "Open your workspace for day-specific updates.",
      workspaceRoute ?? ROUTE_PATHS.employeePlannerWorkspaces,
    );
  },

  directInvite(planName: string, postRoute: string): void {
    notifyPlannerEmployee(
      `Direct invite — ${planName}`,
      "You have a VIP invite for a plan day.",
      postRoute,
    );
  },
};
