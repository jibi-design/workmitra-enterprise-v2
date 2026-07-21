/** Job Mitra | navigation.helpers.ts | Domain resolution + active tab matching for bottom nav */

import type { NavDomain, NavItem } from "../config/navigation.config";
import { ROUTE_PATHS } from "../app/router/routePaths";

const DOMAIN_HOME_PATHS = new Set<string>([
  ROUTE_PATHS.employeeHome,
  ROUTE_PATHS.employerHome,
  ROUTE_PATHS.employeeCareerHome,
  ROUTE_PATHS.employeeShiftCenter,
  ROUTE_PATHS.employeePlannerHome,
  ROUTE_PATHS.employerShiftHome,
  ROUTE_PATHS.employerCareerHome,
  ROUTE_PATHS.employerPlannerHome,
  ROUTE_PATHS.employeeVaultHome,
  ROUTE_PATHS.employerHRManagement,
]);

/** Extra path prefixes that should highlight a tab beyond its base path */
const EXTRA_ACTIVE_PREFIXES: Record<string, readonly string[]> = {
  [ROUTE_PATHS.employeeShiftSearch]: ["/employee/shift/projects", "/employee/shift/projects/"],
  [ROUTE_PATHS.employeeShiftApplications]: [
    "/employee/shift/workspaces",
    "/employee/shift/workspace/",
  ],
  [ROUTE_PATHS.employeeCareerApplications]: [
    "/employee/career/workspace/",
    "/employee/career/workspaces",
    "/employee/career/completed-records",
  ],
  [ROUTE_PATHS.employeeCareerSearch]: ["/employee/career/post/"],
  [ROUTE_PATHS.employerShiftPosts]: ["/employer/shift/post/"],
  [ROUTE_PATHS.employerCareerPosts]: ["/employer/career/post/", "/employer/career/create"],
  [ROUTE_PATHS.employeePlannerDiscover]: [
    "/employee/planner/browse",
    "/employee/planner/projects/",
  ],
  [ROUTE_PATHS.employeePlannerApplications]: ["/employee/planner/applications/plan/"],
  [ROUTE_PATHS.employeePlannerWorkspaceHub]: [
    "/employee/planner/workspace/",
    "/employee/planner/workspaces",
  ],
  [ROUTE_PATHS.employerPlannerApplications]: ["/employer/planner/applications"],
  [ROUTE_PATHS.employerPlannerRoster]: ["/employer/planner/roster/"],
  [ROUTE_PATHS.employerPlannerCreate]: ["/employer/planner/new", "/employer/planner/create"],
  [ROUTE_PATHS.employerShiftWorkspaces]: ["/employer/shift/workspace/"],
  [ROUTE_PATHS.employerMyStaff]: ["/employer/my-staff/"],
};

export function resolveNavDomain(pathname: string): NavDomain {
  if (pathname.startsWith("/employer")) {
    if (pathname.startsWith("/employer/planner")) return "employerPlanner";
    if (pathname.startsWith("/employer/shift")) return "employerShift";
    if (pathname.startsWith("/employer/career")) return "employerCareer";
    if (pathname.startsWith("/employer/hr") || pathname.startsWith("/employer/console"))
      return "hr";
    return "employerDefault";
  }

  if (pathname.startsWith("/employee/planner")) return "employeePlanner";
  if (pathname.startsWith("/employee/career")) return "career";
  if (pathname.startsWith("/employee/shift")) return "shift";
  if (pathname.startsWith("/employee/vault")) return "vault";

  return "employeeDefault";
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (pathname === item.path) return true;

  if (item.label === "Home" && DOMAIN_HOME_PATHS.has(item.path)) {
    return pathname === item.path;
  }

  if (pathname.startsWith(`${item.path}/`)) return true;

  const extras = EXTRA_ACTIVE_PREFIXES[item.path];
  if (extras?.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return false;
}
