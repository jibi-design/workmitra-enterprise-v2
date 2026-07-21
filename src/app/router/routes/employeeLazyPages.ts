/** Job Mitra | employeeLazyPages.ts | Employee route lazy imports */

import { lazyPage } from "../lazyPage";

export const EmployeeHomePage = lazyPage(() =>
  import("../../../features/employee/home/pages/EmployeeHomePage").then((m) => ({
    default: m.EmployeeHomePage,
  })),
);
export const EmployeePlannerHomePage = lazyPage(() =>
  import("../../../features/employee/planner/pages/EmployeePlannerHomePage").then((m) => ({
    default: m.EmployeePlannerHomePage,
  })),
);
export const EmployeePlannerBrowsePage = lazyPage(() =>
  import("../../../features/employee/planner/pages/EmployeePlannerBrowsePage").then((m) => ({
    default: m.EmployeePlannerBrowsePage,
  })),
);
export const EmployeePlannerWorkspaceHubPage = lazyPage(() =>
  import("../../../features/employee/planner/pages/EmployeePlannerWorkspaceHubPage").then((m) => ({
    default: m.EmployeePlannerWorkspaceHubPage,
  })),
);
export const EmployeePlannerWorkspaceDayPage = lazyPage(() =>
  import("../../../features/employee/planner/pages/EmployeePlannerWorkspaceDayPage").then((m) => ({
    default: m.EmployeePlannerWorkspaceDayPage,
  })),
);
export const EmployeePlannerApplicationsPage = lazyPage(() =>
  import("../../../features/employee/planner/pages/EmployeePlannerApplicationsPage").then((m) => ({
    default: m.EmployeePlannerApplicationsPage,
  })),
);
export const EmployeePlannerWorkspacesPage = lazyPage(() =>
  import("../../../features/employee/planner/pages/EmployeePlannerWorkspacesPage").then((m) => ({
    default: m.EmployeePlannerWorkspacesPage,
  })),
);
export const EmployeePlannerEarningsPage = lazyPage(() =>
  import("../../../features/employee/planner/pages/EmployeePlannerEarningsPage").then((m) => ({
    default: m.EmployeePlannerEarningsPage,
  })),
);
export const ShiftControlCenterPage = lazyPage(() =>
  import("../../../features/employee/shiftJobs/pages/ShiftControlCenterPage").then((m) => ({
    default: m.ShiftControlCenterPage,
  })),
);
export const ShiftSearchPage = lazyPage(() =>
  import("../../../features/employee/shiftJobs/pages/ShiftSearchPage").then((m) => ({
    default: m.ShiftSearchPage,
  })),
);
export const EmployeeProjectDetailPage = lazyPage(() =>
  import("../../../features/employee/planner/pages/EmployeeProjectDetailPage").then((m) => ({
    default: m.EmployeeProjectDetailPage,
  })),
);
export const EmployeeProjectPickApplyPage = lazyPage(() =>
  import("../../../features/employee/planner/pages/EmployeeProjectPickApplyPage").then((m) => ({
    default: m.EmployeeProjectPickApplyPage,
  })),
);
export const EmployeePlanApplicationSummaryPage = lazyPage(() =>
  import("../../../features/employee/planner/pages/EmployeePlanApplicationSummaryPage").then(
    (m) => ({ default: m.EmployeePlanApplicationSummaryPage }),
  ),
);
export const ShiftPostDetailsApplyPage = lazyPage(() =>
  import("../../../features/employee/shiftJobs/pages/ShiftPostDetailsApplyPage").then((m) => ({
    default: m.ShiftPostDetailsApplyPage,
  })),
);
export const MyShiftApplicationsPage = lazyPage(() =>
  import("../../../features/employee/shiftJobs/pages/MyShiftApplicationsPage").then((m) => ({
    default: m.MyShiftApplicationsPage,
  })),
);
export const MyShiftWorkspacesPage = lazyPage(() =>
  import("../../../features/employee/shiftJobs/pages/MyShiftWorkspacesPage").then((m) => ({
    default: m.MyShiftWorkspacesPage,
  })),
);
export const ShiftWorkspacePage = lazyPage(() =>
  import("../../../features/employee/shiftJobs/pages/ShiftWorkspacePage").then((m) => ({
    default: m.ShiftWorkspacePage,
  })),
);
export const EmployeeEarningsPage = lazyPage(() =>
  import("../../../features/employee/shiftJobs/pages/EmployeeEarningsPage").then((m) => ({
    default: m.EmployeeEarningsPage,
  })),
);
export const EmployeeProfilePage = lazyPage(() =>
  import("../../../features/employee/profile/pages/EmployeeProfilePage").then((m) => ({
    default: m.EmployeeProfilePage,
  })),
);
export const EmployeeNotificationsPage = lazyPage(() =>
  import("../../../features/employee/notifications/pages/EmployeeNotificationsPage").then((m) => ({
    default: m.EmployeeNotificationsPage,
  })),
);
export const EmployeeSettingsPage = lazyPage(() =>
  import("../../../features/employee/settings/pages/EmployeeSettingsPage").then((m) => ({
    default: m.EmployeeSettingsPage,
  })),
);
export const EmployeeCareerHomePage = lazyPage(() =>
  import("../../../features/employee/careerJobs/pages/EmployeeCareerHomePage").then((m) => ({
    default: m.EmployeeCareerHomePage,
  })),
);
export const EmployeeCareerSearchPage = lazyPage(() =>
  import("../../../features/employee/careerJobs/pages/EmployeeCareerSearchPage").then((m) => ({
    default: m.EmployeeCareerSearchPage,
  })),
);
export const EmployeeCareerPostDetailsPage = lazyPage(() =>
  import("../../../features/employee/careerJobs/pages/EmployeeCareerPostDetailsPage").then((m) => ({
    default: m.EmployeeCareerPostDetailsPage,
  })),
);
export const EmployeeCareerApplicationsPage = lazyPage(() =>
  import("../../../features/employee/careerJobs/pages/EmployeeCareerApplicationsPage").then(
    (m) => ({ default: m.EmployeeCareerApplicationsPage }),
  ),
);
export const EmployeeCareerWorkspacesPage = lazyPage(() =>
  import("../../../features/employee/careerJobs/pages/EmployeeCareerWorkspacesPage").then((m) => ({
    default: m.EmployeeCareerWorkspacesPage,
  })),
);
export const EmployeeCareerWorkspacePage = lazyPage(() =>
  import("../../../features/employee/careerJobs/pages/EmployeeCareerWorkspacePage").then((m) => ({
    default: m.EmployeeCareerWorkspacePage,
  })),
);
export const EmployeeCareerCompletedRecordsPage = lazyPage(() =>
  import("../../../features/employee/careerJobs/pages/EmployeeCareerCompletedRecordsPage").then(
    (m) => ({ default: m.EmployeeCareerCompletedRecordsPage }),
  ),
);
export const EmployeeWorkforceHomePage = lazyPage(() =>
  import("../../../features/employee/workforceOps/pages/EmployeeWorkforceHomePage").then((m) => ({
    default: m.EmployeeWorkforceHomePage,
  })),
);
export const EmployeeEmploymentDetailPage = lazyPage(() =>
  import("../../../features/employee/employment/pages/EmployeeEmploymentDetailPage").then((m) => ({
    default: m.EmployeeEmploymentDetailPage,
  })),
);
export const EmployeeReviewCenterPage = lazyPage(() =>
  import("../../../features/shared/reviewCenter/pages/EmployeeReviewCenterPage").then((m) => ({
    default: m.EmployeeReviewCenterPage,
  })),
);
export const EmployeeVaultHomePage = lazyPage(() =>
  import("../../../features/employee/workVault/pages/EmployeeVaultHomePage").then((m) => ({
    default: m.EmployeeVaultHomePage,
  })),
);
export const EmployeeVaultFolderPage = lazyPage(() =>
  import("../../../features/employee/workVault/pages/EmployeeVaultFolderPage").then((m) => ({
    default: m.EmployeeVaultFolderPage,
  })),
);
export const EmployeeVaultOtpPage = lazyPage(() =>
  import("../../../features/employee/workVault/pages/EmployeeVaultOtpPage").then((m) => ({
    default: m.EmployeeVaultOtpPage,
  })),
);
export const EmployeeVaultAccessLogPage = lazyPage(() =>
  import("../../../features/employee/workVault/pages/EmployeeVaultAccessLogPage").then((m) => ({
    default: m.EmployeeVaultAccessLogPage,
  })),
);
export const EmployeeCompanyWrapper = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployeeCompanyWrapper,
  })),
);
export const EmployeeAnnounceDetailWrapper = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployeeAnnounceDetailWrapper,
  })),
);
export const EmployeeGroupWrapper = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployeeGroupWrapper,
  })),
);
export const EmployeeTimesheetWrapper = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployeeTimesheetWrapper,
  })),
);
