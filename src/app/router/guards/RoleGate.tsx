/**
 * WAVE-5.1 Layer 2 — client RoleGate for React Router.
 * Prefer RequireActiveContext for employee/employer workspace shells.
 */

import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";
import { stashPendingRoute } from "../pendingRoute";
import type { AppRole } from "../../storage/roleStorage";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { useAuthStore, type UserRole } from "../../../shared/store/authStore";
import {
  resolveClientAllowedRoles,
  roleMatchesGate,
  type RbacRoleAlias,
} from "../../../shared/auth/rbacRoles";
import { useAppRole } from "./useAppRole";
import { LAB_WORKSPACE_PICK_PATH } from "./ensureLabWorkspaceRole";
import {
  RouteGuardDenied,
  RouteGuardLoading,
} from "../../../shared/components/routes/RouteGuardStatus";

function homeForRole(role: UserRole | AppRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

export type RoleGateProps = {
  roles: RbacRoleAlias | readonly RbacRoleAlias[];
  children: React.ReactElement;
};

export function RoleGate(props: RoleGateProps) {
  const location = useLocation();
  const nav = useNavigate();
  const returnPath = `${location.pathname}${location.search}`;
  const allowed = resolveClientAllowedRoles(
    Array.isArray(props.roles) ? props.roles : [props.roles],
  );

  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user);
  const appRole = useAppRole();

  if (AUTH_BACKEND_ENABLED) {
    if (!sessionChecked) {
      return <RouteGuardLoading overlay label="Checking your session" />;
    }

    if (!isAuthenticated || !authUser) {
      stashPendingRoute(returnPath);
      return <Navigate to={ROUTE_PATHS.login} replace state={{ from: returnPath }} />;
    }

    if (!roleMatchesGate(authUser.role, allowed)) {
      const label = allowed.join(" / ");
      return (
        <RouteGuardDenied
          title="Access denied"
          message={`This area requires: ${label}. You are signed in as ${authUser.role}.`}
          primaryLabel="Go to your home"
          onPrimary={() => nav(homeForRole(authUser.role), { replace: true })}
        />
      );
    }

    return props.children;
  }

  if (!appRole) {
    stashPendingRoute(returnPath);
    return <Navigate to={LAB_WORKSPACE_PICK_PATH} replace state={{ from: returnPath }} />;
  }

  if (!roleMatchesGate(appRole, allowed)) {
    return (
      <RouteGuardDenied
        title="Access denied"
        message={`This area requires: ${allowed.join(" / ")}. Your workspace is ${appRole}.`}
        primaryLabel="Go to your home"
        onPrimary={() => nav(homeForRole(appRole), { replace: true })}
      />
    );
  }

  return props.children;
}
