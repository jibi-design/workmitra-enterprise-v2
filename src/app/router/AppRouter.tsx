// src/app/router/AppRouter.tsx
import { lazy, Suspense, useSyncExternalStore } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTE_PATHS } from "./routePaths";
import { ErrorBoundary } from "../../shared/components/ErrorBoundary";
import { RequireRole } from "./guards/RequireRole";
import { roleStorage, type AppRole } from "../storage/roleStorage";

/* ------------------------------------------------ */
/* Eager imports (shells + landing — always needed) */
/* ------------------------------------------------ */
import { LandingRolePickPage } from "../../features/auth/pages/LandingRolePickPage";
import { EmployeeShell } from "../shells/EmployeeShell";
import { EmployerShell } from "../shells/EmployerShell";
import { AdminShell } from "../shells/AdminShell";

/* ------------------------------------------------ */
/* Lazy imports: Employee pages                     */
/* ------------------------------------------------ */
const EmployeeHomePage = lazy(() => import("../../features/employee/home/pages/EmployeeHomePage").then((m) => ({ default: m.EmployeeHomePage })));
const ShiftControlCenterPage = lazy(() => import("../../features/employee/shiftJobs/pages/ShiftControlCenterPage").then((m) => ({ default: m.ShiftControlCenterPage })));
const ShiftSearchPage = lazy(() => import("../../features/employee/shiftJobs/pages/ShiftSearchPage").then((m) => ({ default: m.ShiftSearchPage })));
const ShiftPostDetailsApplyPage = lazy(() => import("../../features/employee/shiftJobs/pages/ShiftPostDetailsApplyPage").then((m) => ({ default: m.ShiftPostDetailsApplyPage })));
const MyShiftApplicationsPage = lazy(() => import("../../features/employee/shiftJobs/pages/MyShiftApplicationsPage").then((m) => ({ default: m.MyShiftApplicationsPage })));
const MyShiftWorkspacesPage = lazy(() => import("../../features/employee/shiftJobs/pages/MyShiftWorkspacesPage").then((m) => ({ default: m.MyShiftWorkspacesPage })));
const ShiftWorkspacePage = lazy(() => import("../../features/employee/shiftJobs/pages/ShiftWorkspacePage").then((m) => ({ default: m.ShiftWorkspacePage })));
const EmployeeEarningsPage = lazy(() => import("../../features/employee/shiftJobs/pages/EmployeeEarningsPage").then((m) => ({ default: m.EmployeeEarningsPage })));
const EmployeeProfilePage = lazy(() => import("../../features/employee/profile/pages/EmployeeProfilePage").then((m) => ({ default: m.EmployeeProfilePage })));
const EmployeeNotificationsPage = lazy(() => import("../../features/employee/notifications/pages/EmployeeNotificationsPage").then((m) => ({ default: m.EmployeeNotificationsPage })));
const EmployeeSettingsPage = lazy(() => import("../../features/employee/settings/pages/EmployeeSettingsPage").then((m) => ({ default: m.EmployeeSettingsPage })));
const EmployeeCareerHomePage = lazy(() => import("../../features/employee/careerJobs/pages/EmployeeCareerHomePage").then((m) => ({ default: m.EmployeeCareerHomePage })));
const EmployeeCareerSearchPage = lazy(() => import("../../features/employee/careerJobs/pages/EmployeeCareerSearchPage").then((m) => ({ default: m.EmployeeCareerSearchPage })));
const EmployeeCareerPostDetailsPage = lazy(() => import("../../features/employee/careerJobs/pages/EmployeeCareerPostDetailsPage").then((m) => ({ default: m.EmployeeCareerPostDetailsPage })));
const EmployeeCareerApplicationsPage = lazy(() => import("../../features/employee/careerJobs/pages/EmployeeCareerApplicationsPage").then((m) => ({ default: m.EmployeeCareerApplicationsPage })));
const EmployeeCareerWorkspacesPage = lazy(() => import("../../features/employee/careerJobs/pages/EmployeeCareerWorkspacesPage").then((m) => ({ default: m.EmployeeCareerWorkspacesPage })));
const EmployeeCareerWorkspacePage = lazy(() => import("../../features/employee/careerJobs/pages/EmployeeCareerWorkspacePage").then((m) => ({ default: m.EmployeeCareerWorkspacePage })));
const EmployeeWorkforceHomePage = lazy(() => import("../../features/employee/workforceOps/pages/EmployeeWorkforceHomePage").then((m) => ({ default: m.EmployeeWorkforceHomePage })));
const EmployeeEmploymentDetailPage = lazy(() => import("../../features/employee/employment/pages/EmployeeEmploymentDetailPage").then((m) => ({ default: m.EmployeeEmploymentDetailPage })));

