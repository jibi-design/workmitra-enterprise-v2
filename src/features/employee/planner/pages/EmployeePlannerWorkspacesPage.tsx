/** Job Mitra | EmployeePlannerWorkspacesPage.tsx | S7 — redirect to native workspace hub */

import { Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

/** Compat list path → canonical roster hub (Zero Soft-Wrappers). */
export function EmployeePlannerWorkspacesPage() {
  return <Navigate to={ROUTE_PATHS.employeePlannerWorkspaceHub} replace />;
}
