// src/app/router/AppRouter.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTE_PATHS } from "./routePaths";
import { roleStorage } from "../storage/roleStorage";

import { LandingRolePickPage } from "../../features/auth/pages/LandingRolePickPage";

import { EmployeeShell } from "../shells/EmployeeShell";
import { EmployerShell } from "../shells/EmployerShell";
import { AdminShell } from "../shells/AdminShell";

import { EmployeeHomePage } from "../../features/employee/home/pages/EmployeeHomePage";
import { EmployerHomePage } from "../../features/employer/home/pages/EmployerHomePage";
import { AdminHomePage } from "../../features/admin/home/pages/AdminHomePage";
import { ShiftControlCenterPage } from "../../features/employee/shiftJobs/pages/ShiftControlCenterPage";

function roleHomeRedirect() {
  const role = roleStorage.get();
  if (role === "employee") return <Navigate to={ROUTE_PATHS.employeeHome} replace />;
  if (role === "employer") return <Navigate to={ROUTE_PATHS.employerHome} replace />;
  if (role === "admin") return <Navigate to={ROUTE_PATHS.adminHome} replace />;
  return <Navigate to={ROUTE_PATHS.landing} replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <div className="wm-app">
        <Routes>
          <Route path={ROUTE_PATHS.landing} element={<LandingRolePickPage />} />

          <Route path={ROUTE_PATHS.employeeHome} element={<EmployeeShell />}>
            <Route index element={<EmployeeHomePage />} />
            <Route path="shift" element={<ShiftControlCenterPage />} />
          </Route>

          <Route path={ROUTE_PATHS.employerHome} element={<EmployerShell />}>
            <Route index element={<EmployerHomePage />} />
          </Route>

          <Route path={ROUTE_PATHS.adminHome} element={<AdminShell />}>
            <Route index element={<AdminHomePage />} />
          </Route>

          <Route path="*" element={roleHomeRedirect()} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}