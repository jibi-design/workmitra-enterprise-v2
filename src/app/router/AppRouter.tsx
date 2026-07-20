// Job Mitra | AppRouter.tsx | C:\projects\WorkMitra_Enterprise_v2\src\app\router\AppRouter.tsx

import { Suspense, useSyncExternalStore } from "react";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ROUTE_PATHS } from "./routePaths";
import { lazyPage } from "./lazyPage";
import { ErrorBoundary } from "../../shared/components/ErrorBoundary";
import { RequireRole } from "./guards/RequireRole";
import { roleStorage, type AppRole } from "../storage/roleStorage";
import { showPhase2Features } from "../../shared/launch/launchVisibility";
import { PulseTrailProvider } from "../../features/pulse/PulseTrailProvider";
import { LandingRolePickPage } from "../../features/auth/pages/LandingRolePickPage";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { AUTH_BACKEND_ENABLED } from "../../shared/config/authConfig";
import { EmployeeShell } from "../shells/EmployeeShell";
import { EmployerShell } from "../shells/EmployerShell";
import { AdminShell } from "../shells/AdminShell";

const IS_DEV_ADMIN_ENABLED = import.meta.env.DEV;

const EmployeeHomePage = lazyPage(() =>
  import("../../features/employee/home/pages/EmployeeHomePage").then((m) => ({
    default: m.EmployeeHomePage,
  })),
);
const EmployeePlannerHomePage = lazyPage(() =>
  import("../../features/employee/planner/pages/EmployeePlannerHomePage").then((m) => ({
    default: m.EmployeePlannerHomePage,
  })),
);
const EmployeePlannerBrowsePage = lazyPage(() =>
  import("../../features/employee/planner/pages/EmployeePlannerBrowsePage").then((m) => ({
    default: m.EmployeePlannerBrowsePage,
  })),
);
const EmployeePlannerApplicationsPage = lazyPage(() =>
  import("../../features/employee/planner/pages/EmployeePlannerApplicationsPage").then((m) => ({
    default: m.EmployeePlannerApplicationsPage,
  })),
);
const EmployeePlannerWorkspacesPage = lazyPage(() =>
  import("../../features/employee/planner/pages/EmployeePlannerWorkspacesPage").then((m) => ({
    default: m.EmployeePlannerWorkspacesPage,
  })),
);
const EmployeePlannerEarningsPage = lazyPage(() =>
  import("../../features/employee/planner/pages/EmployeePlannerEarningsPage").then((m) => ({
    default: m.EmployeePlannerEarningsPage,
  })),
);
const ShiftControlCenterPage = lazyPage(() =>
  import("../../features/employee/shiftJobs/pages/ShiftControlCenterPage").then((m) => ({
    default: m.ShiftControlCenterPage,
  })),
);
const ShiftSearchPage = lazyPage(() =>
  import("../../features/employee/shiftJobs/pages/ShiftSearchPage").then((m) => ({
    default: m.ShiftSearchPage,
  })),
);
const EmployeeProjectDetailPage = lazyPage(() =>
  import("../../features/employee/planner/pages/EmployeeProjectDetailPage").then((m) => ({
    default: m.EmployeeProjectDetailPage,
  })),
);
const EmployeeProjectPickApplyPage = lazyPage(() =>
  import("../../features/employee/planner/pages/EmployeeProjectPickApplyPage").then((m) => ({
    default: m.EmployeeProjectPickApplyPage,
  })),
);
const EmployeePlanApplicationSummaryPage = lazyPage(() =>
  import("../../features/employee/planner/pages/EmployeePlanApplicationSummaryPage").then((m) => ({
    default: m.EmployeePlanApplicationSummaryPage,
  })),
);
const ShiftPostDetailsApplyPage = lazyPage(() =>
  import("../../features/employee/shiftJobs/pages/ShiftPostDetailsApplyPage").then((m) => ({
    default: m.ShiftPostDetailsApplyPage,
  })),
);
const MyShiftApplicationsPage = lazyPage(() =>
  import("../../features/employee/shiftJobs/pages/MyShiftApplicationsPage").then((m) => ({
    default: m.MyShiftApplicationsPage,
  })),
);
const MyShiftWorkspacesPage = lazyPage(() =>
  import("../../features/employee/shiftJobs/pages/MyShiftWorkspacesPage").then((m) => ({
    default: m.MyShiftWorkspacesPage,
  })),
);
const ShiftWorkspacePage = lazyPage(() =>
  import("../../features/employee/shiftJobs/pages/ShiftWorkspacePage").then((m) => ({
    default: m.ShiftWorkspacePage,
  })),
);
const EmployeeEarningsPage = lazyPage(() =>
  import("../../features/employee/shiftJobs/pages/EmployeeEarningsPage").then((m) => ({
    default: m.EmployeeEarningsPage,
  })),
);
const EmployeeProfilePage = lazyPage(() =>
  import("../../features/employee/profile/pages/EmployeeProfilePage").then((m) => ({
    default: m.EmployeeProfilePage,
  })),
);
const EmployeeNotificationsPage = lazyPage(() =>
  import("../../features/employee/notifications/pages/EmployeeNotificationsPage").then((m) => ({
    default: m.EmployeeNotificationsPage,
  })),
);
const EmployeeSettingsPage = lazyPage(() =>
  import("../../features/employee/settings/pages/EmployeeSettingsPage").then((m) => ({
    default: m.EmployeeSettingsPage,
  })),
);
const EmployeeCareerHomePage = lazyPage(() =>
  import("../../features/employee/careerJobs/pages/EmployeeCareerHomePage").then((m) => ({
    default: m.EmployeeCareerHomePage,
  })),
);
const EmployeeCareerSearchPage = lazyPage(() =>
  import("../../features/employee/careerJobs/pages/EmployeeCareerSearchPage").then((m) => ({
    default: m.EmployeeCareerSearchPage,
  })),
);
const EmployeeCareerPostDetailsPage = lazyPage(() =>
  import("../../features/employee/careerJobs/pages/EmployeeCareerPostDetailsPage").then((m) => ({
    default: m.EmployeeCareerPostDetailsPage,
  })),
);
const EmployeeCareerApplicationsPage = lazyPage(() =>
  import("../../features/employee/careerJobs/pages/EmployeeCareerApplicationsPage").then((m) => ({
    default: m.EmployeeCareerApplicationsPage,
  })),
);
const EmployeeCareerWorkspacesPage = lazyPage(() =>
  import("../../features/employee/careerJobs/pages/EmployeeCareerWorkspacesPage").then((m) => ({
    default: m.EmployeeCareerWorkspacesPage,
  })),
);
const EmployeeCareerWorkspacePage = lazyPage(() =>
  import("../../features/employee/careerJobs/pages/EmployeeCareerWorkspacePage").then((m) => ({
    default: m.EmployeeCareerWorkspacePage,
  })),
);
const EmployeeCareerCompletedRecordsPage = lazyPage(() =>
  import("../../features/employee/careerJobs/pages/EmployeeCareerCompletedRecordsPage").then(
    (m) => ({ default: m.EmployeeCareerCompletedRecordsPage }),
  ),
);
const EmployeeWorkforceHomePage = lazyPage(() =>
  import("../../features/employee/workforceOps/pages/EmployeeWorkforceHomePage").then((m) => ({
    default: m.EmployeeWorkforceHomePage,
  })),
);

