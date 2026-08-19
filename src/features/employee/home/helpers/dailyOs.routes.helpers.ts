/** Job Mitra | dailyOs.routes.helpers.ts | Frozen dashboard tap-through targets */

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { PendingActionItem } from "../../../../shared/pendingActions/pendingActions.types";
import type { CareerFunnelStage, DailyOsLane } from "./dailyOs.types";

export function sanitizeEmployeeRoute(route: string | undefined, fallback: string): string {
  const clean = (route ?? "").trim();
  if (!clean.startsWith("/employee")) return fallback;
  if (clean.includes("://")) return fallback;
  return clean;
}

export function careerFunnelStageRoute(stage: CareerFunnelStage): string {
  if (stage === "interview") return `${ROUTE_PATHS.employeeCareerApplications}?tab=interview`;
  if (stage === "offer") return `${ROUTE_PATHS.employeeCareerApplications}?tab=offers`;
  return `${ROUTE_PATHS.employeeCareerApplications}?tab=active`;
}

export function criticalTapRoute(item: PendingActionItem | null): string {
  if (!item) return ROUTE_PATHS.employeeReviewCenter;
  const id = item.id.toLowerCase();
  if (id.includes("interview")) return `${ROUTE_PATHS.employeeCareerApplications}?tab=interview`;
  if (id.includes("offer")) return `${ROUTE_PATHS.employeeCareerApplications}?tab=offers`;
  if (item.domain === "career") return ROUTE_PATHS.employeeCareerApplications;
  if (id.includes("attendance") || item.domain === "shift") {
    return ROUTE_PATHS.employeeShiftApplications;
  }
  return ROUTE_PATHS.employeeReviewCenter;
}

export function activityLaneFallback(lane: DailyOsLane): string {
  if (lane === "planner") return ROUTE_PATHS.employeePlannerApplications;
  if (lane === "career") return ROUTE_PATHS.employeeCareerApplications;
  return ROUTE_PATHS.employeeShiftApplications;
}

export function shiftActivityRoute(args: {
  readonly planner: boolean;
  readonly planId?: string;
  readonly postId?: string;
}): string {
  if (args.planner) {
    if (args.planId) {
      return ROUTE_PATHS.employeePlannerPlanApplicationSummary.replace(":planId", args.planId);
    }
    return ROUTE_PATHS.employeePlannerApplications;
  }
  if (args.postId) {
    return ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", args.postId);
  }
  return ROUTE_PATHS.employeeShiftApplications;
}

export function careerActivityRoute(): string {
  return ROUTE_PATHS.employeeCareerApplications;
}
