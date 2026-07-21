// Job Mitra | plannerLegacyRedirects.tsx | Shift URL → Gig Projects domain

import { Navigate, useLocation, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import {
  employeePlanApplicationSummaryPath,
  employeeProjectApplyPath,
  employeeProjectDetailPath,
} from "./helpers/plannerEmployeeRoutes";

export function LegacyShiftProjectRedirect() {
  const { planId } = useParams();
  if (!planId) return <Navigate to={ROUTE_PATHS.employeePlannerBrowse} replace />;
  return <Navigate to={employeeProjectDetailPath(planId)} replace />;
}

export function LegacyShiftProjectApplyRedirect() {
  const { planId } = useParams();
  if (!planId) return <Navigate to={ROUTE_PATHS.employeePlannerBrowse} replace />;
  return <Navigate to={employeeProjectApplyPath(planId)} replace />;
}

export function LegacyShiftPlanSummaryRedirect() {
  const { planId } = useParams();
  if (!planId) return <Navigate to={ROUTE_PATHS.employeePlannerApplications} replace />;
  return <Navigate to={employeePlanApplicationSummaryPath(planId)} replace />;
}

export function LegacyShiftSearchGigHashRedirect() {
  const loc = useLocation();
  if (loc.hash === "#gig-projects") {
    return <Navigate to={ROUTE_PATHS.employeePlannerDiscover} replace />;
  }
  return null;
}
