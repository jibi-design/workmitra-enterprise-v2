/** Job Mitra | employee.routes.tsx | Employee nested routes */

import { Navigate, Route } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";
import { showPhase2Features, showShiftOpsFeatures } from "../../../shared/launch/launchVisibility";
import {
  LegacyShiftPlanSummaryRedirect,
  LegacyShiftProjectApplyRedirect,
  LegacyShiftProjectRedirect,
} from "../../../features/employee/planner/plannerLegacyRedirects";
import { LaunchModuleBoundary } from "./routerHelpers";
import { EC } from "./routeSegments";
import { HelpSupportPage } from "./adminLazyPages";
import { EmployeeVaultUploadRedirect } from "./employeeVaultUploadRedirect";
import {
  EmployeeAnnounceDetailWrapper,
  EmployeeCareerApplicationsPage,
  EmployeeCareerCompletedRecordsPage,
  EmployeeCareerHomePage,
  EmployeeCareerPostDetailsPage,
  EmployeeCareerSearchPage,
  EmployeeCareerWorkspacePage,
  EmployeeCareerWorkspacesPage,
  EmployeeCompanyWrapper,
  EmployeeDashboardPage,
  EmployeeEarningsPage,
  EmployeeEmploymentDetailPage,
  EmployeeGroupWrapper,
  EmployeeHomePage,
  EmployeeNotificationsPage,
  EmployeePlanApplicationSummaryPage,
  EmployeePlannerApplicationsPage,
  EmployeePlannerBrowsePage,
  EmployeePlannerEarningsPage,
  EmployeePlannerHomePage,
  EmployeePlannerWorkspaceHubPage,
  EmployeePlannerWorkspaceDayPage,
  EmployeePlannerWorkspacesPage,
  EmployeeProfilePage,
  EmployeeProjectDetailPage,
  EmployeeProjectPickApplyPage,
  EmployeeReviewCenterPage,
  EmployeeSettingsPage,
  EmployeeTimesheetWrapper,
  EmployeeVaultAccessLogPage,
  EmployeeVaultEditProfilePage,
  EmployeeVaultFolderPage,
  EmployeeVaultHomePage,
  EmployeeVaultOtpPage,
  EmployeeWorkforceHomePage,
  MyShiftApplicationsPage,
  MyShiftWorkspacesPage,
  ShiftControlCenterPage,
  ShiftOpsAcceptDeclinePage,
  ShiftOpsControlCenterPage,
  ShiftOpsDualVerifyPage,
  ShiftOpsInviteLandingPage,
  ShiftOpsPendingApprovalPage,
  ShiftPostDetailsApplyPage,
  ShiftSearchPage,
  ShiftWorkspacePage,
} from "./employeeLazyPages";

