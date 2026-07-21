/** Job Mitra | routerHelpers.tsx | Shared router helpers */

import { useSyncExternalStore, type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";
import { roleStorage, type AppRole } from "../../storage/roleStorage";

export const IS_DEV_ADMIN_ENABLED = import.meta.env.DEV;

export function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
        minHeight: 200,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          border: "3px solid var(--wm-brand-600, #1d4ed8)",
          borderTopColor: "transparent",
          animation: "wm-spin 0.6s linear infinite",
        }}
      />
    </div>
  );
}

function getHomeForRole(role: AppRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return IS_DEV_ADMIN_ENABLED ? ROUTE_PATHS.adminHome : ROUTE_PATHS.landing;
}

function useRole(): AppRole | null {
  return useSyncExternalStore(roleStorage.subscribe, roleStorage.get, roleStorage.get);
}

export function RoleHomeRedirect() {
  const role = useRole();
  if (!role) return <Navigate to={ROUTE_PATHS.landing} replace />;
  return <Navigate to={getHomeForRole(role)} replace />;
}

export function LaunchModuleBoundary({
  enabled,
  fallback,
}: {
  enabled: boolean;
  fallback: string;
}): ReactNode {
  return enabled ? <Outlet /> : <Navigate to={fallback} replace />;
}