const EmployeeEmploymentDetailPage = lazyPage(() =>
  import("../../features/employee/employment/pages/EmployeeEmploymentDetailPage").then((m) => ({
    default: m.EmployeeEmploymentDetailPage,
  })),
);
const EmployeeReviewCenterPage = lazyPage(() =>
  import("../../features/shared/reviewCenter/pages/EmployeeReviewCenterPage").then((m) => ({
    default: m.EmployeeReviewCenterPage,
  })),
);

const EmployeeVaultHomePage = lazyPage(() =>
  import("../../features/employee/workVault/pages/EmployeeVaultHomePage").then((m) => ({
    default: m.EmployeeVaultHomePage,
  })),
);
const EmployeeVaultFolderPage = lazyPage(() =>
  import("../../features/employee/workVault/pages/EmployeeVaultFolderPage").then((m) => ({
    default: m.EmployeeVaultFolderPage,
  })),
);
const EmployeeVaultOtpPage = lazyPage(() =>
  import("../../features/employee/workVault/pages/EmployeeVaultOtpPage").then((m) => ({
    default: m.EmployeeVaultOtpPage,
  })),
);
const EmployeeVaultAccessLogPage = lazyPage(() =>
  import("../../features/employee/workVault/pages/EmployeeVaultAccessLogPage").then((m) => ({
    default: m.EmployeeVaultAccessLogPage,
  })),
);
const HelpSupportPage = lazyPage(() =>
  import("../../shared/components/HelpSupportPage").then((m) => ({ default: m.HelpSupportPage })),
);

