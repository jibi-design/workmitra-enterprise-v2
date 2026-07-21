/** Job Mitra | plannerRouteContract.ts | Hybrid A2 P1.0 Route Contract */

import { ROUTE_PATHS } from "../../../app/router/routePaths";

/** Canonical planner paths — Zero Dead-End Route Contract (S1 / P1.0). */
export const PLANNER_ROUTE_CONTRACT = {
  employee: {
    home: ROUTE_PATHS.employeePlannerHome,
    discover: ROUTE_PATHS.employeePlannerDiscover,
    browse: ROUTE_PATHS.employeePlannerBrowse,
    projectDetail: ROUTE_PATHS.employeePlannerProjectDetail,
    projectApply: ROUTE_PATHS.employeePlannerProjectApply,
    applications: ROUTE_PATHS.employeePlannerApplications,
    planApplicationSummary: ROUTE_PATHS.employeePlannerPlanApplicationSummary,
    workspaceHub: ROUTE_PATHS.employeePlannerWorkspaceHub,
    workspaceDetail: ROUTE_PATHS.employeePlannerWorkspace,
    workspaces: ROUTE_PATHS.employeePlannerWorkspaces,
    earnings: ROUTE_PATHS.employeePlannerEarnings,
  },
  employer: {
    home: ROUTE_PATHS.employerPlannerHome,
    plans: ROUTE_PATHS.employerPlannerPlans,
    create: ROUTE_PATHS.employerPlannerCreate,
    new: ROUTE_PATHS.employerPlannerNew,
    detail: ROUTE_PATHS.employerPlannerDetail,
    finance: ROUTE_PATHS.employerPlannerFinance,
    applications: ROUTE_PATHS.employerPlannerApplications,
    roster: ROUTE_PATHS.employerPlannerRoster,
    rosterDetail: ROUTE_PATHS.employerPlannerRosterDetail,
  },
} as const;

export type PlannerStatusTag =
  | "draft"
  | "applied"
  | "confirmed"
  | "epoch_due"
  | "offboarded"
  | "published"
  | "batch_pending"
  | "roster_active"
  | "cancelled";

export type PlannerNextStep = {
  readonly nextAction: string;
  readonly nextRoute: string;
};

/** Status tags must always resolve to an explicit next step (Zero Dead-End). */
export const PLANNER_STATUS_NEXT_STEP: Record<PlannerStatusTag, PlannerNextStep> = {
  draft: {
    nextAction: "Continue wizard",
    nextRoute: PLANNER_ROUTE_CONTRACT.employer.create,
  },
  applied: {
    nextAction: "View applications",
    nextRoute: PLANNER_ROUTE_CONTRACT.employee.applications,
  },
  confirmed: {
    nextAction: "Open roster workspace",
    nextRoute: PLANNER_ROUTE_CONTRACT.employee.workspaceHub,
  },
  epoch_due: {
    nextAction: "Review milestone",
    nextRoute: PLANNER_ROUTE_CONTRACT.employee.workspaceHub,
  },
  offboarded: {
    nextAction: "Rate & open vault",
    nextRoute: ROUTE_PATHS.employeeVaultHome,
  },
  published: {
    nextAction: "Open roster console",
    nextRoute: PLANNER_ROUTE_CONTRACT.employer.roster,
  },
  batch_pending: {
    nextAction: "Batch review applications",
    nextRoute: PLANNER_ROUTE_CONTRACT.employer.applications,
  },
  roster_active: {
    nextAction: "Track coverage",
    nextRoute: PLANNER_ROUTE_CONTRACT.employer.roster,
  },
  cancelled: {
    nextAction: "Back to plans",
    nextRoute: PLANNER_ROUTE_CONTRACT.employer.plans,
  },
};

/** Absolute paths that must resolve without ErrorBoundary for role crawls (S1). */
export const PLANNER_EMPLOYEE_CRAWL_PATHS: readonly string[] = [
  PLANNER_ROUTE_CONTRACT.employee.home,
  PLANNER_ROUTE_CONTRACT.employee.discover,
  PLANNER_ROUTE_CONTRACT.employee.browse,
  PLANNER_ROUTE_CONTRACT.employee.applications,
  PLANNER_ROUTE_CONTRACT.employee.workspaceHub,
  PLANNER_ROUTE_CONTRACT.employee.workspaces,
  PLANNER_ROUTE_CONTRACT.employee.earnings,
];

export const PLANNER_EMPLOYER_CRAWL_PATHS: readonly string[] = [
  PLANNER_ROUTE_CONTRACT.employer.home,
  PLANNER_ROUTE_CONTRACT.employer.plans,
  PLANNER_ROUTE_CONTRACT.employer.create,
  PLANNER_ROUTE_CONTRACT.employer.new,
  PLANNER_ROUTE_CONTRACT.employer.applications,
  PLANNER_ROUTE_CONTRACT.employer.roster,
];

export function resolvePlannerStatusNextStep(status: PlannerStatusTag): PlannerNextStep {
  return PLANNER_STATUS_NEXT_STEP[status];
}
