// src/app/router/guards/RequireRole.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";
import { stashPendingRoute } from "../pendingRoute";
import type { AppRole } from "../../storage/roleStorage";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { useAuthStore } from "../../../shared/store/authStore";
import { useAppRole } from "./useAppRole";
import {
  RouteGuardDenied,
  RouteGuardLoading,
} from "../../../shared/components/routes/RouteGuardStatus";

function homeForRole(role: AppRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

export function RequireRole(props: { role: AppRole; children: React.ReactElement }) {
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

    if (authUser.role !== props.role) {
      const home = homeForRole(authUser.role);
      return (
        <RouteGuardDenied
          title="Access denied"
          message={`This area is for ${props.role} accounts. You are signed in as ${authUser.role}.`}
          primaryLabel="Go to your home"
          onPrimary={() => nav(home, { replace: true })}
        />
      );
    }

    return props.children;
  }

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

  if (appRole !== props.role) {
    const home = homeForRole(appRole);
    return (
      <RouteGuardDenied
        title="Access denied"
        message={`This area is for ${props.role} accounts. Your current workspace is ${appRole}.`}
        primaryLabel="Go to your home"
        onPrimary={() => nav(home, { replace: true })}
      />
    );
  }

  return props.children;
}