const EmployerHomePage = lazyPage(() =>
  import("../../features/employer/home/pages/EmployerHomePage").then((m) => ({
    default: m.EmployerHomePage,
  })),
);
const EmployerShiftHomePage = lazyPage(() =>
  import("../../features/employer/shiftJobs/pages/EmployerShiftHomePage").then((m) => ({
    default: m.EmployerShiftHomePage,
  })),
);
const EmployerShiftCreatePage = lazyPage(() =>
  import("../../features/employer/shiftJobs/pages/EmployerShiftCreatePage").then((m) => ({
    default: m.EmployerShiftCreatePage,
  })),
);
const EmployerShiftPostDashboardPage = lazyPage(() =>
  import("../../features/employer/shiftJobs/pages/EmployerShiftPostDashboardPage").then((m) => ({
    default: m.EmployerShiftPostDashboardPage,
  })),
);
const EmployerCandidateDetailPage = lazyPage(() =>
  import("../../features/employer/shiftJobs/pages/EmployerCandidateDetailPage").then((m) => ({
    default: m.EmployerCandidateDetailPage,
  })),
);
const EmployerCandidateDocumentAccessPage = lazyPage(() =>
  import("../../features/employer/shiftJobs/pages/EmployerCandidateDocumentAccessPage").then(
    (m) => ({ default: m.EmployerCandidateDocumentAccessPage }),
  ),
);
const EmployerShiftWorkspacePage = lazyPage(() =>
  import("../../features/employer/shiftJobs/pages/EmployerShiftWorkspacePage").then((m) => ({
    default: m.EmployerShiftWorkspacePage,
  })),
);
const EmployerShiftWorkspacesPage = lazyPage(() =>
  import("../../features/employer/shiftJobs/pages/EmployerShiftWorkspacesPage").then((m) => ({
    default: m.EmployerShiftWorkspacesPage,
  })),
);
const EmployerShiftPostsPage = lazyPage(() =>
  import("../../features/employer/shiftJobs/pages/EmployerShiftPostsPage").then((m) => ({
    default: m.EmployerShiftPostsPage,
  })),
);
const EmployerFavoritesPage = lazyPage(() =>
  import("../../features/employer/shiftJobs/pages/EmployerFavoritesPage").then((m) => ({
    default: m.EmployerFavoritesPage,
  })),
);
const EmployerShiftTemplatesPage = lazyPage(() =>
  import("../../features/employer/shiftJobs/pages/EmployerShiftTemplatesPage").then((m) => ({
    default: m.EmployerShiftTemplatesPage,
  })),
);
const EmployerDemandPlannerPage = lazyPage(() =>
  import("../../features/employer/planner/pages/EmployerPlannerNewPage").then((m) => ({
    default: m.EmployerPlannerNewPage,
  })),
);
const EmployerPlannerHomePage = lazyPage(() =>
  import("../../features/employer/planner/pages/EmployerPlannerHomePage").then((m) => ({
    default: m.EmployerPlannerHomePage,
  })),
);
const EmployerPlannerPlansListPage = lazyPage(() =>
  import("../../features/employer/planner/pages/EmployerPlannerPlansListPage").then((m) => ({
    default: m.EmployerPlannerPlansListPage,
  })),
);
const EmployerPlannerDetailPage = lazyPage(() =>
  import("../../features/employer/planner/pages/EmployerPlannerDetailPage").then((m) => ({
    default: m.EmployerPlannerDetailPage,
  })),
);
const EmployerPlannerFinancePlaceholderPage = lazyPage(() =>
  import("../../features/employer/planner/pages/EmployerPlannerFinancePlaceholderPage").then(
    (m) => ({ default: m.EmployerPlannerFinancePlaceholderPage }),
  ),
);
const EmployerCareerHomePage = lazyPage(() =>
  import("../../features/employer/careerJobs/pages/EmployerCareerHomePage").then((m) => ({
    default: m.EmployerCareerHomePage,
  })),
);
const EmployerCareerPostsPage = lazyPage(() =>
  import("../../features/employer/careerJobs/pages/EmployerCareerPostsPage").then((m) => ({
    default: m.EmployerCareerPostsPage,
  })),
);
const EmployerCareerCompletedRecordsPage = lazyPage(() =>
  import("../../features/employer/careerJobs/pages/EmployerCareerCompletedRecordsPage").then(
    (m) => ({ default: m.EmployerCareerCompletedRecordsPage }),
  ),
);
const EmployerCareerCreatePage = lazyPage(() =>
  import("../../features/employer/careerJobs/pages/EmployerCareerCreatePage").then((m) => ({
    default: m.EmployerCareerCreatePage,
  })),
);
const EmployerCareerPostDashboardPage = lazyPage(() =>
  import("../../features/employer/careerJobs/pages/EmployerCareerPostDashboardPage").then((m) => ({
    default: m.EmployerCareerPostDashboardPage,
  })),
);
const EmployerCareerCandidateDetailPage = lazyPage(() =>
  import("../../features/employer/careerJobs/pages/EmployerCareerCandidateDetailPage").then(
    (m) => ({ default: m.EmployerCareerCandidateDetailPage }),
  ),
);
const EmployerCareerCandidateWorkVaultReviewPage = lazyPage(() =>
  import("../../features/employer/careerJobs/pages/EmployerCareerCandidateWorkVaultReviewPage").then(
    (m) => ({ default: m.EmployerCareerCandidateWorkVaultReviewPage }),
  ),
);
const EmployerWorkforceHomePage = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/EmployerWorkforceHomePage").then((m) => ({
    default: m.EmployerWorkforceHomePage,
  })),
);
const EmployerWorkforceStaffPage = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/EmployerWorkforceStaffPage").then((m) => ({
    default: m.EmployerWorkforceStaffPage,
  })),
);