/* Lazy imports: Employee Work Vault */
const EmployeeVaultHomePage = lazy(() => import("../../features/employee/workVault/pages/EmployeeVaultHomePage").then((m) => ({ default: m.EmployeeVaultHomePage })));
const EmployeeVaultFolderPage = lazy(() => import("../../features/employee/workVault/pages/EmployeeVaultFolderPage").then((m) => ({ default: m.EmployeeVaultFolderPage })));
const EmployeeVaultOtpPage = lazy(() => import("../../features/employee/workVault/pages/EmployeeVaultOtpPage").then((m) => ({ default: m.EmployeeVaultOtpPage })));
const EmployeeVaultAccessLogPage = lazy(() => import("../../features/employee/workVault/pages/EmployeeVaultAccessLogPage").then((m) => ({ default: m.EmployeeVaultAccessLogPage })));
const EmployeeVaultEditProfilePage = lazy(() => import("../../features/employee/workVault/pages/EmployeeVaultEditProfilePage").then((m) => ({ default: m.EmployeeVaultEditProfilePage })));
const HelpSupportPage = lazy(() => import("../../shared/components/HelpSupportPage").then((m) => ({ default: m.HelpSupportPage })));

/* ------------------------------------------------ */
/* Lazy imports: Employer pages                     */
/* ------------------------------------------------ */
const EmployerHomePage = lazy(() => import("../../features/employer/home/pages/EmployerHomePage").then((m) => ({ default: m.EmployerHomePage })));
const EmployerShiftHomePage = lazy(() => import("../../features/employer/shiftJobs/pages/EmployerShiftHomePage").then((m) => ({ default: m.EmployerShiftHomePage })));
const EmployerShiftCreatePage = lazy(() => import("../../features/employer/shiftJobs/pages/EmployerShiftCreatePage").then((m) => ({ default: m.EmployerShiftCreatePage })));
const EmployerShiftPostDashboardPage = lazy(() => import("../../features/employer/shiftJobs/pages/EmployerShiftPostDashboardPage").then((m) => ({ default: m.EmployerShiftPostDashboardPage })));
const EmployerCandidateDetailPage = lazy(() => import("../../features/employer/shiftJobs/pages/EmployerCandidateDetailPage").then((m) => ({ default: m.EmployerCandidateDetailPage })));
const EmployerShiftWorkspacePage = lazy(() => import("../../features/employer/shiftJobs/pages/EmployerShiftWorkspacePage").then((m) => ({ default: m.EmployerShiftWorkspacePage })));
const EmployerShiftWorkspacesPage = lazy(() => import("../../features/employer/shiftJobs/pages/EmployerShiftWorkspacesPage").then((m) => ({ default: m.EmployerShiftWorkspacesPage })));
const EmployerShiftPostsPage = lazy(() => import("../../features/employer/shiftJobs/pages/EmployerShiftPostsPage").then((m) => ({ default: m.EmployerShiftPostsPage })));
const EmployerFavoritesPage = lazy(() => import("../../features/employer/shiftJobs/pages/EmployerFavoritesPage").then((m) => ({ default: m.EmployerFavoritesPage })));
const EmployerShiftTemplatesPage = lazy(() => import("../../features/employer/shiftJobs/pages/EmployerShiftTemplatesPage").then((m) => ({ default: m.EmployerShiftTemplatesPage })));
const EmployerDemandPlannerPage = lazy(() => import("../../features/employer/shiftJobs/pages/EmployerDemandPlannerPage").then((m) => ({ default: m.EmployerDemandPlannerPage })));
const EmployerCareerHomePage = lazy(() => import("../../features/employer/careerJobs/pages/EmployerCareerHomePage").then((m) => ({ default: m.EmployerCareerHomePage })));
const EmployerCareerCreatePage = lazy(() => import("../../features/employer/careerJobs/pages/EmployerCareerCreatePage").then((m) => ({ default: m.EmployerCareerCreatePage })));
const EmployerCareerPostDashboardPage = lazy(() => import("../../features/employer/careerJobs/pages/EmployerCareerPostDashboardPage").then((m) => ({ default: m.EmployerCareerPostDashboardPage })));
const EmployerWorkforceHomePage = lazy(() => import("../../features/employer/workforceOps/pages/EmployerWorkforceHomePage").then((m) => ({ default: m.EmployerWorkforceHomePage })));
const EmployerWorkforceStaffPage = lazy(() => import("../../features/employer/workforceOps/pages/EmployerWorkforceStaffPage").then((m) => ({ default: m.EmployerWorkforceStaffPage })));

