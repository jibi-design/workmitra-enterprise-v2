/** Job Mitra | AppRouter.tsx | Thin router shell — feature routes live under ./routes */

import { Suspense } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTE_PATHS } from "./routePaths";
import { ErrorBoundary } from "../../shared/components/ErrorBoundary";
import { RequireRole } from "./guards/RequireRole";
import { LandingRolePickPage } from "../../features/auth/pages/LandingRolePickPage";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { PublicLandingPage } from "../../features/public/pages/PublicLandingPage";
import { AUTH_BACKEND_ENABLED } from "../../shared/config/authConfig";
import { EmployeeShell } from "../shells/EmployeeShell";
import { EmployerShell } from "../shells/EmployerShell";
import { AdminShell } from "../shells/AdminShell";
import { PublicWebsiteShell } from "../shells/PublicWebsiteShell";
import { PulseTrailProvider } from "../../features/pulse/PulseTrailProvider";
import { adminDisabledRoute, adminRouteTree } from "./routes/admin.routes";
import { NotFoundPage } from "./routes/adminLazyPages";
import { employeeRouteTree } from "./routes/employee.routes";
import { employerRouteTree } from "./routes/employer.routes";
import { IS_DEV_ADMIN_ENABLED, PageLoader, RoleHomeRedirect } from "./routes/routerHelpers";

export function AppRouter() {
  return (
    <HashRouter>
      <PulseTrailProvider>
        <div className="wm-app">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path={ROUTE_PATHS.login} element={<LoginPage />} />

              <Route
                path={ROUTE_PATHS.landing}
                element={
                  AUTH_BACKEND_ENABLED ? (
                    <Navigate to={ROUTE_PATHS.login} replace />
                  ) : (
                    <LandingRolePickPage />
                  )
                }
              />

              <Route
                path={ROUTE_PATHS.rolePick}
                element={<Navigate to={ROUTE_PATHS.landing} replace />}
              />
              <Route
                path={ROUTE_PATHS.publicWelcome}
                element={<Navigate to={ROUTE_PATHS.landing} replace />}
              />

              <Route path={ROUTE_PATHS.publicSite} element={<PublicWebsiteShell />}>
                <Route index element={<PublicLandingPage />} />
              </Route>

              <Route
                path={ROUTE_PATHS.employeeHome}
                element={
                  <RequireRole role="employee">
                    <ErrorBoundary homePath={ROUTE_PATHS.employeeHome}>
                      <EmployeeShell />
                    </ErrorBoundary>
                  </RequireRole>
                }
              >
                {employeeRouteTree}
              </Route>

              <Route
                path={ROUTE_PATHS.employerHome}
                element={
                  <RequireRole role="employer">
                    <ErrorBoundary homePath={ROUTE_PATHS.employerHome}>
                      <EmployerShell />
                    </ErrorBoundary>
                  </RequireRole>
                }
              >
                {employerRouteTree}
              </Route>

              {IS_DEV_ADMIN_ENABLED ? (
                <Route
                  path={ROUTE_PATHS.adminHome}
                  element={
                    <RequireRole role="admin">
                      <ErrorBoundary homePath={ROUTE_PATHS.adminHome}>
                        <AdminShell />
                      </ErrorBoundary>
                    </RequireRole>
                  }
                >
                  {adminRouteTree}
                </Route>
              ) : (
                adminDisabledRoute
              )}

              <Route path="/_go" element={<RoleHomeRedirect />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </PulseTrailProvider>
    </HashRouter>
  );
}