export const employeeRouteTree = (
  <>
    <Route index element={<EmployeeHomePage />} />
    <Route path="home" element={<Navigate to={ROUTE_PATHS.employeeHome} replace />} />
    <Route path={EC.dashboard} element={<EmployeeDashboardPage />} />
    <Route path="career/home" element={<Navigate to={ROUTE_PATHS.employeeCareerHome} replace />} />
    <Route path="vault/home" element={<Navigate to={ROUTE_PATHS.employeeVaultHome} replace />} />
    <Route
      path="vault/documents"
      element={<Navigate to={ROUTE_PATHS.employeeVaultHome} replace />}
    />
    <Route
      path="vault/access-logs"
      element={<Navigate to={ROUTE_PATHS.employeeVaultAccessLog} replace />}
    />
    <Route path={EC.shift} element={<ShiftControlCenterPage />} />
    <Route
      element={
        <LaunchModuleBoundary enabled runtimeKill="career" fallback={ROUTE_PATHS.employeeHome} />
      }
    >
      <Route path={EC.career} element={<EmployeeCareerHomePage />} />
      <Route path={EC.careerSearch} element={<EmployeeCareerSearchPage />} />
      <Route path={EC.careerPostDetails} element={<EmployeeCareerPostDetailsPage />} />
      <Route path={EC.careerApplications} element={<EmployeeCareerApplicationsPage />} />
      <Route path={EC.careerWorkspaces} element={<EmployeeCareerWorkspacesPage />} />
      <Route path={EC.careerWorkspace} element={<EmployeeCareerWorkspacePage />} />
      <Route path={EC.careerCompletedRecords} element={<EmployeeCareerCompletedRecordsPage />} />
    </Route>
    <Route
      element={
        <LaunchModuleBoundary enabled={showPhase2Features} fallback={ROUTE_PATHS.employeeHome} />
      }
    >
      <Route path={EC.workforce} element={<EmployeeWorkforceHomePage />} />
      <Route path={EC.workforceCompany} element={<EmployeeCompanyWrapper />} />
      <Route path={EC.workforceAnnounceDetail} element={<EmployeeAnnounceDetailWrapper />} />
      <Route path={EC.workforceGroup} element={<EmployeeGroupWrapper />} />
      <Route path="workforce/timesheet" element={<EmployeeTimesheetWrapper />} />
    </Route>
    <Route path={EC.shiftSearch} element={<ShiftSearchPage />} />
    <Route
      path={EC.shiftProjects}
      element={<Navigate to={ROUTE_PATHS.employeePlannerBrowse} replace />}
    />
    <Route
      element={
        <LaunchModuleBoundary enabled runtimeKill="planner" fallback={ROUTE_PATHS.employeeHome} />
      }
    >
      <Route path={EC.plannerHome} element={<EmployeePlannerHomePage />} />
      <Route
        path={EC.plannerDiscover}
        element={<Navigate to={ROUTE_PATHS.employeePlannerBrowse} replace />}
      />
      <Route path={EC.plannerBrowse} element={<EmployeePlannerBrowsePage />} />
      <Route path={EC.plannerProjectDetail} element={<EmployeeProjectDetailPage />} />
      <Route path={EC.plannerProjectApply} element={<EmployeeProjectPickApplyPage />} />
      <Route
        path={EC.plannerPlanApplicationSummary}
        element={<EmployeePlanApplicationSummaryPage />}
      />
      <Route path={EC.plannerApplications} element={<EmployeePlannerApplicationsPage />} />
      <Route path={EC.plannerWorkspaces} element={<EmployeePlannerWorkspacesPage />} />
      <Route path={EC.plannerWorkspaceHub} element={<EmployeePlannerWorkspaceHubPage />} />
      <Route path={EC.plannerWorkspace} element={<EmployeePlannerWorkspaceDayPage />} />
      <Route path={EC.plannerEarnings} element={<EmployeePlannerEarningsPage />} />
    </Route>
    <Route
      element={
        <LaunchModuleBoundary enabled runtimeKill="shift" fallback={ROUTE_PATHS.employeeHome} />
      }
    >
      <Route path={EC.shiftProjectDetail} element={<LegacyShiftProjectRedirect />} />
      <Route path={EC.shiftProjectApply} element={<LegacyShiftProjectApplyRedirect />} />
      <Route path={EC.shiftPlanApplicationSummary} element={<LegacyShiftPlanSummaryRedirect />} />
      <Route path={EC.shiftPostDetails} element={<ShiftPostDetailsApplyPage />} />
      <Route path={EC.shiftApplications} element={<MyShiftApplicationsPage />} />
      <Route path={EC.shiftWorkspaces} element={<MyShiftWorkspacesPage />} />
      <Route path={EC.shiftWorkspace} element={<ShiftWorkspacePage />} />
      <Route path={EC.shiftEarnings} element={<EmployeeEarningsPage />} />
    </Route>
    <Route path={EC.vault} element={<EmployeeVaultHomePage />} />
    <Route path={EC.vaultFolder} element={<EmployeeVaultFolderPage />} />
    <Route path={EC.vaultUpload} element={<EmployeeVaultUploadRedirect />} />
    <Route path={EC.vaultEditProfile} element={<EmployeeVaultEditProfilePage />} />
    <Route path={EC.vaultOtp} element={<EmployeeVaultOtpPage />} />
    <Route path={EC.vaultAccessLog} element={<EmployeeVaultAccessLogPage />} />
    <Route path={EC.employmentDetail} element={<EmployeeEmploymentDetailPage />} />
    <Route path={EC.profile} element={<EmployeeProfilePage />} />
    <Route path={EC.notifications} element={<EmployeeNotificationsPage />} />
    <Route path={EC.settings} element={<EmployeeSettingsPage />} />
    <Route path={EC.reviewCenter} element={<EmployeeReviewCenterPage />} />
    <Route path="help" element={<HelpSupportPage />} />
    <Route
      element={
        <LaunchModuleBoundary
          enabled={showShiftOpsFeatures}
          runtimeKill="shift"
          fallback={ROUTE_PATHS.employeeHome}
        />
      }
    >
      {/* Distinct path from /employee/shift so Home + Shift Ops tabs never dual-select. */}
      <Route path={EC.shiftOpsHub} element={<ShiftOpsControlCenterPage />} />
      <Route path={EC.shiftOpsInvite} element={<ShiftOpsInviteLandingPage />} />
      <Route path={EC.shiftOpsVerify} element={<ShiftOpsDualVerifyPage />} />
      <Route path={EC.shiftOpsPending} element={<ShiftOpsPendingApprovalPage />} />
      <Route path={EC.shiftOpsAccept} element={<ShiftOpsAcceptDeclinePage />} />
      <Route
        path={EC.shiftOpsReady}
        element={<Navigate to={ROUTE_PATHS.employeeShiftOpsHub} replace />}
      />
      <Route
        path={EC.shiftOpsGate}
        element={<Navigate to={ROUTE_PATHS.employeeShiftOpsHub} replace />}
      />
    </Route>
  </>
);