const EmployerAnnouncementsListWrapper = lazy(() => import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({ default: m.EmployerAnnouncementsListWrapper })));
const EmployerAnnounceCreateWrapper = lazy(() => import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({ default: m.EmployerAnnounceCreateWrapper })));
const EmployerAnnounceDashWrapper = lazy(() => import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({ default: m.EmployerAnnounceDashWrapper })));
const EmployerGroupsWrapper = lazy(() => import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({ default: m.EmployerGroupsWrapper })));
const EmployerGroupDetailWrapper = lazy(() => import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({ default: m.EmployerGroupDetailWrapper })));
const EmployerStaffDetailWrapper = lazy(() => import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({ default: m.EmployerStaffDetailWrapper })));
const EmployeeCompanyWrapper = lazy(() => import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({ default: m.EmployeeCompanyWrapper })));
const EmployeeAnnounceDetailWrapper = lazy(() => import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({ default: m.EmployeeAnnounceDetailWrapper })));
const EmployeeGroupWrapper = lazy(() => import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({ default: m.EmployeeGroupWrapper })));
const EmployeeTimesheetWrapper = lazy(() => import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({ default: m.EmployeeTimesheetWrapper })));
const EmployerSettingsPage = lazy(() => import("../../features/employer/company/pages/EmployerSettingsPage").then((m) => ({ default: m.EmployerSettingsPage })));
const EmployerNotificationsPage = lazy(() => import("../../features/employer/notifications/pages/EmployerNotificationsPage").then((m) => ({ default: m.EmployerNotificationsPage })));
const EmployerMyStaffPage = lazy(() => import("../../features/employer/myStaff/pages/EmployerMyStaffPage").then((m) => ({ default: m.EmployerMyStaffPage })));
const EmployerStaffDetailPage = lazy(() => import("../../features/employer/myStaff/pages/EmployerStaffDetailPage").then((m) => ({ default: m.EmployerStaffDetailPage })));
const HRManagementPage = lazy(() => import("../../features/employer/hrManagement/pages/HRManagementPage").then((m) => ({ default: m.HRManagementPage })));
const HRCandidateDetailPage = lazy(() => import("../../features/employer/hrManagement/pages/HRCandidateDetailPage").then((m) => ({ default: m.HRCandidateDetailPage })));
const BulkAttendancePage = lazy(() => import("../../features/employer/hrManagement/pages/BulkAttendancePage").then((m) => ({ default: m.BulkAttendancePage })));
const BulkTaskAssignPage = lazy(() => import("../../features/employer/hrManagement/pages/BulkTaskAssignPage").then((m) => ({ default: m.BulkTaskAssignPage })));
const BulkNotificationsPage = lazy(() => import("../../features/employer/hrManagement/pages/BulkNotificationsPage").then((m) => ({ default: m.BulkNotificationsPage })));
const StaffAvailabilityPage = lazy(() => import("../../features/employer/hrManagement/pages/StaffAvailabilityPage").then((m) => ({ default: m.StaffAvailabilityPage })));
const RosterPlannerPage = lazy(() => import("../../features/employer/hrManagement/pages/RosterPlannerPage").then((m) => ({ default: m.RosterPlannerPage })));

/* Lazy imports: Manager Console */
const ManagerConsolePage = lazy(() => import("../../features/employer/managerConsole/pages/ManagerConsolePage").then((m) => ({ default: m.ManagerConsolePage })));
const CommandCenterPage = lazy(() => import("../../features/employer/managerConsole/pages/CommandCenterPage").then((m) => ({ default: m.CommandCenterPage })));
const ConsoleIncidentReportsPage = lazy(() => import("../../features/employer/managerConsole/pages/ConsoleIncidentReportsPage").then((m) => ({ default: m.ConsoleIncidentReportsPage })));

