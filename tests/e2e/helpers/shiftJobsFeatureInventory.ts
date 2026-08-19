/**
 * Job Mitra — Shift Jobs Feature Inventory (canonical checklist source)
 * Used by live-visual-shift-micro-audit.spec.ts
 *
 * Domains: Employer | Employee | Shared
 * Status intent: ui = visual-auditable | demo = seed/demo | dev = DEV-only | flag = feature-flagged
 */

export type InventoryItem = {
  id: string;
  domain: "Employer" | "Employee" | "Shared";
  category: string;
  name: string;
  route?: string;
  probe:
    | { type: "goto-testid"; path: string; testId: string }
    | { type: "goto-role"; path: string; role: "button" | "link" | "heading" | "tab"; name: string | RegExp }
    | { type: "goto-text"; path: string; text: string | RegExp }
    | { type: "click-testid"; path: string; testId: string; afterTestId?: string }
    | { type: "click-role"; path: string; role: "button" | "link"; name: string | RegExp; afterText?: string | RegExp }
    | { type: "storage"; key: string; expectNonEmpty?: boolean }
    | { type: "pulse-active"; path: string; flow: string; nodeId: string }
    | { type: "skip"; reason: string };
  intent: "ui" | "demo" | "dev" | "flag";
};

export const SHIFT_JOBS_FEATURE_INVENTORY: InventoryItem[] = [
  // —— 1 Navigation / Home ——
  {
    id: "NAV-E1",
    domain: "Employer",
    category: "Navigation",
    name: "Employer Shift Home",
    probe: { type: "goto-text", path: "/#/employer/shift", text: /Shift Jobs|New Shift|My Posts/i },
    intent: "ui",
  },
  {
    id: "NAV-E2",
    domain: "Employer",
    category: "Navigation",
    name: "New Shift CTA",
    probe: { type: "goto-role", path: "/#/employer/shift", role: "button", name: /New Shift/i },
    intent: "ui",
  },
  {
    id: "NAV-E3",
    domain: "Employer",
    category: "Navigation",
    name: "Quick action My Posts",
    probe: { type: "goto-testid", path: "/#/employer/shift", testId: "shift-home-quick-posts" },
    intent: "ui",
  },
  {
    id: "NAV-E4",
    domain: "Employer",
    category: "Navigation",
    name: "Quick action Work Groups",
    probe: { type: "goto-testid", path: "/#/employer/shift", testId: "shift-home-quick-groups" },
    intent: "ui",
  },
  {
    id: "NAV-E5",
    domain: "Employer",
    category: "Navigation",
    name: "Quick action Favorites",
    probe: { type: "goto-testid", path: "/#/employer/shift", testId: "shift-home-quick-favorites" },
    intent: "ui",
  },
  {
    id: "NAV-E6",
    domain: "Employer",
    category: "Navigation",
    name: "My Posts page",
    probe: { type: "goto-testid", path: "/#/employer/shift/posts", testId: "shift-posts-page" },
    intent: "ui",
  },
  {
    id: "NAV-E7",
    domain: "Employer",
    category: "Navigation",
    name: "Employer Workspaces list",
    probe: {
      type: "goto-testid",
      path: "/#/employer/shift/workspaces",
      testId: "employer-shift-workspaces-page",
    },
    intent: "ui",
  },
  {
    id: "NAV-W1",
    domain: "Employee",
    category: "Navigation",
    name: "Shift Control Center / Home",
    probe: { type: "goto-testid", path: "/#/employee/shift", testId: "shift-jobs-home-page" },
    intent: "ui",
  },
  {
    id: "NAV-W3",
    domain: "Employee",
    category: "Navigation",
    name: "Find Shifts entry",
    probe: { type: "goto-role", path: "/#/employee/shift", role: "button", name: /Find Shifts/i },
    intent: "ui",
  },
  {
    id: "NAV-W4",
    domain: "Employee",
    category: "Navigation",
    name: "My Applications entry",
    probe: { type: "goto-role", path: "/#/employee/shift", role: "button", name: /My Applications|Applications/i },
    intent: "ui",
  },

  // —— 2 Create / Draft / Publish ——
  {
    id: "CR-E1",
    domain: "Employer",
    category: "Create",
    name: "Create wizard page",
    probe: { type: "goto-testid", path: "/#/employer/shift/create", testId: "employer-shift-create-page" },
    intent: "ui",
  },
  {
    id: "CR-E2",
    domain: "Employer",
    category: "Create",
    name: "Save Draft control",
    probe: { type: "goto-testid", path: "/#/employer/shift/create", testId: "shift-create-save-draft" },
    intent: "ui",
  },
  {
    id: "CR-E3",
    domain: "Employer",
    category: "Create",
    name: "Wizard Next control",
    probe: { type: "goto-testid", path: "/#/employer/shift/create", testId: "shift-create-wizard-next" },
    intent: "ui",
  },
  {
    id: "CR-E12",
    domain: "Employer",
    category: "Create",
    name: "Nearby availability card",
    probe: {
      type: "goto-testid",
      path: "/#/employer/shift/create",
      testId: "shift-create-nearby-availability-card",
    },
    intent: "ui",
  },
  {
    id: "CR-E13",
    domain: "Employer",
    category: "Create",
    name: "Templates library page",
    probe: {
      type: "goto-testid",
      path: "/#/employer/shift/templates",
      testId: "employer-shift-templates-page",
    },
    intent: "ui",
  },
  {
    id: "CR-E17",
    domain: "Employer",
    category: "Create",
    name: "Posts status filter",
    probe: { type: "goto-testid", path: "/#/employer/shift/posts", testId: "shift-posts-status-filter" },
    intent: "ui",
  },
  {
    id: "CR-E18",
    domain: "Employer",
    category: "Create",
    name: "Posts plan-days toggle",
    probe: { type: "goto-testid", path: "/#/employer/shift/posts", testId: "shift-posts-plan-days-toggle" },
    intent: "ui",
  },
  {
    id: "CR-E19",
    domain: "Employer",
    category: "Create",
    name: "Posts KPI grid",
    probe: { type: "goto-testid", path: "/#/employer/shift/posts", testId: "shift-posts-kpi-grid" },
    intent: "ui",
  },

  // —— 3 Search / Filters ——
  {
    id: "SR-W1",
    domain: "Employee",
    category: "Search",
    name: "Shift Search page",
    probe: { type: "goto-testid", path: "/#/employee/shift/search", testId: "shift-search-page" },
    intent: "ui",
  },
  {
    id: "SR-W2",
    domain: "Employee",
    category: "Search",
    name: "Search query input",
    probe: { type: "goto-testid", path: "/#/employee/shift/search", testId: "shift-search-query" },
    intent: "ui",
  },
  {
    id: "SR-W3",
    domain: "Employee",
    category: "Search",
    name: "Date range filter chips",
    probe: { type: "goto-text", path: "/#/employee/shift/search", text: /Today|Next 3|This week|Weekend|All dates/i },
    intent: "ui",
  },
  {
    id: "SR-W4",
    domain: "Employee",
    category: "Search",
    name: "Experience / worker-type filters",
    probe: { type: "goto-text", path: "/#/employee/shift/search", text: /Helper|Experienced|No experience|Any/i },
    intent: "ui",
  },
  {
    id: "SR-W6",
    domain: "Employee",
    category: "Search",
    name: "Duration filters",
    probe: { type: "goto-text", path: "/#/employee/shift/search", text: /1 day|Multi-day|Duration/i },
    intent: "ui",
  },
  {
    id: "SR-W7",
    domain: "Employee",
    category: "Search",
    name: "Clear filters control",
    probe: {
      type: "click-role",
      path: "/#/employee/shift/search",
      role: "button",
      name: /Today/i,
      afterText: /Clear/i,
    },
    intent: "ui",
  },
  {
    id: "SR-W8",
    domain: "Employee",
    category: "Search",
    name: "Search results / available shifts",
    probe: { type: "goto-text", path: "/#/employee/shift/search", text: /Available Shifts|shift-search-result|of .* shift|Quick Apply|View Details/i },
    intent: "ui",
  },
  {
    id: "SR-W10",
    domain: "Employee",
    category: "Search",
    name: "Profile Fit / Smart Match section",
    probe: { type: "goto-text", path: "/#/employee/shift/search", text: /Profile Fit|Recommended|Available Now|Match|fit/i },
    intent: "ui",
  },
  {
    id: "SR-W11",
    domain: "Employee",
    category: "Search",
    name: "Save this search (job alert)",
    probe: { type: "goto-role", path: "/#/employee/shift/search", role: "button", name: /Save this search/i },
    intent: "ui",
  },

  // —— 4 Apply / Withdraw ——
  {
    id: "AP-W1",
    domain: "Employee",
    category: "Apply",
    name: "Shift post details page",
    probe: { type: "goto-testid", path: "DYNAMIC_POST", testId: "shift-post-details-page" },
    intent: "ui",
  },
  {
    id: "AP-W5",
    domain: "Employee",
    category: "Apply",
    name: "Submit Application / Apply CTA",
    probe: { type: "goto-text", path: "DYNAMIC_POST", text: /Submit Application|Apply|Already applied|Quick Apply/i },
    intent: "ui",
  },
  {
    id: "AP-W8",
    domain: "Employee",
    category: "Apply",
    name: "Quick Apply on search card",
    probe: { type: "goto-role", path: "/#/employee/shift/search", role: "button", name: /Quick Apply|Applied/i },
    intent: "ui",
  },
  {
    id: "AP-W10",
    domain: "Employee",
    category: "Withdraw",
    name: "Withdraw application control",
    probe: { type: "goto-role", path: "/#/employee/shift/applications", role: "button", name: /Withdraw/i },
    intent: "ui",
  },

  // —— 5 Applications tracker ——
  {
    id: "AT-W1",
    domain: "Employee",
    category: "Applications",
    name: "Applications page",
    probe: { type: "goto-testid", path: "/#/employee/shift/applications", testId: "shift-applications-page" },
    intent: "ui",
  },
  {
    id: "AT-W2",
    domain: "Employee",
    category: "Applications",
    name: "Applications tabs",
    probe: { type: "goto-testid", path: "/#/employee/shift/applications", testId: "shift-applications-tabs" },
    intent: "ui",
  },
  {
    id: "AT-W4",
    domain: "Employee",
    category: "Applications",
    name: "Status badges Applied/Shortlisted/Confirmed",
    probe: {
      type: "goto-text",
      path: "/#/employee/shift/applications",
      text: /Applied|Shortlisted|Confirmed|Waiting|Backup|Withdrawn/i,
    },
    intent: "ui",
  },

  // —— 6 Employer dashboard tabs ——
  {
    id: "DB-E1",
    domain: "Employer",
    category: "Dashboard",
    name: "Post dashboard shell",
    probe: { type: "goto-testid", path: "DYNAMIC_DASH", testId: "employer-shift-dashboard-page" },
    intent: "ui",
  },
  {
    id: "DB-E2",
    domain: "Employer",
    category: "Dashboard",
    name: "Dashboard tabs shell",
    probe: { type: "goto-testid", path: "DYNAMIC_DASH", testId: "shift-dashboard-tabs" },
    intent: "ui",
  },
  {
    id: "DB-E3",
    domain: "Employer",
    category: "Dashboard",
    name: "Applied tab",
    probe: { type: "click-role", path: "DYNAMIC_DASH", role: "button", name: /^Applied\b/ },
    intent: "ui",
  },
  {
    id: "DB-E4",
    domain: "Employer",
    category: "Dashboard",
    name: "Shortlisted tab",
    probe: { type: "click-role", path: "DYNAMIC_DASH", role: "button", name: /^Shortlisted\b/ },
    intent: "ui",
  },
  {
    id: "DB-E5",
    domain: "Employer",
    category: "Dashboard",
    name: "Backup tab",
    probe: { type: "click-role", path: "DYNAMIC_DASH", role: "button", name: /^Backup\b/ },
    intent: "ui",
  },
  {
    id: "DB-E6",
    domain: "Employer",
    category: "Dashboard",
    name: "Selected tab",
    probe: { type: "click-role", path: "DYNAMIC_DASH", role: "button", name: /^Selected\b/ },
    intent: "ui",
  },
  {
    id: "DB-E7",
    domain: "Employer",
    category: "Dashboard",
    name: "Rejected tab",
    probe: { type: "click-role", path: "DYNAMIC_DASH", role: "button", name: /^Rejected\b/ },
    intent: "ui",
  },

  // —— 7 Candidate actions ——
  {
    id: "AC-E1",
    domain: "Employer",
    category: "Actions",
    name: "Shortlist button",
    probe: { type: "goto-role", path: "DYNAMIC_DASH", role: "button", name: "Shortlist" },
    intent: "ui",
  },
  {
    id: "AC-E2",
    domain: "Employer",
    category: "Actions",
    name: "Reject button",
    probe: { type: "goto-role", path: "DYNAMIC_DASH", role: "button", name: "Reject" },
    intent: "ui",
  },
  {
    id: "AC-E3",
    domain: "Employer",
    category: "Actions",
    name: "Confirm Worker / Open Group",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_DASH",
      role: "button",
      name: /Confirm Worker|Open Group/i,
    },
    intent: "ui",
  },

  // —— 8 Favorites ——
  {
    id: "FV-E1",
    domain: "Employer",
    category: "Favorites",
    name: "Favorites page",
    probe: { type: "goto-testid", path: "/#/employer/shift/favorites", testId: "employer-favorites-page" },
    intent: "ui",
  },
  {
    id: "FV-E2",
    domain: "Employer",
    category: "Favorites",
    name: "Add favorite by Mitra Labs ID",
    probe: { type: "goto-testid", path: "/#/employer/shift/favorites", testId: "employer-favorites-add" },
    intent: "ui",
  },
  {
    id: "FV-W1",
    domain: "Employee",
    category: "Favorites",
    name: "Employee favorite/save shift control",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_POST",
      role: "button",
      name: /Favorite|Save|Saved|Unsave|Bookmarks|♥|♡/i,
    },
    intent: "ui",
  },
  {
    id: "FV-W1-STORE",
    domain: "Employee",
    category: "Favorites",
    name: "Favorite shifts storage key",
    probe: { type: "storage", key: "wm_employee_shift_favorites_v1" },
    intent: "ui",
  },

  // —— 9 Workspaces / Communication ——
  {
    id: "WS-E2",
    domain: "Employer",
    category: "Communication",
    name: "Employer workspace detail",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_WS_EMP",
      text: /Broadcast|Reply|Mark Completed|Call|Workspace|Employer Controls/i,
    },
    intent: "ui",
  },
  {
    id: "WS-E3",
    domain: "Employer",
    category: "Communication",
    name: "Broadcast control",
    probe: { type: "goto-role", path: "DYNAMIC_WS_EMP", role: "button", name: "Broadcast" },
    intent: "ui",
  },
  {
    id: "WS-E4",
    domain: "Employer",
    category: "Communication",
    name: "Reply control",
    probe: { type: "goto-role", path: "DYNAMIC_WS_EMP", role: "button", name: /Reply/i },
    intent: "ui",
  },
  {
    id: "WS-E5",
    domain: "Employer",
    category: "Communication",
    name: "Call worker control",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_WS_EMP",
      role: "button",
      name: /^Call/i,
    },
    intent: "ui",
  },
  {
    id: "WS-W1",
    domain: "Employee",
    category: "Communication",
    name: "Employee workspaces list",
    probe: { type: "goto-testid", path: "/#/employee/shift/workspaces", testId: "my-shift-workspaces-page" },
    intent: "ui",
  },
  {
    id: "WS-W2",
    domain: "Employee",
    category: "Communication",
    name: "Employee workspace detail",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_WS_EE",
      text: /Workspace|Updates|Reply|Rate|Exit|Status/i,
    },
    intent: "ui",
  },
  {
    id: "WS-W3",
    domain: "Employee",
    category: "Communication",
    name: "Workspace updates feed",
    probe: { type: "goto-testid", path: "DYNAMIC_WS_EE", testId: "shift-workspace-updates" },
    intent: "ui",
  },
  {
    id: "WS-DEMO",
    domain: "Employee",
    category: "Communication",
    name: "Demo workspace seed",
    probe: { type: "skip", reason: "DEMO-only auto-seed when workspaces empty" },
    intent: "demo",
  },

  // —— 10 Complete / Close / Cancel ——
  {
    id: "CL-E1",
    domain: "Employer",
    category: "Lifecycle",
    name: "Close Post control",
    probe: { type: "goto-role", path: "DYNAMIC_DASH", role: "button", name: /Close Post/i },
    intent: "ui",
  },
  {
    id: "CL-E3",
    domain: "Employer",
    category: "Lifecycle",
    name: "Mark Completed control",
    probe: { type: "goto-role", path: "DYNAMIC_WS_EMP", role: "button", name: /Mark Completed|Mark Shift as Complete/i },
    intent: "ui",
  },
  {
    id: "CL-W2",
    domain: "Employee",
    category: "Lifecycle",
    name: "Workspace exit (emergency flag path)",
    probe: { type: "goto-testid", path: "DYNAMIC_WS_EE", testId: "shift-workspace-exit" },
    intent: "ui",
  },

  // —— 11 Ratings ——
  {
    id: "RT-E1",
    domain: "Employer",
    category: "Ratings",
    name: "Rate Worker control",
    probe: { type: "goto-role", path: "DYNAMIC_WS_EMP", role: "button", name: /Rate Worker|Rate Workers/i },
    intent: "ui",
  },
  {
    id: "RT-W1",
    domain: "Employee",
    category: "Ratings",
    name: "Rate Employer section",
    probe: { type: "goto-testid", path: "DYNAMIC_WS_EE", testId: "shift-workspace-rating" },
    intent: "ui",
  },

  // —— 12 Vault / History ——
  {
    id: "VH-W1",
    domain: "Employee",
    category: "Vault",
    name: "Vault shift history storage",
    probe: { type: "storage", key: "wm_vault_shift_history_v1", expectNonEmpty: true },
    intent: "ui",
  },
  {
    id: "VH-W1-UI",
    domain: "Employee",
    category: "Vault",
    name: "Employee Vault page",
    probe: { type: "goto-text", path: "/#/employee/vault", text: /Vault|Work Vault|Shift|History|Completed/i },
    intent: "ui",
  },
  {
    id: "VH-W5",
    domain: "Employee",
    category: "Vault",
    name: "Shift earnings page",
    probe: { type: "goto-testid", path: "/#/employee/shift/earnings", testId: "shift-earnings-page" },
    intent: "ui",
  },
  {
    id: "VH-W6",
    domain: "Employee",
    category: "Vault",
    name: "Personal calendar shift storage",
    probe: { type: "storage", key: "wm_employee_personal_calendar_shift_v1" },
    intent: "ui",
  },

  // —— 13 Pulse / Notifications ——
  {
    id: "PL-S1",
    domain: "Shared",
    category: "Pulse",
    name: "Breathing light data-pulse-active on employer home",
    probe: {
      type: "pulse-active",
      path: "/#/employer",
      flow: "new_shift_application",
      nodeId: "home-shift-card",
    },
    intent: "ui",
  },
  {
    id: "PL-S9",
    domain: "Shared",
    category: "Pulse",
    name: "Notification bell surface",
    probe: {
      type: "goto-role",
      path: "/#/employee",
      role: "button",
      name: /notification|bell|Alerts/i,
    },
    intent: "ui",
  },
  {
    id: "PL-S10",
    domain: "Shared",
    category: "Pulse",
    name: "QA pulse shift seed",
    probe: { type: "skip", reason: "DEV/QA-only God Mode seed" },
    intent: "dev",
  },

  // —— 14 Invites / Availability / Radar ——
  {
    id: "AV-E1",
    domain: "Employer",
    category: "Availability",
    name: "Local Workers Radar card",
    probe: { type: "goto-testid", path: "/#/employer/shift", testId: "local-workers-radar-card" },
    intent: "ui",
  },
  {
    id: "AV-W1",
    domain: "Employee",
    category: "Availability",
    name: "Availability broadcast card",
    probe: {
      type: "goto-testid",
      path: "/#/employee/shift/search",
      testId: "shift-availability-broadcast-card",
    },
    intent: "ui",
  },
  {
    id: "IN-W1",
    domain: "Employee",
    category: "Invites",
    name: "Direct invite accept card",
    probe: {
      type: "goto-testid",
      path: "/#/employee/shift",
      testId: "shift-direct-invite-accept-card",
    },
    intent: "ui",
  },
  {
    id: "AV-DBG",
    domain: "Shared",
    category: "Availability",
    name: "Availability sync debug chip",
    probe: { type: "skip", reason: "DEV debug chip only" },
    intent: "dev",
  },

  // —— 15 Safety ——
  {
    id: "SF-E1",
    domain: "Employer",
    category: "Safety",
    name: "Contact platform lock strip",
    probe: { type: "goto-testid", path: "DYNAMIC_DASH", testId: "shift-contact-platform-lock" },
    intent: "ui",
  },
  {
    id: "SF-CALL",
    domain: "Shared",
    category: "Safety",
    name: "Gated call (locked or unlocked)",
    probe: { type: "goto-role", path: "DYNAMIC_WS_EMP", role: "button", name: /Call/i },
    intent: "ui",
  },

  // —— 16 Settings ——
  {
    id: "ST-W1",
    domain: "Employee",
    category: "Settings",
    name: "Quick Apply settings toggle",
    probe: {
      type: "goto-text",
      path: "/#/employee/settings",
      text: /Quick Apply|Preferences|Settings|Notifications/i,
    },
    intent: "ui",
  },
  {
    id: "ST-W1-STORE",
    domain: "Employee",
    category: "Settings",
    name: "quickApplyEnabled storage",
    probe: { type: "storage", key: "wm_employee_settings_v1", expectNonEmpty: true },
    intent: "ui",
  },
  {
    id: "ST-FF1",
    domain: "Shared",
    category: "Settings",
    name: "Shift Ops feature flag routes",
    probe: { type: "skip", reason: "Feature-flagged adjacent module (Shift Ops)" },
    intent: "flag",
  },
];
