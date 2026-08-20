/** Job Mitra | AppRouter.tsx | Thin router shell — feature routes live under ./routes */
/** Wave-4: createHashRouter so useBlocker dirty-form guards work */

import { lazy, Suspense } from "react";
import {
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { ROUTE_PATHS } from "./routePaths";
import { ErrorBoundary, RouteErrorBoundary } from "../../shared/components/ErrorBoundary";
import { RequireActiveContext } from "./guards/RequireActiveContext";
import { RoleGate } from "./guards/RoleGate";
import { EmployeeShell } from "../shells/EmployeeShell";
import { EmployerShell } from "../shells/EmployerShell";
import { AdminShell } from "../shells/AdminShell";
import { PublicWebsiteShell } from "../shells/PublicWebsiteShell";
import { GuestBrowseShell } from "../shells/GuestBrowseShell";
import { PulseTrailProvider } from "../../features/pulse/PulseTrailProvider";
import { SoftAuthProvider } from "../../shared/guest/SoftAuthProvider";
import { adminDisabledRoute, adminRouteTree } from "./routes/admin.routes";
import { NotFoundPage } from "./routes/adminLazyPages";
import { employeeRouteTree } from "./routes/employee.routes";
import { employerRouteTree } from "./routes/employer.routes";
import { PublicPassVerifyPage } from "./routes/employerLazyPages";
import {
  ForgotPasswordPage,
  GuestCareerDetailPage,
  GuestCareersPage,
  GuestExplorePage,
  GuestShiftDetailPage,
  GuestShiftsPage,
  LandingRolePickPage,
  LoginPage,
  PublicLandingPage,
  RegisterPage,
  ResetPasswordPage,
} from "./routes/publicLazyPages";
import { IS_DEV_ADMIN_ENABLED, PageLoader, RoleHomeRedirect } from "./routes/routerHelpers";

const CapRibbonGeometryHarnessPage = import.meta.env.DEV
  ? lazy(() =>
      import("../../features/employer/home/pages/CapRibbonGeometryHarnessPage").then((m) => ({
        default: m.CapRibbonGeometryHarnessPage,
      })),
    )
  : null;

const LaneSubcardGeometryHarnessPage = import.meta.env.DEV
  ? lazy(() =>
      import("../../features/employer/home/pages/LaneSubcardGeometryHarnessPage").then((m) => ({
        default: m.LaneSubcardGeometryHarnessPage,
      })),
    )
  : null;

const appRouter = createHashRouter(
  createRoutesFromElements(
    <Route
      element={
        <PulseTrailProvider>
          <SoftAuthProvider>
            <div className="wm-app">
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </div>
          </SoftAuthProvider>
        </PulseTrailProvider>
      }
    >
      <Route
        path={ROUTE_PATHS.login}
        element={
          <ErrorBoundary homePath={ROUTE_PATHS.login}>
            <LoginPage />
          </ErrorBoundary>
        }
      />
      <Route
        path={ROUTE_PATHS.register}
        element={
          <ErrorBoundary homePath={ROUTE_PATHS.login}>
            <RegisterPage />
          </ErrorBoundary>
        }
      />
      <Route
        path={ROUTE_PATHS.forgotPassword}
        element={
          <ErrorBoundary homePath={ROUTE_PATHS.login}>
            <ForgotPasswordPage />
          </ErrorBoundary>
        }
      />
      <Route
        path={ROUTE_PATHS.resetPassword}
        element={
          <ErrorBoundary homePath={ROUTE_PATHS.login}>
            <ResetPasswordPage />
          </ErrorBoundary>
        }
      />

      <Route
        path={ROUTE_PATHS.landing}
        element={
          <ErrorBoundary homePath={ROUTE_PATHS.landing}>
            <LandingRolePickPage />
          </ErrorBoundary>
        }
      />

      <Route path={ROUTE_PATHS.rolePick} element={<Navigate to={ROUTE_PATHS.landing} replace />} />
      <Route
        path={ROUTE_PATHS.publicWelcome}
        element={<Navigate to={ROUTE_PATHS.landing} replace />}
      />

      <Route
        path={ROUTE_PATHS.publicSite}
        element={
          <ErrorBoundary homePath={ROUTE_PATHS.publicSite}>
            <PublicWebsiteShell />
          </ErrorBoundary>
        }
      >
        <Route index element={<PublicLandingPage />} />
      </Route>

      {/* Phase 4 — Guest browse (Browse = public value) */}
      <Route
        element={
          <ErrorBoundary homePath={ROUTE_PATHS.explore}>
            <GuestBrowseShell />
          </ErrorBoundary>
        }
      >
        <Route path={ROUTE_PATHS.explore} element={<GuestExplorePage />} />
        <Route path={ROUTE_PATHS.guestShifts} element={<GuestShiftsPage />} />
        <Route path={ROUTE_PATHS.guestShiftDetails} element={<GuestShiftDetailPage />} />
        <Route path={ROUTE_PATHS.guestCareers} element={<GuestCareersPage />} />
        <Route path={ROUTE_PATHS.guestCareerDetails} element={<GuestCareerDetailPage />} />
      </Route>

      {/* Mitra Labs — public pass verification (opaque token only) */}
      <Route
        path={ROUTE_PATHS.labsPassVerify}
        element={
          <ErrorBoundary homePath={ROUTE_PATHS.landing}>
            <PublicPassVerifyPage />
          </ErrorBoundary>
        }
      />

      <Route
        path={ROUTE_PATHS.employeeHome}
        element={
          <RequireActiveContext mode="employee">
            <RouteErrorBoundary homePath={ROUTE_PATHS.employeeHome}>
              <EmployeeShell />
            </RouteErrorBoundary>
          </RequireActiveContext>
        }
      >
        {employeeRouteTree}
      </Route>

      <Route
        path={ROUTE_PATHS.employerHome}
        element={
          <RequireActiveContext mode="employer">
            <RouteErrorBoundary homePath={ROUTE_PATHS.employerHome}>
              <EmployerShell />
            </RouteErrorBoundary>
          </RequireActiveContext>
        }
      >
        {employerRouteTree}
      </Route>

      {IS_DEV_ADMIN_ENABLED ? (
        <Route
          path={ROUTE_PATHS.adminHome}
          element={
            <RoleGate roles="admin">
              <ErrorBoundary homePath={ROUTE_PATHS.adminHome}>
                <AdminShell />
              </ErrorBoundary>
            </RoleGate>
          }
        >
          {adminRouteTree}
        </Route>
      ) : (
        adminDisabledRoute
      )}

      <Route path="/_go" element={<RoleHomeRedirect />} />
      {CapRibbonGeometryHarnessPage ? (
        <Route path="/dev/cap-ribbon-geometry" element={<CapRibbonGeometryHarnessPage />} />
      ) : null}
      {LaneSubcardGeometryHarnessPage ? (
        <Route path="/dev/lane-subcard-geometry" element={<LaneSubcardGeometryHarnessPage />} />
      ) : null}
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);

export function AppRouter() {
  return <RouterProvider router={appRouter} />;
}