const EmployerAnnouncementsListWrapper = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerAnnouncementsListWrapper,
  })),
);
const EmployerAnnounceCreateWrapper = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerAnnounceCreateWrapper,
  })),
);
const EmployerAnnounceDashWrapper = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerAnnounceDashWrapper,
  })),
);
const EmployerGroupsWrapper = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerGroupsWrapper,
  })),
);
const EmployerGroupDetailWrapper = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerGroupDetailWrapper,
  })),
);
const EmployerStaffDetailWrapper = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerStaffDetailWrapper,
  })),
);
const EmployeeCompanyWrapper = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployeeCompanyWrapper,
  })),
);
const EmployeeAnnounceDetailWrapper = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployeeAnnounceDetailWrapper,
  })),
);
const EmployeeGroupWrapper = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployeeGroupWrapper,
  })),
);
const EmployeeTimesheetWrapper = lazyPage(() =>
  import("../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployeeTimesheetWrapper,
  })),
);
const EmployerSettingsPage = lazyPage(() =>
  import("../../features/employer/company/pages/EmployerSettingsPage").then((m) => ({
    default: m.EmployerSettingsPage,
  })),
);
const EmployerProfilePage = lazyPage(() =>
  import("../../features/employer/company/pages/EmployerProfilePage").then((m) => ({
    default: m.EmployerProfilePage,
  })),
);
const EmployerNotificationsPage = lazyPage(() =>
  import("../../features/employer/notifications/pages/EmployerNotificationsPage").then((m) => ({
    default: m.EmployerNotificationsPage,
  })),
);
const EmployerMyStaffPage = lazyPage(() =>
  import("../../features/employer/myStaff/pages/EmployerMyStaffPage").then((m) => ({
    default: m.EmployerMyStaffPage,
  })),
);
const EmployerReviewCenterPage = lazyPage(() =>
  import("../../features/shared/reviewCenter/pages/EmployerReviewCenterPage").then((m) => ({
    default: m.EmployerReviewCenterPage,
  })),
);
const EmployerStaffDetailPage = lazyPage(() =>
  import("../../features/employer/myStaff/pages/EmployerStaffDetailPage").then((m) => ({
    default: m.EmployerStaffDetailPage,
  })),
);
const HRManagementPage = lazyPage(() =>
  import("../../features/employer/hrManagement/pages/HRManagementPage").then((m) => ({
    default: m.HRManagementPage,
  })),
);
const HRCandidateDetailPage = lazyPage(() =>
  import("../../features/employer/hrManagement/pages/HRCandidateDetailPage").then((m) => ({
    default: m.HRCandidateDetailPage,
  })),
);
const BulkAttendancePage = lazyPage(() =>
  import("../../features/employer/hrManagement/pages/BulkAttendancePage").then((m) => ({
    default: m.BulkAttendancePage,
  })),
);
const BulkTaskAssignPage = lazyPage(() =>
  import("../../features/employer/hrManagement/pages/BulkTaskAssignPage").then((m) => ({
    default: m.BulkTaskAssignPage,
  })),
);
const BulkNotificationsPage = lazyPage(() =>
  import("../../features/employer/hrManagement/pages/BulkNotificationsPage").then((m) => ({
    default: m.BulkNotificationsPage,
  })),
);
const StaffAvailabilityPage = lazyPage(() =>
  import("../../features/employer/hrManagement/pages/StaffAvailabilityPage").then((m) => ({
    default: m.StaffAvailabilityPage,
  })),
);
const RosterPlannerPage = lazyPage(() =>
  import("../../features/employer/hrManagement/pages/RosterPlannerPage").then((m) => ({
    default: m.RosterPlannerPage,
  })),
);

