/** Require active workspace context (employee | employer). Evolves RequireRole. */

import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";
import { stashPendingRoute } from "../pendingRoute";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { useAuthStore, type ActiveMode } from "../../../shared/store/authStore";
import { useAppRole } from "./useAppRole";
import { LAB_WORKSPACE_PICK_PATH } from "./ensureLabWorkspaceRole";
import {
  RouteGuardDenied,
  RouteGuardLoading,
} from "../../../shared/components/routes/RouteGuardStatus";
import { RequireRole } from "./RequireRole";

function homeForMode(mode: ActiveMode): string {
  return mode === "employee" ? ROUTE_PATHS.employeeHome : ROUTE_PATHS.employerHome;
}

function resolveActiveMode(user: {
  role: string;
  activeMode?: ActiveMode | null;
}): ActiveMode | null {
  if (user.activeMode === "employee" || user.activeMode === "employer") {
    return user.activeMode;
  }
  if (user.role === "employee" || user.role === "employer") {
    return user.role;
  }
  return null;
}

/**
 * Route guard for dual-context shells.
 * Deep-links with the wrong activeMode soft-redirect to the correct home.
 * AUTH off + no role → Landing Employee/Employer pick (no dead interstitial, no auto-assume).
 */
export function RequireActiveContext(props: { mode: ActiveMode; children: React.ReactElement }) {
  const location = useLocation();
  const nav = useNavigate();
  const returnPath = `${location.pathname}${location.search}`;

  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user);
  const appRole = useAppRole();

  if (AUTH_BACKEND_ENABLED) {
    if (!sessionChecked) {
      if (appRole === props.mode) {
        return props.children;
      }
      return <RouteGuardLoading overlay label="Checking your session" />;
    }

    if (!isAuthenticated || !authUser) {
      if (appRole === props.mode) {
        return props.children;
      }
      stashPendingRoute(returnPath);
      return <Navigate to={ROUTE_PATHS.landing} replace state={{ from: returnPath }} />;
    }

    if (authUser.role === "admin") {
      return (
        <RouteGuardDenied
          title="Access denied"
          message="This area is for employee or employer workspaces."
          primaryLabel="Go to admin home"
          onPrimary={() => nav(ROUTE_PATHS.adminHome, { replace: true })}
        />
      );
    }

    const active = resolveActiveMode(authUser);
    if (active !== props.mode) {
      const home = active ? homeForMode(active) : ROUTE_PATHS.login;
      return <Navigate to={home} replace />;
    }

    return props.children;
  }

  // AUTH off — Landing is the only Employee/Employer chooser
  if (!appRole) {
    stashPendingRoute(returnPath);
    return <Navigate to={LAB_WORKSPACE_PICK_PATH} replace state={{ from: returnPath }} />;
  }

  if (appRole !== props.mode) {
    const home =
      appRole === "employee" || appRole === "employer"
        ? homeForMode(appRole)
        : ROUTE_PATHS.adminHome;
    return <Navigate to={home} replace />;
  }

  return props.children;
}

/** @deprecated Prefer RequireActiveContext for employee/employer shells. */
export { RequireRole };
