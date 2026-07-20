/** Job Mitra | ProtectedRoute.tsx | src/shared/components/routes/ProtectedRoute.tsx */

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import type { UserRole } from "../../store/authStore";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../../config/authConfig";
import { stashPendingRoute } from "../../../app/router/pendingRoute";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, sessionChecked } = useAuthStore();
  const location = useLocation();
  const returnPath = `${location.pathname}${location.search}`;

  if (AUTH_BACKEND_ENABLED && !sessionChecked) {
    return null;
  }

  if (AUTH_BACKEND_ENABLED && !isAuthenticated) {
    stashPendingRoute(returnPath);
    return <Navigate to={ROUTE_PATHS.login} state={{ from: returnPath }} replace />;
  }

  if (!AUTH_BACKEND_ENABLED && !isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.landing} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    console.warn(`[Security]: Access denied for role ${user?.role}. Required: ${requiredRole}`);
    return <Navigate to={AUTH_BACKEND_ENABLED ? ROUTE_PATHS.login : ROUTE_PATHS.landing} replace />;
  }

  return <>{children}</>;
}
