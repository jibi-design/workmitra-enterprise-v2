/** Job Mitra | employerLazyPages.ts | Employer route lazy imports */

import { lazyPage } from "../lazyPage";
import { ensureThemeBundle } from "../../theme/ensureThemeBundle";

export const EmployerHomePage = lazyPage(() =>
  import("../../../features/employer/home/pages/EmployerHomePage").then((m) => ({
    default: m.EmployerHomePage,
  })),
);
export const EmployerDashboardPage = lazyPage(() =>
  ensureThemeBundle("mitra-labs").then(() =>
    import("../../../features/employer/home/pages/EmployerDashboard").then((m) => ({
      default: m.EmployerDashboard,
    })),
  ),
);
export const EmployerShiftHomePage = lazyPage(() =>
  import("../../../features/employer/shiftJobs/pages/EmployerShiftHomePage").then((m) => ({
    default: m.EmployerShiftHomePage,
  })),
);
export const EmployerShiftCreatePage = lazyPage(async () => {
  ensureThemeBundle("shift-create-wizard");
  const m = await import("../../../features/employer/shiftJobs/pages/EmployerShiftCreatePage");
  return { default: m.EmployerShiftCreatePage };
});
export const EmployerShiftPostDashboardPage = lazyPage(() =>
  import("../../../features/employer/shiftJobs/pages/EmployerShiftPostDashboardPage").then((m) => ({
    default: m.EmployerShiftPostDashboardPage,
  })),
);
export const EmployerCandidateDetailPage = lazyPage(() =>
  import("../../../features/employer/shiftJobs/pages/EmployerCandidateDetailPage").then((m) => ({
    default: m.EmployerCandidateDetailPage,
  })),
);
export const EmployerCandidateDocumentAccessPage = lazyPage(() =>
  import("../../../features/employer/shiftJobs/pages/EmployerCandidateDocumentAccessPage").then(
    (m) => ({ default: m.EmployerCandidateDocumentAccessPage }),
  ),
);
export const EmployerShiftWorkspacePage = lazyPage(() =>
  import("../../../features/employer/shiftJobs/pages/EmployerShiftWorkspacePage").then((m) => ({
    default: m.EmployerShiftWorkspacePage,
  })),
);
export const EmployerShiftWorkspacesPage = lazyPage(() =>
  import("../../../features/employer/shiftJobs/pages/EmployerShiftWorkspacesPage").then((m) => ({
    default: m.EmployerShiftWorkspacesPage,
  })),
);
export const EmployerShiftPostsPage = lazyPage(() =>
  import("../../../features/employer/shiftJobs/pages/EmployerShiftPostsPage").then((m) => ({
    default: m.EmployerShiftPostsPage,
  })),
);
export const EmployerFavoritesPage = lazyPage(() =>
  import("../../../features/employer/shiftJobs/pages/EmployerFavoritesPage").then((m) => ({
    default: m.EmployerFavoritesPage,
  })),
);
export const EmployerShiftTemplatesPage = lazyPage(() =>
  import("../../../features/employer/shiftJobs/pages/EmployerShiftTemplatesPage").then((m) => ({
    default: m.EmployerShiftTemplatesPage,
  })),
);
export const EmployerDemandPlannerPage = lazyPage(() =>
  import("../../../features/employer/planner/pages/EmployerPlannerNewPage").then((m) => ({
    default: m.EmployerPlannerNewPage,
  })),
);
export const EmployerPlannerHomePage = lazyPage(() =>
  ensureThemeBundle("shift-planner").then(() =>
    import("../../../features/employer/planner/pages/EmployerPlannerHomePage").then((m) => ({
      default: m.EmployerPlannerHomePage,
    })),
  ),
);
export const EmployerPlannerPlansListPage = lazyPage(() =>
  ensureThemeBundle("shift-planner").then(() =>
    import("../../../features/employer/planner/pages/EmployerPlannerPlansListPage").then((m) => ({
      default: m.EmployerPlannerPlansListPage,
    })),
  ),
);
export const EmployerPlannerDetailPage = lazyPage(() =>
  import("../../../features/employer/planner/pages/EmployerPlannerDetailPage").then((m) => ({
    default: m.EmployerPlannerDetailPage,
  })),
);
export const EmployerPlannerFinancePlaceholderPage = lazyPage(() =>
  import("../../../features/employer/planner/pages/EmployerPlannerFinancePlaceholderPage").then(
    (m) => ({ default: m.EmployerPlannerFinancePlaceholderPage }),
  ),
);
export const EmployerPlannerApplicationsPage = lazyPage(() =>
  import("../../../features/employer/planner/pages/EmployerPlannerApplicationsPage").then((m) => ({
    default: m.EmployerPlannerApplicationsPage,
  })),
);
export const EmployerPlannerRosterPage = lazyPage(() =>
  import("../../../features/employer/planner/pages/EmployerPlannerRosterPage").then((m) => ({
    default: m.EmployerPlannerRosterPage,
  })),
);
export const EmployerPlannerRosterDetailPage = lazyPage(() =>
  import("../../../features/employer/planner/pages/EmployerPlannerRosterDetailPage").then((m) => ({
    default: m.EmployerPlannerRosterDetailPage,
  })),
);
export const EmployerWeeklyShiftPlannerPage = lazyPage(() =>
  ensureThemeBundle("shift-planner").then(() =>
    import("../../../features/shiftPlanner/pages/WeeklyShiftPlanner").then((m) => ({
      default: m.EmployerWeeklyShiftPlannerPage,
    })),
  ),
);
export const EmployerSwapApprovalPage = lazyPage(() =>
  ensureThemeBundle("shift-planner").then(() =>
    import("../../../features/shiftPlanner/pages/EmployerSwapApproval").then((m) => ({
      default: m.EmployerSwapApproval,
    })),
  ),
);
export const EmployerCareerHomePage = lazyPage(() =>
  import("../../../features/employer/careerJobs/pages/EmployerCareerHomePage").then((m) => ({
    default: m.EmployerCareerHomePage,
  })),
);
export const EmployerCareerPostsPage = lazyPage(() =>
  import("../../../features/employer/careerJobs/pages/EmployerCareerPostsPage").then((m) => ({
    default: m.EmployerCareerPostsPage,
  })),
);
export const EmployerCareerCompletedRecordsPage = lazyPage(() =>
  import("../../../features/employer/careerJobs/pages/EmployerCareerCompletedRecordsPage").then(
    (m) => ({ default: m.EmployerCareerCompletedRecordsPage }),
  ),
);
export const EmployerCareerCreatePage = lazyPage(() =>
  import("../../../features/employer/careerJobs/pages/EmployerCareerCreatePage").then((m) => ({
    default: m.EmployerCareerCreatePage,
  })),
);
export const EmployerCareerPostDashboardPage = lazyPage(() =>
  import("../../../features/employer/careerJobs/pages/EmployerCareerPostDashboardPage").then(
    (m) => ({ default: m.EmployerCareerPostDashboardPage }),
  ),
);
export const EmployerCareerCandidateDetailPage = lazyPage(() =>
  import("../../../features/employer/careerJobs/pages/EmployerCareerCandidateDetailPage").then(
    (m) => ({ default: m.EmployerCareerCandidateDetailPage }),
  ),
);
export const EmployerCareerCandidateWorkVaultReviewPage = lazyPage(() =>
  import("../../../features/employer/careerJobs/pages/EmployerCareerCandidateWorkVaultReviewPage").then(
    (m) => ({ default: m.EmployerCareerCandidateWorkVaultReviewPage }),
  ),
);
export const EmployerWorkforceHomePage = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/EmployerWorkforceHomePage").then((m) => ({
    default: m.EmployerWorkforceHomePage,
  })),
);
export const EmployerWorkforceStaffPage = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/EmployerWorkforceStaffPage").then((m) => ({
    default: m.EmployerWorkforceStaffPage,
  })),
);
export const EmployerAnnouncementsListWrapper = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerAnnouncementsListWrapper,
  })),
);
export const EmployerAnnounceCreateWrapper = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerAnnounceCreateWrapper,
  })),
);
export const EmployerAnnounceDashWrapper = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerAnnounceDashWrapper,
  })),
);
export const EmployerGroupsWrapper = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerGroupsWrapper,
  })),
);
export const EmployerGroupDetailWrapper = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerGroupDetailWrapper,
  })),
);
export const EmployerStaffDetailWrapper = lazyPage(() =>
  import("../../../features/employer/workforceOps/pages/WorkforceRouteWrappers").then((m) => ({
    default: m.EmployerStaffDetailWrapper,
  })),
);
export const EmployerSettingsPage = lazyPage(() =>
  import("../../../features/employer/company/pages/EmployerSettingsPage").then((m) => ({
    default: m.EmployerSettingsPage,
  })),
);
export const EmployerProfilePage = lazyPage(() =>
  import("../../../features/employer/company/pages/EmployerProfilePage").then((m) => ({
    default: m.EmployerProfilePage,
  })),
);
export const EmployerCompliancePage = lazyPage(() =>
  import("../../../features/employer/compliance/pages/EmployerCompliancePage").then((m) => ({
    default: m.EmployerCompliancePage,
  })),
);
export const EmployerNotificationsPage = lazyPage(() =>
  import("../../../features/employer/notifications/pages/EmployerNotificationsPage").then((m) => ({
    default: m.EmployerNotificationsPage,
  })),
);
export const EmployerMyStaffPage = lazyPage(() =>
  import("../../../features/employer/myStaff/pages/EmployerMyStaffPage").then((m) => ({
    default: m.EmployerMyStaffPage,
  })),
);
export const EmployerReviewCenterPage = lazyPage(() =>
  import("../../../features/shared/reviewCenter/pages/EmployerReviewCenterPage").then((m) => ({
    default: m.EmployerReviewCenterPage,
  })),
);
export const EmployerStaffDetailPage = lazyPage(() =>
  import("../../../features/employer/myStaff/pages/EmployerStaffDetailPage").then((m) => ({
    default: m.EmployerStaffDetailPage,
  })),
);
export const HRManagementPage = lazyPage(() =>
  import("../../../features/employer/hrManagement/pages/HRManagementPage").then((m) => ({
    default: m.HRManagementPage,
  })),
);
export const HRCandidateDetailPage = lazyPage(() =>
  import("../../../features/employer/hrManagement/pages/HRCandidateDetailPage").then((m) => ({
    default: m.HRCandidateDetailPage,
  })),
);
export const BulkAttendancePage = lazyPage(() =>
  import("../../../features/employer/hrManagement/pages/BulkAttendancePage").then((m) => ({
    default: m.BulkAttendancePage,
  })),
);
export const BulkTaskAssignPage = lazyPage(() =>
  import("../../../features/employer/hrManagement/pages/BulkTaskAssignPage").then((m) => ({
    default: m.BulkTaskAssignPage,
  })),
);
export const BulkNotificationsPage = lazyPage(() =>
  import("../../../features/employer/hrManagement/pages/BulkNotificationsPage").then((m) => ({
    default: m.BulkNotificationsPage,
  })),
);
export const StaffAvailabilityPage = lazyPage(() =>
  import("../../../features/employer/hrManagement/pages/StaffAvailabilityPage").then((m) => ({
    default: m.StaffAvailabilityPage,
  })),
);
export const RosterPlannerPage = lazyPage(() =>
  import("../../../features/employer/hrManagement/pages/RosterPlannerPage").then((m) => ({
    default: m.RosterPlannerPage,
  })),
);
export const ManagerConsolePage = lazyPage(() =>
  import("../../../features/employer/managerConsole/pages/ManagerConsolePage").then((m) => ({
    default: m.ManagerConsolePage,
  })),
);
export const CommandCenterPage = lazyPage(() =>
  import("../../../features/employer/managerConsole/pages/CommandCenterPage").then((m) => ({
    default: m.CommandCenterPage,
  })),
);
export const ConsoleIncidentReportsPage = lazyPage(() =>
  import("../../../features/employer/managerConsole/pages/ConsoleIncidentReportsPage").then(
    (m) => ({ default: m.ConsoleIncidentReportsPage }),
  ),
);
export const EmployerVaultLookupPage = lazyPage(() =>
  import("../../../features/employer/workVault/pages/EmployerVaultLookupPage").then((m) => ({
    default: m.EmployerVaultLookupPage,
  })),
);
export const EmployerVaultViewPage = lazyPage(() =>
  import("../../../features/employer/workVault/pages/EmployerVaultViewPage").then((m) => ({
    default: m.EmployerVaultViewPage,
  })),
);
export const EmployerAnalyticsPage = lazyPage(async () => {
  ensureThemeBundle("analytics-dashboard");
  const m = await import("../../../features/employer/home/pages/EmployerAnalyticsPage");
  return { default: m.EmployerAnalyticsPage };
});
export const MitraLabsHubPage = lazyPage(() =>
  ensureThemeBundle("mitra-labs").then(() =>
    import("../../../features/mitraLabs/pages/MitraLabsHub").then((m) => ({
      default: m.MitraLabsHub,
    })),
  ),
);
export const DigitalInviteBuilderPage = lazyPage(() =>
  ensureThemeBundle("mitra-labs").then(() =>
    import("../../../features/mitraLabs/pages/DigitalInviteBuilder").then((m) => ({
      default: m.DigitalInviteBuilder,
    })),
  ),
);
export const ArtisticQrStudioPage = lazyPage(() =>
  ensureThemeBundle("mitra-labs").then(() =>
    import("../../../features/mitraLabs/pages/ArtisticQrStudio").then((m) => ({
      default: m.ArtisticQrStudio,
    })),
  ),
);
export const EventDayReportPage = lazyPage(() =>
  ensureThemeBundle("mitra-labs").then(() =>
    import("../../../features/mitraLabs/pages/EventDayReportPage").then((m) => ({
      default: m.EventDayReportPage,
    })),
  ),
);
export const EventDayReportFolderPage = lazyPage(() =>
  ensureThemeBundle("mitra-labs").then(() =>
    import("../../../features/mitraLabs/pages/EventDayReportFolderPage").then((m) => ({
      default: m.EventDayReportFolderPage,
    })),
  ),
);
export const AiPhotoDeliveryBetaPage = lazyPage(() =>
  ensureThemeBundle("mitra-labs").then(() =>
    import("../../../features/mitraLabs/pages/AiPhotoDeliveryBetaPage").then((m) => ({
      default: m.AiPhotoDeliveryBetaPage,
    })),
  ),
);
export const PublicPassVerifyPage = lazyPage(() =>
  ensureThemeBundle("mitra-labs").then(() =>
    import("../../../features/mitraLabs/pages/PublicPassVerify").then((m) => ({
      default: m.PublicPassVerify,
    })),
  ),
);

export const ShiftOpsManagerApprovalsPage = lazyPage(() =>
  import("../../../features/shiftOps/pages/ShiftOpsManagerApprovalsPage").then((m) => ({
    default: m.ShiftOpsManagerApprovalsPage,
  })),
);
