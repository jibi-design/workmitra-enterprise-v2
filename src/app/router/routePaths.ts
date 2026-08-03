// src/app/router/routePaths.ts
export const ROUTE_PATHS = {
  landing: "/",
  publicSite: "/site",
  publicWelcome: "/welcome",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  rolePick: "/role-pick",
  employeeHome: "/employee",
  employerHome: "/employer",
  adminHome: "/admin",

  // Employee domain entries
  employeeShiftCenter: "/employee/shift",
  employeeCareerHome: "/employee/career",
  employeeWorkforceHome: "/employee/workforce",

  // Employee Shift (Temporary) - detailed routes (Phase-0)
  employeeShiftSearch: "/employee/shift/search",
  employeeShiftProjects: "/employee/shift/projects",
  employeeShiftPostDetails: "/employee/shift/post/:postId",
  employeeShiftApplications: "/employee/shift/applications",
  employeeShiftPlanApplicationSummary: "/employee/shift/applications/plan/:planId",
  employeeShiftProjectDetail: "/employee/shift/projects/:planId",
  employeeShiftProjectApply: "/employee/shift/projects/:planId/apply",
  employeeShiftWorkspaces: "/employee/shift/workspaces",
  employeeShiftWorkspace: "/employee/shift/workspace/:workspaceId",
  employeeShiftEarnings: "/employee/shift/earnings",

  // Employee Gig Projects (Demand Planner) — separate domain from Shift Jobs
  employeePlannerHome: "/employee/planner/home",
  /** Canonical discovery hub (Hybrid A2 Route Contract). */
  employeePlannerDiscover: "/employee/planner/discover",
  employeePlannerBrowse: "/employee/planner/browse",
  employeePlannerProjectDetail: "/employee/planner/projects/:planId",
  employeePlannerProjectApply: "/employee/planner/projects/:planId/apply",
  employeePlannerApplications: "/employee/planner/applications",
  employeePlannerPlanApplicationSummary: "/employee/planner/applications/plan/:planId",
  /** Unified Candidate Roster Workspace hub (native in S7). */
  employeePlannerWorkspaceHub: "/employee/planner/workspace",
  employeePlannerWorkspaces: "/employee/planner/workspaces",
  employeePlannerWorkspace: "/employee/planner/workspace/:workspaceId",
  employeePlannerEarnings: "/employee/planner/earnings",

  // Employee Review Center
  employeeReviewCenter: "/employee/review-center",

  // Employer domain entries
  employerShiftHome: "/employer/shift",
  employerCareerHome: "/employer/career",
  employerWorkforceHome: "/employer/workforce",
  employerSettings: "/employer/settings",
  employerNotifications: "/employer/notifications",
  employerMyStaff: "/employer/my-staff",

  // Employer Review Center & Analytics
  employerReviewCenter: "/employer/review-center",
  employerAnalytics: "/employer/analytics",

  // Employer Career - detailed routes (Phase-0)
  employerCareerCreate: "/employer/career/create",
  employerCareerPosts: "/employer/career/posts",
  employerCareerCompletedRecords: "/employer/career/completed-records",
  employerCareerPostDashboard: "/employer/career/post/:postId",
  employerCareerCandidateDetail: "/employer/career/post/:postId/candidate/:appId",
  employerCareerCandidateWorkVaultReview:
    "/employer/career/post/:postId/candidate/:appId/work-vault-review",

  // Employee Career - detailed routes (Phase-0)
  employeeCareerSearch: "/employee/career/search",
  employeeCareerPostDetails: "/employee/career/post/:postId",
  employeeCareerApplications: "/employee/career/applications",
  employeeCareerWorkspace: "/employee/career/workspace/:workspaceId",
  employeeCareerCompletedRecords: "/employee/career/completed-records",

  // Employer Shift (Temporary) - detailed routes (Phase-0)
  employerShiftCreate: "/employer/shift/create",
  employerShiftPostDashboard: "/employer/shift/post/:postId",
  employerCandidateDetail: "/employer/shift/post/:postId/candidate/:appId",
  employerCandidateDocumentAccess: "/employer/shift/post/:postId/candidate/:appId/document-access",
  employerShiftShortlist: "/employer/shift/post/:postId/shortlist",
  employerShiftWorkspaces: "/employer/shift/workspaces",
  employerShiftWorkspace: "/employer/shift/workspace/:workspaceId",
  employerShiftPosts: "/employer/shift/posts",
  employerShiftFavorites: "/employer/shift/favorites",
  employerShiftTemplates: "/employer/shift/templates",
  employerShiftDemandPlanner: "/employer/shift/demand-planner",

  // Employer Demand Planner (Teal subdomain)
  employerPlannerHome: "/employer/planner/home",
  employerPlannerPlans: "/employer/planner/plans",
  /** Canonical wizard entry (Hybrid A2 Route Contract). */
  employerPlannerCreate: "/employer/planner/create",
  employerPlannerNew: "/employer/planner/new",
  employerPlannerDetail: "/employer/planner/plans/:planId",
  employerPlannerFinance: "/employer/planner/plans/:planId/finance",
  /** Batch Approval Engine (native in S4). */
  employerPlannerApplications: "/employer/planner/applications",
  /** Roster Management Console (native in S7). */
  employerPlannerRoster: "/employer/planner/roster",
  employerPlannerRosterDetail: "/employer/planner/roster/:planId",

  // Employer Workforce - detailed routes (Phase-0)
  employerWorkforceStaff: "/employer/workforce/staff",
  employerWorkforceStaffDetail: "/employer/workforce/staff/:staffId",
  employerWorkforceAnnouncements: "/employer/workforce/announcements",
  employerWorkforceAnnounceCreate: "/employer/workforce/announce/create",
  employerWorkforceAnnounce: "/employer/workforce/announce",
  employerWorkforceAnnounceDash: "/employer/workforce/announce/:announcementId",
  employerWorkforceGroups: "/employer/workforce/groups",
  employerWorkforceGroup: "/employer/workforce/group/:groupId",

  // Employee Workforce - detailed routes (Phase-0)
  employeeWorkforceCompany: "/employee/workforce/company",
  employeeWorkforceAnnounceDetail: "/employee/workforce/announce/:announcementId",
  employeeWorkforceGroup: "/employee/workforce/group/:groupId",
  employeeWorkforceTimesheet: "/employee/workforce/timesheet",

  // Employer My Staff
  employerStaffDetail: "/employer/my-staff/:staffId",

  // Employee Employment
  employeeEmploymentDetail: "/employee/employment/:employmentId",

  // Employer HR Management (Purple)
  employerHRManagement: "/employer/hr",
  employerHRCandidateDetail: "/employer/hr/candidate/:hrCandidateId",

  // Employer Manager Console (Ocean Blue)
  employerConsole: "/employer/console",
  employerConsoleAttendance: "/employer/console/attendance",
  employerConsoleTaskAssign: "/employer/console/bulk-task",
  employerConsoleNotices: "/employer/console/notices",
  employerConsoleAvailability: "/employer/console/availability",
  employerConsoleRoster: "/employer/console/roster",
  employerConsoleCommandCenter: "/employer/console/command-center",
  employerConsoleIncidents: "/employer/console/incidents",

  // Employee Work Vault
  employeeVaultHome: "/employee/vault",
  employeeVaultFolder: "/employee/vault/folder/:folderId",
  employeeVaultUpload: "/employee/vault/folder/:folderId/upload",
  employeeVaultOtp: "/employee/vault/otp",
  employeeVaultAccessLog: "/employee/vault/access-log",
  employeeVaultEditProfile: "/employee/vault/edit-profile",

  // Employer Work Vault
  employerVaultLookup: "/employer/vault",
  employerVaultView: "/employer/vault/view/:employeeId",

  // Admin — all 6 tabs
  adminAlerts: "/admin/alerts",
  adminUsers: "/admin/users",
  adminAnalytics: "/admin/analytics",
  adminNotifications: "/admin/notifications",
  adminSettings: "/admin/settings",

  // Employee (Phase-0)
  employeeProfile: "/employee/profile",
  employeeNotifications: "/employee/notifications",
  employeeSettings: "/employee/settings",
  employeeHelp: "/employee/help",
  employerHelp: "/employer/help",

  // Employer Profile (Identity — Phase 1+)
  employerProfile: "/employer/profile",

  // Shift Ops (Field Ops) — feature-flagged; SQL apply separate
  employeeShiftOpsHub: "/employee/shift-ops",
  employeeShiftOpsInvite: "/employee/shift-ops/invite",
  employeeShiftOpsVerify: "/employee/shift-ops/verify",
  employeeShiftOpsPending: "/employee/shift-ops/pending",
  employeeShiftOpsAccept: "/employee/shift-ops/accept",
  employeeShiftOpsReady: "/employee/shift-ops/ready",
  employeeShiftOpsGate: "/employee/shift-ops/gate",
  employerShiftOpsApprovals: "/employer/shift-ops/approvals",
} as const;
