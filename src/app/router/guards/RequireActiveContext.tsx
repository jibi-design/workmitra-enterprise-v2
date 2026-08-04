/** Require active workspace context (employee | employer). Evolves RequireRole. */

import { useNavigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";
import { stashPendingRoute } from "../pendingRoute";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { useAuthStore, type ActiveMode } from "../../../shared/store/authStore";
import { useAppRole } from "./useAppRole";
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
      return <RouteGuardLoading overlay label="Checking your session" />;
    }

    if (!isAuthenticated || !authUser) {
      stashPendingRoute(returnPath);
      return (
        <RouteGuardDenied
          title="Sign in required"
          message="You need an active account to open this workspace."
          primaryLabel="Sign in"
          onPrimary={() => nav(ROUTE_PATHS.login, { replace: true, state: { from: returnPath } })}
        />
      );
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
      return (
        <RouteGuardDenied
          title="Wrong workspace context"
          message={`This area is for the ${props.mode} workspace. Your active context is ${active ?? "unset"}.`}
          primaryLabel="Go to your home"
          onPrimary={() => nav(home, { replace: true })}
        />
      );
    }

    return props.children;
  }

  // AUTH off — legacy roleStorage bridge (same behavior as RequireRole for EE/ER).
  if (!appRole) {
    stashPendingRoute(returnPath);
    return (
      <RouteGuardDenied
        title="Choose a workspace"
        message="Pick Employee or Employer to continue to this page."
        primaryLabel="Choose workspace"
        onPrimary={() => nav(ROUTE_PATHS.landing, { replace: true, state: { from: returnPath } })}
      />
    );
  }

  if (appRole !== props.mode) {
    const home =
      appRole === "employee" || appRole === "employer"
        ? homeForMode(appRole)
        : ROUTE_PATHS.adminHome;
    return (
      <RouteGuardDenied
        title="Wrong workspace context"
        message={`This area is for the ${props.mode} workspace. Your current workspace is ${appRole}.`}
        primaryLabel="Go to your home"
        onPrimary={() => nav(home, { replace: true })}
      />
    );
  }

  return props.children;
}

/** @deprecated Prefer RequireActiveContext for employee/employer shells. */
export { RequireRole };