const ManagerConsolePage = lazyPage(() =>
  import("../../features/employer/managerConsole/pages/ManagerConsolePage").then((m) => ({
    default: m.ManagerConsolePage,
  })),
);
const CommandCenterPage = lazyPage(() =>
  import("../../features/employer/managerConsole/pages/CommandCenterPage").then((m) => ({
    default: m.CommandCenterPage,
  })),
);
const ConsoleIncidentReportsPage = lazyPage(() =>
  import("../../features/employer/managerConsole/pages/ConsoleIncidentReportsPage").then((m) => ({
    default: m.ConsoleIncidentReportsPage,
  })),
);

const EmployerVaultLookupPage = lazyPage(() =>
  import("../../features/employer/workVault/pages/EmployerVaultLookupPage").then((m) => ({
    default: m.EmployerVaultLookupPage,
  })),
);
const EmployerVaultViewPage = lazyPage(() =>
  import("../../features/employer/workVault/pages/EmployerVaultViewPage").then((m) => ({
    default: m.EmployerVaultViewPage,
  })),
);

// New Premium Analytics Page
const EmployerAnalyticsPage = lazyPage(() =>
  import("../../features/employer/home/pages/EmployerAnalyticsPage").then((m) => ({
    default: m.EmployerAnalyticsPage,
  })),
);

const AdminHomePage = lazyPage(() =>
  import("../../features/admin/home/pages/AdminHomePage").then((m) => ({
    default: m.AdminHomePage,
  })),
);
const AdminAlertsPage = lazyPage(() =>
  import("../../features/admin/oversight/pages/AdminAlertsPage").then((m) => ({
    default: m.AdminAlertsPage,
  })),
);
const AdminUsersPage = lazyPage(() =>
  import("../../features/admin/oversight/pages/AdminUsersPage").then((m) => ({
    default: m.AdminUsersPage,
  })),
);
const AdminNotificationsPage = lazyPage(() =>
  import("../../features/admin/oversight/pages/AdminNotificationsPage").then((m) => ({
    default: m.AdminNotificationsPage,
  })),
);
const AdminAnalyticsPage = lazyPage(() =>
  import("../../features/admin/oversight/pages/AdminAnalyticsPage").then((m) => ({
    default: m.AdminAnalyticsPage,
  })),
);
const AdminSettingsPage = lazyPage(() =>
  import("../../features/admin/oversight/pages/AdminSettingsPage").then((m) => ({
    default: m.AdminSettingsPage,
  })),
);

import {
  LegacyShiftPlanSummaryRedirect,
  LegacyShiftProjectApplyRedirect,
  LegacyShiftProjectRedirect,
} from "../../features/employee/planner/plannerLegacyRedirects";

