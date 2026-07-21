/** Job Mitra | employer.routes.tsx | Employer nested routes */

import { Navigate, Route } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";
import { showPhase2Features } from "../../../shared/launch/launchVisibility";
import { LaunchModuleBoundary } from "./routerHelpers";
import { ER } from "./routeSegments";
import { HelpSupportPage } from "./adminLazyPages";
import {
  BulkAttendancePage,
  BulkNotificationsPage,
  BulkTaskAssignPage,
  CommandCenterPage,
  ConsoleIncidentReportsPage,
  EmployerAnalyticsPage,
  EmployerAnnounceCreateWrapper,
  EmployerAnnounceDashWrapper,
  EmployerAnnouncementsListWrapper,
  EmployerCandidateDetailPage,
  EmployerCandidateDocumentAccessPage,
  EmployerCareerCandidateDetailPage,
  EmployerCareerCandidateWorkVaultReviewPage,
  EmployerCareerCompletedRecordsPage,
  EmployerCareerCreatePage,
  EmployerCareerHomePage,
  EmployerCareerPostDashboardPage,
  EmployerCareerPostsPage,
  EmployerDemandPlannerPage,
  EmployerFavoritesPage,
  EmployerGroupDetailWrapper,
  EmployerGroupsWrapper,
  EmployerHomePage,
  EmployerMyStaffPage,
  EmployerNotificationsPage,
  EmployerPlannerDetailPage,
  EmployerPlannerFinancePlaceholderPage,
  EmployerPlannerHomePage,
  EmployerPlannerPlansListPage,
  EmployerPlannerApplicationsPage,
  EmployerPlannerRosterPage,
  EmployerPlannerRosterDetailPage,
  EmployerProfilePage,
  EmployerReviewCenterPage,
  EmployerSettingsPage,
  EmployerShiftCreatePage,
  EmployerShiftHomePage,
  EmployerShiftPostDashboardPage,
  EmployerShiftPostsPage,
  EmployerShiftTemplatesPage,
  EmployerShiftWorkspacePage,
  EmployerShiftWorkspacesPage,
  EmployerStaffDetailPage,
  EmployerStaffDetailWrapper,
  EmployerVaultLookupPage,
  EmployerVaultViewPage,
  EmployerWorkforceHomePage,
  EmployerWorkforceStaffPage,
  HRCandidateDetailPage,
  HRManagementPage,
  ManagerConsolePage,
  RosterPlannerPage,
  StaffAvailabilityPage,
} from "./employerLazyPages";

