// src/app/router/guards/RequireRole.tsx
import { useSyncExternalStore } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";
import { stashPendingRoute } from "../pendingRoute";
import { roleStorage, type AppRole } from "../../storage/roleStorage";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { useAuthStore } from "../../../shared/store/authStore";

function useRole(): AppRole | null {
  return useSyncExternalStore(roleStorage.subscribe, roleStorage.get, roleStorage.get);
}

export function RequireRole(props: { role: AppRole; children: React.ReactElement }) {
  const location = useLocation();
  const returnPath = `${location.pathname}${location.search}`;

  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user);
  const roleFromStorage = useRole();

  if (AUTH_BACKEND_ENABLED) {
    if (!sessionChecked) return null;

    if (!isAuthenticated || !authUser) {
      stashPendingRoute(returnPath);
      return <Navigate to={ROUTE_PATHS.login} replace state={{ from: returnPath }} />;
    }

    if (authUser.role !== props.role) {
      const home =
        authUser.role === "employee"
          ? ROUTE_PATHS.employeeHome
          : authUser.role === "employer"
            ? ROUTE_PATHS.employerHome
            : ROUTE_PATHS.adminHome;
      return <Navigate to={home} replace />;
    }

    return props.children;
  }

  if (!roleFromStorage) {
    stashPendingRoute(returnPath);
    return <Navigate to={ROUTE_PATHS.landing} replace state={{ from: returnPath }} />;
  }

  if (roleFromStorage !== props.role) {
    const home =
      roleFromStorage === "employee"
        ? ROUTE_PATHS.employeeHome
        : roleFromStorage === "employer"
          ? ROUTE_PATHS.employerHome
          : ROUTE_PATHS.adminHome;
    return <Navigate to={home} replace />;
  }

  return props.children;
}
