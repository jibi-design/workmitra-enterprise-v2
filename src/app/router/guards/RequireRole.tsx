// src/app/router/guards/RequireRole.tsx
import { useSyncExternalStore } from "react";
import { Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";
import { roleStorage, type AppRole } from "../../storage/roleStorage";

function useRole(): AppRole | null {
  // Reactivity: same-tab (custom event) + cross-tab (storage event)
  return useSyncExternalStore(roleStorage.subscribe, roleStorage.get, roleStorage.get);
}

export function RequireRole(props: { role: AppRole; children: React.ReactElement }) {
  const current = useRole();

  // Not logged in / role not set => landing
  if (!current) return <Navigate to={ROUTE_PATHS.landing} replace />;

 // Wrong role => redirect to correct workspace (supports role switch)
  if (current !== props.role) {
    const home = current === "employee" ? ROUTE_PATHS.employeeHome
      : current === "employer" ? ROUTE_PATHS.employerHome
      : ROUTE_PATHS.adminHome;
    return <Navigate to={home} replace />;
  }

  return props.children;
}