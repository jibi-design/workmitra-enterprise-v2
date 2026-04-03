// src/app/router/routePaths.ts
export const ROUTE_PATHS = {
  landing: "/",
  employeeHome: "/employee",
  employerHome: "/employer",
  adminHome: "/admin",

  // Employee domain entries
  employeeShiftCenter: "/employee/shift",
  employeeCareerHome: "/employee/career",
  employeeWorkforceHome: "/employee/workforce",

  // Employee Shift (Temporary) - detailed routes (Phase-0)
  employeeShiftSearch: "/employee/shift/search",
  employeeShiftPostDetails: "/employee/shift/post/:postId",
  employeeShiftApplications: "/employee/shift/applications",
  employeeShiftWorkspaces: "/employee/shift/workspaces",
  employeeShiftWorkspace: "/employee/shift/workspace/:workspaceId",
  employeeShiftEarnings: "/employee/shift/earnings",

  // Employer domain entries
  employerShiftHome: "/employer/shift",
  employerCareerHome: "/employer/career",
  employerWorkforceHome: "/employer/workforce",
  employerSettings: "/employer/settings",
  employerNotifications: "/employer/notifications",
  employerMyStaff: "/employer/my-staff",

  // Employer Career - detailed routes (Phase-0)
  employerCareerCreate: "/employer/career/create",
  employerCareerPostDashboard: "/employer/career/post/:postId",
  employerCareerCandidateDetail: "/employer/career/post/:postId/candidate/:appId",
  employerCareerInterviews: "/employer/career/post/:postId/interviews",

  // Employee Career - detailed routes (Phase-0)
  employeeCareerSearch: "/employee/career/search",
  employeeCareerPostDetails: "/employee/career/post/:postId",
  employeeCareerApplications: "/employee/career/applications",
  employeeCareerWorkspace: "/employee/career/workspace/:workspaceId",

  // Employer Shift (Temporary) - detailed routes (Phase-0)
  employerShiftCreate: "/employer/shift/create",
  employerShiftPostDashboard: "/employer/shift/post/:postId",
  employerCandidateDetail: "/employer/shift/post/:postId/candidate/:appId",
  employerShiftShortlist: "/employer/shift/post/:postId/shortlist",
  employerShiftWorkspaces: "/employer/shift/workspaces",
  employerShiftWorkspace: "/employer/shift/workspace/:workspaceId",
  employerShiftPosts: "/employer/shift/posts",
  employerShiftFavorites: "/employer/shift/favorites",
  employerShiftTemplates: "/employer/shift/templates",
  employerShiftDemandPlanner: "/employer/shift/demand-planner",

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
} as const;