export const employerRouteTree = (
  <>
    <Route index element={<EmployerHomePage />} />
    <Route path={ER.shift} element={<EmployerShiftHomePage />} />
    <Route path={ER.career} element={<EmployerCareerHomePage />} />
    <Route path={ER.careerPosts} element={<EmployerCareerPostsPage />} />
    <Route path={ER.careerCompletedRecords} element={<EmployerCareerCompletedRecordsPage />} />
    <Route path={ER.careerCreate} element={<EmployerCareerCreatePage />} />
    <Route path={ER.careerPostDashboard} element={<EmployerCareerPostDashboardPage />} />
    <Route path={ER.careerCandidateDetail} element={<EmployerCareerCandidateDetailPage />} />
    <Route
      path={ER.careerCandidateWorkVaultReview}
      element={<EmployerCareerCandidateWorkVaultReviewPage />}
    />
    <Route
      element={
        <LaunchModuleBoundary enabled={showPhase2Features} fallback={ROUTE_PATHS.employerHome} />
      }
    >
      <Route path={ER.workforce} element={<EmployerWorkforceHomePage />} />
      <Route path={ER.workforceStaff} element={<EmployerWorkforceStaffPage />} />
      <Route path={ER.workforceStaffDetail} element={<EmployerStaffDetailWrapper />} />
      <Route path={ER.workforceAnnouncements} element={<EmployerAnnouncementsListWrapper />} />
      <Route path={ER.workforceAnnounceCreate} element={<EmployerAnnounceCreateWrapper />} />
      <Route path={ER.workforceAnnounce} element={<EmployerAnnounceCreateWrapper />} />
      <Route path={ER.workforceAnnounceDash} element={<EmployerAnnounceDashWrapper />} />
      <Route path={ER.workforceGroups} element={<EmployerGroupsWrapper />} />
      <Route path={ER.workforceGroup} element={<EmployerGroupDetailWrapper />} />
    </Route>
    <Route path={ER.vault} element={<EmployerVaultLookupPage />} />
    <Route path={ER.vaultView} element={<EmployerVaultViewPage />} />
    <Route path={ER.profile} element={<EmployerProfilePage />} />
    <Route path={ER.settings} element={<EmployerSettingsPage />} />
    <Route path={ER.notifications} element={<EmployerNotificationsPage />} />
    <Route path={ER.myStaff} element={<EmployerMyStaffPage />} />
    <Route path={ER.reviewCenter} element={<EmployerReviewCenterPage />} />
    <Route path={ER.myStaffDetail} element={<EmployerStaffDetailPage />} />
    <Route path={ER.analytics} element={<EmployerAnalyticsPage />} />
    <Route
      element={
        <LaunchModuleBoundary enabled={showPhase2Features} fallback={ROUTE_PATHS.employerHome} />
      }
    >
      <Route path={ER.hrManagement} element={<HRManagementPage />} />
      <Route path={ER.hrCandidateDetail} element={<HRCandidateDetailPage />} />
    </Route>
    <Route
      element={
        <LaunchModuleBoundary enabled={showPhase2Features} fallback={ROUTE_PATHS.employerHome} />
      }
    >
      <Route path={ER.console} element={<ManagerConsolePage />} />
      <Route path={ER.consoleCommandCenter} element={<CommandCenterPage />} />
      <Route path={ER.consoleAttendance} element={<BulkAttendancePage />} />
      <Route path={ER.consoleTaskAssign} element={<BulkTaskAssignPage />} />
      <Route path={ER.consoleNotices} element={<BulkNotificationsPage />} />
      <Route path={ER.consoleAvailability} element={<StaffAvailabilityPage />} />
      <Route path={ER.consoleRoster} element={<RosterPlannerPage />} />
      <Route path={ER.consoleIncidents} element={<ConsoleIncidentReportsPage />} />
    </Route>
    <Route path={ER.shiftPosts} element={<EmployerShiftPostsPage />} />
    <Route path={ER.shiftFavorites} element={<EmployerFavoritesPage />} />
    <Route path={ER.shiftTemplates} element={<EmployerShiftTemplatesPage />} />
    <Route
      path={ER.shiftDemandPlanner}
      element={<Navigate to={ROUTE_PATHS.employerPlannerHome} replace />}
    />
    <Route path={ER.plannerHome} element={<EmployerPlannerHomePage />} />
    <Route path={ER.plannerPlans} element={<EmployerPlannerPlansListPage />} />
    <Route
      path={ER.plannerCreate}
      element={<Navigate to={ROUTE_PATHS.employerPlannerNew} replace />}
    />
    <Route path={ER.plannerNew} element={<EmployerDemandPlannerPage />} />
    <Route path={ER.plannerDetail} element={<EmployerPlannerDetailPage />} />
    <Route path={ER.plannerFinance} element={<EmployerPlannerFinancePlaceholderPage />} />
    <Route path={ER.plannerApplications} element={<EmployerPlannerApplicationsPage />} />
    <Route path={ER.plannerRoster} element={<EmployerPlannerRosterPage />} />
    <Route path={ER.plannerRosterDetail} element={<EmployerPlannerRosterDetailPage />} />
    <Route path={ER.shiftCreate} element={<EmployerShiftCreatePage />} />
    <Route path={ER.shiftPostDashboard} element={<EmployerShiftPostDashboardPage />} />
    <Route path={ER.shiftWorkspaces} element={<EmployerShiftWorkspacesPage />} />
    <Route path={ER.shiftShortlist} element={<EmployerShiftPostDashboardPage />} />
    <Route path={ER.shiftCandidateDetail} element={<EmployerCandidateDetailPage />} />
    <Route path={ER.candidateDocumentAccess} element={<EmployerCandidateDocumentAccessPage />} />
    <Route path={ER.shiftWorkspace} element={<EmployerShiftWorkspacePage />} />
    <Route path="help" element={<HelpSupportPage />} />
  </>
);
