/** Job Mitra | routerHelpers.tsx | Shared router helpers */

import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";
import type { AppRole } from "../../storage/roleStorage";
import { useAppRole } from "../guards/useAppRole";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { RouteGuardLoading } from "../../../shared/components/routes/RouteGuardStatus";
import { useRuntimeOpsFlags } from "../../../shared/ops/useRuntimeOpsFlags";

export const IS_DEV_ADMIN_ENABLED = import.meta.env.DEV;

export function PageLoader() {
  return <RouteGuardLoading label="Loading page" />;
}

function getHomeForRole(role: AppRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return IS_DEV_ADMIN_ENABLED ? ROUTE_PATHS.adminHome : ROUTE_PATHS.landing;
}

export function RoleHomeRedirect() {
  const role = useAppRole();
  if (!role) {
    return <Navigate to={AUTH_BACKEND_ENABLED ? ROUTE_PATHS.login : ROUTE_PATHS.landing} replace />;
  }
  return <Navigate to={getHomeForRole(role)} replace />;
}

export function LaunchModuleBoundary({
  enabled,
  fallback,
  runtimeKill,
}: {
  enabled: boolean;
  fallback: string;
  /** Sprint 3 — Super Admin remote kill switch */
  runtimeKill?: "shift" | "career" | "planner";
}): ReactNode {
  const flags = useRuntimeOpsFlags();
  const killed =
    runtimeKill === "shift"
      ? flags.killShift
      : runtimeKill === "career"
        ? flags.killCareer
        : runtimeKill === "planner"
          ? flags.killPlanner
          : false;
  return enabled && !killed ? <Outlet /> : <Navigate to={fallback} replace />;
}