/* Lazy imports: Employer Work Vault */
const EmployerVaultLookupPage = lazy(() => import("../../features/employer/workVault/pages/EmployerVaultLookupPage").then((m) => ({ default: m.EmployerVaultLookupPage })));
const EmployerVaultViewPage = lazy(() => import("../../features/employer/workVault/pages/EmployerVaultViewPage").then((m) => ({ default: m.EmployerVaultViewPage })));

/* ------------------------------------------------ */
/* Lazy imports: Admin pages (all 6 complete)       */
/* ------------------------------------------------ */
const AdminHomePage = lazy(() => import("../../features/admin/home/pages/AdminHomePage").then((m) => ({ default: m.AdminHomePage })));
const AdminAlertsPage = lazy(() => import("../../features/admin/oversight/pages/AdminAlertsPage").then((m) => ({ default: m.AdminAlertsPage })));
const AdminUsersPage = lazy(() => import("../../features/admin/oversight/pages/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage })));
const AdminNotificationsPage = lazy(() => import("../../features/admin/oversight/pages/AdminNotificationsPage").then((m) => ({ default: m.AdminNotificationsPage })));
const AdminAnalyticsPage = lazy(() => import("../../features/admin/oversight/pages/AdminAnalyticsPage").then((m) => ({ default: m.AdminAnalyticsPage })));
const AdminSettingsPage = lazy(() => import("../../features/admin/oversight/pages/AdminSettingsPage").then((m) => ({ default: m.AdminSettingsPage })));

/* ------------------------------------------------ */
/* Not Found                                        */
/* ------------------------------------------------ */
const NotFoundPage = lazy(() => import("./NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

/* ------------------------------------------------ */
/* Loading fallback                                 */
/* ------------------------------------------------ */
function PageLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px", minHeight: 200 }}>
      <div style={{ width: 32, height: 32, borderRadius: 999, border: "3px solid var(--wm-brand-600, #1d4ed8)", borderTopColor: "transparent", animation: "wm-spin 0.6s linear infinite" }} />
    </div>
  );
}

/* ------------------------------------------------ */
/* Child route constants                            */
/* ------------------------------------------------ */
const EC = { shift: "shift", career: "career", workforce: "workforce", employmentDetail: "employment/:employmentId", profile: "profile", notifications: "notifications", settings: "settings", shiftSearch: "shift/search", shiftPostDetails: "shift/post/:postId", shiftApplications: "shift/applications", shiftWorkspaces: "shift/workspaces", shiftWorkspace: "shift/workspace/:workspaceId", shiftEarnings: "shift/earnings", shiftPosts: "shift/posts", careerSearch: "career/search", careerPostDetails: "career/post/:postId", careerApplications: "career/applications", careerWorkspaces: "career/workspaces", careerWorkspace: "career/workspace/:workspaceId", workforceCompany: "workforce/company", workforceAnnounceDetail: "workforce/announce/:announcementId", workforceGroup: "workforce/group/:groupId", vault: "vault", vaultFolder: "vault/folder/:folderId", vaultUpload: "vault/folder/:folderId/upload", vaultOtp: "vault/otp", vaultAccessLog: "vault/access-log", vaultEditProfile: "vault/edit-profile" } as const;
const ER = { shift: "shift", career: "career", workforce: "workforce", settings: "settings", notifications: "notifications", careerCreate: "career/create", careerPostDashboard: "career/post/:postId", shiftCreate: "shift/create", shiftPostDashboard: "shift/post/:postId", shiftShortlist: "shift/post/:postId/shortlist", candidateDetail: "shift/post/:postId/candidate/:appId", shiftWorkspaces: "shift/workspaces", shiftWorkspace: "shift/workspace/:workspaceId", shiftPosts: "shift/posts",shiftFavorites: "shift/favorites", shiftTemplates: "shift/templates", shiftDemandPlanner: "shift/demand-planner", workforceStaff: "workforce/staff", workforceStaffDetail: "workforce/staff/:staffId", workforceAnnouncements: "workforce/announcements", workforceAnnounceCreate: "workforce/announce/create", workforceAnnounce: "workforce/announce", workforceAnnounceDash: "workforce/announce/:announcementId", workforceGroups: "workforce/groups", workforceGroup: "workforce/group/:groupId", vault: "vault", vaultView: "vault/view/:employeeId", myStaff: "my-staff", myStaffDetail: "my-staff/:staffId", hrManagement: "hr", hrCandidateDetail: "hr/candidate/:hrCandidateId", console: "console", consoleCommandCenter: "console/command-center", consoleAttendance: "console/attendance", consoleTaskAssign: "console/bulk-task", consoleNotices: "console/notices", consoleAvailability: "console/availability", consoleRoster: "console/roster", consoleIncidents: "console/incidents" } as const;

const AC = { alerts: "alerts", users: "users", analytics: "analytics", notifications: "notifications", settings: "settings" } as const;

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function getHomeForRole(role: AppRole): string { if (role === "employee") return ROUTE_PATHS.employeeHome; if (role === "employer") return ROUTE_PATHS.employerHome; return ROUTE_PATHS.adminHome; }
function useRole(): AppRole | null { return useSyncExternalStore(roleStorage.subscribe, roleStorage.get, roleStorage.get); }
function RoleHomeRedirect() { const role = useRole(); if (!role) return <Navigate to={ROUTE_PATHS.landing} replace />; return <Navigate to={getHomeForRole(role)} replace />; }

/* ------------------------------------------------ */
/* Router                                           */
/* ------------------------------------------------ */
export function AppRouter() {
  return (
    <HashRouter>
      <div className="wm-app">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path={ROUTE_PATHS.landing} element={<LandingRolePickPage />} />

            {/* ── Employee ── */}
            <Route path={ROUTE_PATHS.employeeHome} element={<RequireRole role="employee"><ErrorBoundary homePath={ROUTE_PATHS.employeeHome}><EmployeeShell /></ErrorBoundary></RequireRole>}>
              <Route index element={<EmployeeHomePage />} />
              <Route path={EC.shift} element={<ShiftControlCenterPage />} />
              <Route path={EC.career} element={<EmployeeCareerHomePage />} />
              <Route path={EC.careerSearch} element={<EmployeeCareerSearchPage />} />
              <Route path={EC.careerPostDetails} element={<EmployeeCareerPostDetailsPage />} />
              <Route path={EC.careerApplications} element={<EmployeeCareerApplicationsPage />} />
              <Route path={EC.careerWorkspaces} element={<EmployeeCareerWorkspacesPage />} />
              <Route path={EC.careerWorkspace} element={<EmployeeCareerWorkspacePage />} />
              <Route path={EC.workforce} element={<EmployeeWorkforceHomePage />} />
              <Route path={EC.workforceCompany} element={<EmployeeCompanyWrapper />} />
              <Route path={EC.workforceAnnounceDetail} element={<EmployeeAnnounceDetailWrapper />} />
              <Route path={EC.workforceGroup} element={<EmployeeGroupWrapper />} />
              <Route path="workforce/timesheet" element={<EmployeeTimesheetWrapper />} />
              <Route path={EC.shiftSearch} element={<ShiftSearchPage />} />
              <Route path={EC.shiftPostDetails} element={<ShiftPostDetailsApplyPage />} />
              <Route path={EC.shiftApplications} element={<MyShiftApplicationsPage />} />
              <Route path={EC.shiftWorkspaces} element={<MyShiftWorkspacesPage />} />
             <Route path={EC.shiftWorkspace} element={<ShiftWorkspacePage />} />
              <Route path={EC.shiftEarnings} element={<EmployeeEarningsPage />} />
              <Route path={EC.vault} element={<EmployeeVaultHomePage />} />
              <Route path={EC.vaultFolder} element={<EmployeeVaultFolderPage />} />
              <Route path={EC.vaultOtp} element={<EmployeeVaultOtpPage />} />
              <Route path={EC.vaultAccessLog} element={<EmployeeVaultAccessLogPage />} />
              <Route path={EC.vaultEditProfile} element={<EmployeeVaultEditProfilePage />} />
              <Route path={EC.employmentDetail} element={<EmployeeEmploymentDetailPage />} />
              <Route path={EC.profile} element={<EmployeeProfilePage />} />
              <Route path={EC.notifications} element={<EmployeeNotificationsPage />} />
              <Route path={EC.settings} element={<EmployeeSettingsPage />} />
              <Route path="help" element={<HelpSupportPage />} />
            </Route>

            {/* ── Employer ── */}
            <Route path={ROUTE_PATHS.employerHome} element={<RequireRole role="employer"><ErrorBoundary homePath={ROUTE_PATHS.employerHome}><EmployerShell /></ErrorBoundary></RequireRole>}>
              <Route index element={<EmployerHomePage />} />
              <Route path={ER.shift} element={<EmployerShiftHomePage />} />
              <Route path={ER.career} element={<EmployerCareerHomePage />} />
              <Route path={ER.careerCreate} element={<EmployerCareerCreatePage />} />
              <Route path={ER.careerPostDashboard} element={<EmployerCareerPostDashboardPage />} />
              <Route path={ER.workforce} element={<EmployerWorkforceHomePage />} />
              <Route path={ER.workforceStaff} element={<EmployerWorkforceStaffPage />} />
              <Route path={ER.workforceStaffDetail} element={<EmployerStaffDetailWrapper />} />
              <Route path={ER.workforceAnnouncements} element={<EmployerAnnouncementsListWrapper />} />
              <Route path={ER.workforceAnnounceCreate} element={<EmployerAnnounceCreateWrapper />} />
              <Route path={ER.workforceAnnounce} element={<EmployerAnnounceCreateWrapper />} />
              <Route path={ER.workforceAnnounceDash} element={<EmployerAnnounceDashWrapper />} />
              <Route path={ER.workforceGroups} element={<EmployerGroupsWrapper />} />
              <Route path={ER.workforceGroup} element={<EmployerGroupDetailWrapper />} />
              <Route path={ER.vault} element={<EmployerVaultLookupPage />} />
              <Route path={ER.vaultView} element={<EmployerVaultViewPage />} />
              <Route path={ER.settings} element={<EmployerSettingsPage />} />
              <Route path={ER.notifications} element={<EmployerNotificationsPage />} />
              <Route path={ER.myStaff} element={<EmployerMyStaffPage />} />
              <Route path={ER.myStaffDetail} element={<EmployerStaffDetailPage />} />
              <Route path={ER.hrManagement} element={<HRManagementPage />} />
              <Route path={ER.hrCandidateDetail} element={<HRCandidateDetailPage />} />
              <Route path={ER.console} element={<ManagerConsolePage />} />
              <Route path={ER.consoleCommandCenter} element={<CommandCenterPage />} />
              <Route path={ER.consoleAttendance} element={<BulkAttendancePage />} />
              <Route path={ER.consoleTaskAssign} element={<BulkTaskAssignPage />} />
              <Route path={ER.consoleNotices} element={<BulkNotificationsPage />} />
              <Route path={ER.consoleAvailability} element={<StaffAvailabilityPage />} />
              <Route path={ER.consoleRoster} element={<RosterPlannerPage />} />
              <Route path={ER.consoleIncidents} element={<ConsoleIncidentReportsPage />} />
                           <Route path={ER.shiftPosts} element={<EmployerShiftPostsPage />} />
               <Route path={ER.shiftFavorites} element={<EmployerFavoritesPage />} />
             <Route path={ER.shiftTemplates} element={<EmployerShiftTemplatesPage />} />
              <Route path={ER.shiftDemandPlanner} element={<EmployerDemandPlannerPage />} />
              <Route path={ER.shiftCreate} element={<EmployerShiftCreatePage />} />
              <Route path={ER.shiftPostDashboard} element={<EmployerShiftPostDashboardPage />} />
              <Route path={ER.shiftWorkspaces} element={<EmployerShiftWorkspacesPage />} />
              <Route path={ER.shiftShortlist} element={<EmployerShiftPostDashboardPage />} />
              <Route path={ER.candidateDetail} element={<EmployerCandidateDetailPage />} />
              <Route path={ER.shiftWorkspace} element={<EmployerShiftWorkspacePage />} />
              <Route path="help" element={<HelpSupportPage />} />
            </Route>

            {/* ── Admin (all 6 pages complete) ── */}
            <Route path={ROUTE_PATHS.adminHome} element={<RequireRole role="admin"><ErrorBoundary homePath={ROUTE_PATHS.adminHome}><AdminShell /></ErrorBoundary></RequireRole>}>
              <Route index element={<AdminHomePage />} />
              <Route path={AC.alerts} element={<AdminAlertsPage />} />
              <Route path={AC.users} element={<AdminUsersPage />} />
              <Route path={AC.notifications} element={<AdminNotificationsPage />} />
              <Route path={AC.analytics} element={<AdminAnalyticsPage />} />
              <Route path={AC.settings} element={<AdminSettingsPage />} />
            </Route>

            <Route path="/_go" element={<RoleHomeRedirect />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </HashRouter>
  );
}