const NotFoundPage = lazyPage(() =>
  import("./NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

function PageLoader() {
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

const EC = {
  shift: "shift",
  career: "career",
  workforce: "workforce",

  employmentDetail: "employment/:employmentId",
  profile: "profile",
  notifications: "notifications",
  settings: "settings",
  reviewCenter: "review-center",
  shiftSearch: "shift/search",
  shiftProjects: "shift/projects",
  shiftProjectDetail: "shift/projects/:planId",
  shiftProjectApply: "shift/projects/:planId/apply",
  shiftPlanApplicationSummary: "shift/applications/plan/:planId",
  shiftPostDetails: "shift/post/:postId",
  shiftApplications: "shift/applications",
  shiftWorkspaces: "shift/workspaces",
  shiftWorkspace: "shift/workspace/:workspaceId",
  shiftEarnings: "shift/earnings",
  shiftPosts: "shift/posts",
  plannerHome: "planner/home",
  plannerBrowse: "planner/browse",
  plannerProjectDetail: "planner/projects/:planId",
  plannerProjectApply: "planner/projects/:planId/apply",
  plannerApplications: "planner/applications",
  plannerPlanApplicationSummary: "planner/applications/plan/:planId",
  plannerWorkspaces: "planner/workspaces",
  plannerWorkspace: "planner/workspace/:workspaceId",
  plannerEarnings: "planner/earnings",
  careerSearch: "career/search",
  careerPostDetails: "career/post/:postId",
  careerApplications: "career/applications",
  careerWorkspaces: "career/workspaces",
  careerWorkspace: "career/workspace/:workspaceId",
  careerCompletedRecords: "career/completed-records",
  workforceCompany: "workforce/company",
  workforceAnnounceDetail: "workforce/announce/:announcementId",
  workforceGroup: "workforce/group/:groupId",
  vault: "vault",
  vaultFolder: "vault/folder/:folderId",
  vaultUpload: "vault/folder/:folderId/upload",
  vaultOtp: "vault/otp",
  vaultAccessLog: "vault/access-log",
} as const;

const ER = {
  shift: "shift",
  career: "career",
  analytics: "analytics", // Added Analytics path constant
  workforce: "workforce",
  settings: "settings",
  notifications: "notifications",
  reviewCenter: "review-center",
  careerCreate: "career/create",
  careerPosts: "career/posts",
  careerCompletedRecords: "career/completed-records",
  careerPostDashboard: "career/post/:postId",
  careerCandidateDetail: "career/post/:postId/candidate/:appId",
  careerCandidateWorkVaultReview: "career/post/:postId/candidate/:appId/work-vault-review",
  shiftCreate: "shift/create",
  shiftPostDashboard: "shift/post/:postId",
  shiftShortlist: "shift/post/:postId/shortlist",
  shiftCandidateDetail: "shift/post/:postId/candidate/:appId",
  candidateDocumentAccess: "shift/post/:postId/candidate/:appId/document-access",
  shiftWorkspaces: "shift/workspaces",
  shiftWorkspace: "shift/workspace/:workspaceId",
  shiftPosts: "shift/posts",
  shiftFavorites: "shift/favorites",
  shiftTemplates: "shift/templates",
  shiftDemandPlanner: "shift/demand-planner",
  plannerHome: "planner/home",
  plannerPlans: "planner/plans",
  plannerNew: "planner/new",
  plannerDetail: "planner/plans/:planId",
  plannerFinance: "planner/plans/:planId/finance",
  workforceStaff: "workforce/staff",
  workforceStaffDetail: "workforce/staff/:staffId",
  workforceAnnouncements: "workforce/announcements",
  workforceAnnounceCreate: "workforce/announce/create",
  workforceAnnounce: "workforce/announce",
  workforceAnnounceDash: "workforce/announce/:announcementId",
  workforceGroups: "workforce/groups",
  workforceGroup: "workforce/group/:groupId",
  vault: "vault",
  vaultView: "vault/view/:employeeId",
  myStaff: "my-staff",
  myStaffDetail: "my-staff/:staffId",
  hrManagement: "hr",
  hrCandidateDetail: "hr/candidate/:hrCandidateId",
  profile: "profile",
  console: "console",
  consoleCommandCenter: "console/command-center",
  consoleAttendance: "console/attendance",
  consoleTaskAssign: "console/bulk-task",
  consoleNotices: "console/notices",
  consoleAvailability: "console/availability",
  consoleRoster: "console/roster",
  consoleIncidents: "console/incidents",
} as const;

const AC = {
  alerts: "alerts",
  users: "users",
  analytics: "analytics",
  notifications: "notifications",
  settings: "settings",
} as const;

function getHomeForRole(role: AppRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return IS_DEV_ADMIN_ENABLED ? ROUTE_PATHS.adminHome : ROUTE_PATHS.landing;
}

function useRole(): AppRole | null {
  return useSyncExternalStore(roleStorage.subscribe, roleStorage.get, roleStorage.get);
}

function RoleHomeRedirect() {
  const role = useRole();
  if (!role) return <Navigate to={ROUTE_PATHS.landing} replace />;
  return <Navigate to={getHomeForRole(role)} replace />;
}

function LaunchModuleBoundary({ enabled, fallback }: { enabled: boolean; fallback: string }) {
  return enabled ? <Outlet /> : <Navigate to={fallback} replace />;
}

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
                <Route index element={<EmployeeHomePage />} />
                <Route path="home" element={<Navigate to={ROUTE_PATHS.employeeHome} replace />} />
                <Route
                  path="career/home"
                  element={<Navigate to={ROUTE_PATHS.employeeCareerHome} replace />}
                />
                <Route
                  path="vault/home"
                  element={<Navigate to={ROUTE_PATHS.employeeVaultHome} replace />}
                />
                <Route
                  path="vault/documents"
                  element={<Navigate to={ROUTE_PATHS.employeeVaultHome} replace />}
                />
                <Route
                  path="vault/access-logs"
                  element={<Navigate to={ROUTE_PATHS.employeeVaultAccessLog} replace />}
                />
                <Route path={EC.shift} element={<ShiftControlCenterPage />} />
                <Route path={EC.career} element={<EmployeeCareerHomePage />} />
                <Route path={EC.careerSearch} element={<EmployeeCareerSearchPage />} />
                <Route path={EC.careerPostDetails} element={<EmployeeCareerPostDetailsPage />} />
                <Route path={EC.careerApplications} element={<EmployeeCareerApplicationsPage />} />
                <Route path={EC.careerWorkspaces} element={<EmployeeCareerWorkspacesPage />} />
                <Route path={EC.careerWorkspace} element={<EmployeeCareerWorkspacePage />} />
                <Route
                  path={EC.careerCompletedRecords}
                  element={<EmployeeCareerCompletedRecordsPage />}
                />
                <Route
                  element={
                    <LaunchModuleBoundary
                      enabled={showPhase2Features}
                      fallback={ROUTE_PATHS.employeeHome}
                    />
                  }
                >
                  <Route path={EC.workforce} element={<EmployeeWorkforceHomePage />} />
                  <Route path={EC.workforceCompany} element={<EmployeeCompanyWrapper />} />
                  <Route
                    path={EC.workforceAnnounceDetail}
                    element={<EmployeeAnnounceDetailWrapper />}
                  />
                  <Route path={EC.workforceGroup} element={<EmployeeGroupWrapper />} />
                  <Route path="workforce/timesheet" element={<EmployeeTimesheetWrapper />} />
                </Route>
                <Route path={EC.shiftSearch} element={<ShiftSearchPage />} />
                <Route path={EC.shiftProjects} element={<EmployeePlannerBrowsePage />} />
                <Route path={EC.plannerHome} element={<EmployeePlannerHomePage />} />
                <Route path={EC.plannerBrowse} element={<EmployeePlannerBrowsePage />} />
                <Route path={EC.plannerProjectDetail} element={<EmployeeProjectDetailPage />} />
                <Route path={EC.plannerProjectApply} element={<EmployeeProjectPickApplyPage />} />
                <Route
                  path={EC.plannerPlanApplicationSummary}
                  element={<EmployeePlanApplicationSummaryPage />}
                />
                <Route
                  path={EC.plannerApplications}
                  element={<EmployeePlannerApplicationsPage />}
                />
                <Route path={EC.plannerWorkspaces} element={<EmployeePlannerWorkspacesPage />} />
                <Route path={EC.plannerWorkspace} element={<ShiftWorkspacePage />} />
                <Route path={EC.plannerEarnings} element={<EmployeePlannerEarningsPage />} />
                <Route path={EC.shiftProjectDetail} element={<LegacyShiftProjectRedirect />} />
                <Route path={EC.shiftProjectApply} element={<LegacyShiftProjectApplyRedirect />} />
                <Route
                  path={EC.shiftPlanApplicationSummary}
                  element={<LegacyShiftPlanSummaryRedirect />}
                />
                <Route path={EC.shiftPostDetails} element={<ShiftPostDetailsApplyPage />} />
                <Route path={EC.shiftApplications} element={<MyShiftApplicationsPage />} />
                <Route path={EC.shiftWorkspaces} element={<MyShiftWorkspacesPage />} />
                <Route path={EC.shiftWorkspace} element={<ShiftWorkspacePage />} />
                <Route path={EC.shiftEarnings} element={<EmployeeEarningsPage />} />
                <Route path={EC.vault} element={<EmployeeVaultHomePage />} />
                <Route path={EC.vaultFolder} element={<EmployeeVaultFolderPage />} />
                <Route path={EC.vaultOtp} element={<EmployeeVaultOtpPage />} />
                <Route path={EC.vaultAccessLog} element={<EmployeeVaultAccessLogPage />} />

                <Route path={EC.employmentDetail} element={<EmployeeEmploymentDetailPage />} />
                <Route path={EC.profile} element={<EmployeeProfilePage />} />
                <Route path={EC.notifications} element={<EmployeeNotificationsPage />} />
                <Route path={EC.settings} element={<EmployeeSettingsPage />} />
                <Route path={EC.reviewCenter} element={<EmployeeReviewCenterPage />} />
                <Route path="help" element={<HelpSupportPage />} />
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
                <Route index element={<EmployerHomePage />} />
                <Route path={ER.shift} element={<EmployerShiftHomePage />} />
                <Route path={ER.career} element={<EmployerCareerHomePage />} />
                <Route path={ER.careerPosts} element={<EmployerCareerPostsPage />} />
                <Route
                  path={ER.careerCompletedRecords}
                  element={<EmployerCareerCompletedRecordsPage />}
                />
                <Route path={ER.careerCreate} element={<EmployerCareerCreatePage />} />
                <Route
                  path={ER.careerPostDashboard}
                  element={<EmployerCareerPostDashboardPage />}
                />
                <Route
                  path={ER.careerCandidateDetail}
                  element={<EmployerCareerCandidateDetailPage />}
                />
                <Route
                  path={ER.careerCandidateWorkVaultReview}
                  element={<EmployerCareerCandidateWorkVaultReviewPage />}
                />
                <Route
                  element={
                    <LaunchModuleBoundary
                      enabled={showPhase2Features}
                      fallback={ROUTE_PATHS.employerHome}
                    />
                  }
                >
                  <Route path={ER.workforce} element={<EmployerWorkforceHomePage />} />
                  <Route path={ER.workforceStaff} element={<EmployerWorkforceStaffPage />} />
                  <Route path={ER.workforceStaffDetail} element={<EmployerStaffDetailWrapper />} />
                  <Route
                    path={ER.workforceAnnouncements}
                    element={<EmployerAnnouncementsListWrapper />}
                  />
                  <Route
                    path={ER.workforceAnnounceCreate}
                    element={<EmployerAnnounceCreateWrapper />}
                  />
                  <Route path={ER.workforceAnnounce} element={<EmployerAnnounceCreateWrapper />} />
                  <Route
                    path={ER.workforceAnnounceDash}
                    element={<EmployerAnnounceDashWrapper />}
                  />
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
                    <LaunchModuleBoundary
                      enabled={showPhase2Features}
                      fallback={ROUTE_PATHS.employerHome}
                    />
                  }
                >
                  <Route path={ER.hrManagement} element={<HRManagementPage />} />
                  <Route path={ER.hrCandidateDetail} element={<HRCandidateDetailPage />} />
                </Route>
                <Route
                  element={
                    <LaunchModuleBoundary
                      enabled={showPhase2Features}
                      fallback={ROUTE_PATHS.employerHome}
                    />
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
                <Route path={ER.plannerNew} element={<EmployerDemandPlannerPage />} />
                <Route path={ER.plannerDetail} element={<EmployerPlannerDetailPage />} />
                <Route
                  path={ER.plannerFinance}
                  element={<EmployerPlannerFinancePlaceholderPage />}
                />
                <Route path={ER.shiftCreate} element={<EmployerShiftCreatePage />} />
                <Route path={ER.shiftPostDashboard} element={<EmployerShiftPostDashboardPage />} />
                <Route path={ER.shiftWorkspaces} element={<EmployerShiftWorkspacesPage />} />
                <Route path={ER.shiftShortlist} element={<EmployerShiftPostDashboardPage />} />
                <Route path={ER.shiftCandidateDetail} element={<EmployerCandidateDetailPage />} />
                <Route
                  path={ER.candidateDocumentAccess}
                  element={<EmployerCandidateDocumentAccessPage />}
                />
                <Route path={ER.shiftWorkspace} element={<EmployerShiftWorkspacePage />} />
                <Route path="help" element={<HelpSupportPage />} />
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
                  <Route index element={<AdminHomePage />} />
                  <Route path={AC.alerts} element={<AdminAlertsPage />} />
                  <Route path={AC.users} element={<AdminUsersPage />} />
                  <Route path={AC.notifications} element={<AdminNotificationsPage />} />
                  <Route path={AC.analytics} element={<AdminAnalyticsPage />} />
                  <Route path={AC.settings} element={<AdminSettingsPage />} />
                </Route>
              ) : (
                <Route path="/admin/*" element={<Navigate to={ROUTE_PATHS.landing} replace />} />
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
