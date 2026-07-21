// Job Mitra | plannerEmployeeRoutes.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";

export function employeeProjectDetailPath(planId: string): string {
  return ROUTE_PATHS.employeePlannerProjectDetail.replace(":planId", planId);
}

export function employeeProjectApplyPath(planId: string): string {
  return ROUTE_PATHS.employeePlannerProjectApply.replace(":planId", planId);
}

export function employeePlanApplicationSummaryPath(planId: string): string {
  return ROUTE_PATHS.employeePlannerPlanApplicationSummary.replace(":planId", planId);
}

export function employeePlannerDiscoverPath(): string {
  return ROUTE_PATHS.employeePlannerDiscover;
}

export function employeePlannerWorkspaceHubPath(): string {
  return ROUTE_PATHS.employeePlannerWorkspaceHub;
}
