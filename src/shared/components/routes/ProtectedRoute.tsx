/** Job Mitra | ProtectedRoute.tsx — aligned with RequireRole / useAppRole (RBAC Wave 2+3). */

import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore, type UserRole } from "../../store/authStore";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../../config/authConfig";
import { stashPendingRoute } from "../../../app/router/pendingRoute";
import { useAppRole } from "../../../app/router/guards/useAppRole";
import { RouteGuardDenied, RouteGuardLoading } from "./RouteGuardStatus";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

function homeForRole(role: UserRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const nav = useNavigate();
  const returnPath = `${location.pathname}${location.search}`;
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
      return (
        <RouteGuardDenied
          title="Sign in required"
          message="You need an active account to open this page."
          primaryLabel="Sign in"
          onPrimary={() => nav(ROUTE_PATHS.login, { replace: true, state: { from: returnPath } })}
        />
      );
    }

    if (requiredRole && authUser.role !== requiredRole) {
      return (
        <RouteGuardDenied
          title="Access denied"
          message={`Required role: ${requiredRole}. You are signed in as ${authUser.role}.`}
          primaryLabel="Go to your home"
          onPrimary={() => nav(homeForRole(authUser.role), { replace: true })}
        />
      );
    }

    return <>{children}</>;
  }

  if (!appRole) {
    stashPendingRoute(returnPath);
    return (
      <RouteGuardDenied
        title="Choose a workspace"
        message="Pick Employee or Employer to continue."
        primaryLabel="Choose workspace"
        onPrimary={() => nav(ROUTE_PATHS.landing, { replace: true, state: { from: returnPath } })}
      />
    );
  }

  if (requiredRole && appRole !== requiredRole) {
    return (
      <RouteGuardDenied
        title="Access denied"
        message={`Required role: ${requiredRole}. Current workspace: ${appRole}.`}
        primaryLabel="Go to your home"
        onPrimary={() => nav(homeForRole(appRole), { replace: true })}
      />
    );
  }

  return <>{children}</>;
}
