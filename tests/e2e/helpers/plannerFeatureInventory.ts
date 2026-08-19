/**
 * Job Mitra — Planner Module Feature Inventory (canonical checklist source)
 * Used by live-visual-planner-micro-audit.spec.ts
 *
 * Domains: Employer | Employee | Shared
 * Covers Demand/Gig Planner (teal) + Weekly Shift Planner (instance swaps).
 * Planner domain ONLY — never mix Career Jobs state/UI.
 *
 * Gaps (docs vs UI) are marked probe.type = "skip".
 */

export type PlannerInventoryItem = {
  id: string;
  domain: "Employer" | "Employee" | "Shared";
  category: string;
  name: string;
  route?: string;
  probe:
    | { type: "goto-testid"; path: string; testId: string }
    | {
        type: "goto-role";
        path: string;
        role: "button" | "link" | "heading" | "tab";
        name: string | RegExp;
      }
    | { type: "goto-text"; path: string; text: string | RegExp }
    | { type: "click-testid"; path: string; testId: string; afterTestId?: string }
    | {
        type: "click-role";
        path: string;
        role: "button" | "link";
        name: string | RegExp;
        afterText?: string | RegExp;
      }
    | { type: "storage"; key: string; expectNonEmpty?: boolean }
    | { type: "pulse-active"; path: string; flow: string; nodeId: string }
    | { type: "skip"; reason: string };
  intent: "ui" | "demo" | "dev" | "flag";
};

export const PLANNER_FEATURE_INVENTORY: PlannerInventoryItem[] = [
  // —— 1 Employer Demand Home / Timelines ——
  {
    id: "PH-E1",
    domain: "Employer",
    category: "Home",
    name: "Demand Planner Home",
    probe: {
      type: "goto-text",
      path: "/#/employer/planner/home",
      text: /Demand Planner|Plan, publish|Active|Budget|Fill/i,
    },
    intent: "ui",
  },
  {
    id: "PH-E2",
    domain: "Employer",
    category: "Home",
    name: "Agency metrics KPIs",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/home",
      testId: "planner-agency-metrics",
    },
    intent: "ui",
  },
  {
    id: "PH-E3",
    domain: "Employer",
    category: "Home",
    name: "Fill KPI",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/home",
      testId: "planner-kpi-fill",
    },
    intent: "ui",
  },
  {
    id: "PH-E4",
    domain: "Employer",
    category: "Home",
    name: "Employer command grid",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/home",
      testId: "planner-employer-command-grid",
    },
    intent: "ui",
  },
  {
    id: "PH-E5",
    domain: "Employer",
    category: "Home",
    name: "Create new plan FAB",
    probe: {
      type: "goto-role",
      path: "/#/employer/planner/home",
      role: "button",
      name: /Create new plan|New Plan/i,
    },
    intent: "ui",
  },
  {
    id: "PH-E6",
    domain: "Employer",
    category: "Home",
    name: "Status bucket — active",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/home",
      testId: "planner-status-bucket-active",
    },
    intent: "ui",
  },

  // —— 2 Plans list ——
  {
    id: "PL-E1",
    domain: "Employer",
    category: "Plans",
    name: "All Plans list",
    probe: {
      type: "goto-text",
      path: "/#/employer/planner/plans",
      text: /Demand Planner|Drafts|live crews|Plans|Active/i,
    },
    intent: "ui",
  },
  {
    id: "PL-E2",
    domain: "Employer",
    category: "Plans",
    name: "Plans status counts",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/plans",
      testId: "planner-plans-counts",
    },
    intent: "ui",
  },

  // —— 3 Create wizard / schedule grid ——
  {
    id: "WZ-E1",
    domain: "Employer",
    category: "Wizard",
    name: "Create wizard entry / Role & Team",
    probe: {
      type: "goto-text",
      path: "/#/employer/planner/new",
      text: /Step 1 of 3|Role & Team|Plan Title|Workers|Resume Draft|Start Fresh/i,
    },
    intent: "ui",
  },
  {
    id: "WZ-E2",
    domain: "Employer",
    category: "Wizard",
    name: "Resume Draft control",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/new",
      testId: "planner-resume-draft",
    },
    intent: "ui",
  },
  {
    id: "WZ-E3",
    domain: "Employer",
    category: "Wizard",
    name: "Start Fresh control",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/new",
      testId: "planner-start-fresh",
    },
    intent: "ui",
  },
  {
    id: "WZ-E4",
    domain: "Employer",
    category: "Wizard",
    name: "Schedule & Pay step (dates / working days)",
    probe: {
      type: "click-role",
      path: "/#/employer/planner/new",
      role: "button",
      name: /Next: Schedule|Schedule & Pay/i,
      afterText: /Step 2 of 3|Schedule & Pay|Start Date|Working Days|Copy first day/i,
    },
    intent: "ui",
  },
  {
    id: "WZ-E5",
    domain: "Employer",
    category: "Wizard",
    name: "Demand matrix copy-first-day",
    probe: {
      type: "goto-text",
      path: "/#/employer/planner/new",
      text: /Copy first day to all|Fill defaults|Demand|Workers/i,
    },
    intent: "ui",
  },
  {
    id: "WZ-E6",
    domain: "Employer",
    category: "Wizard",
    name: "Step 4 Budget (unwired)",
    probe: { type: "skip", reason: "DemandPlannerStep4Budget exists but not wired (doc D-03)" },
    intent: "flag",
  },
  {
    id: "WZ-E7",
    domain: "Employer",
    category: "Wizard",
    name: "Holiday skip in wizard",
    probe: { type: "skip", reason: "Holiday skip deferred (doc A1) — Working Days chips only" },
    intent: "flag",
  },

  // —— 4 Plan detail / allocation ——
  {
    id: "PD-E1",
    domain: "Employer",
    category: "Detail",
    name: "Plan detail surface",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_PLAN",
      text: /Applications|Roster|Finance|Activity|Mark as Completed|Cancel|Planner/i,
    },
    intent: "ui",
  },
  {
    id: "PD-E2",
    domain: "Employer",
    category: "Detail",
    name: "Mark as Completed CTA",
    probe: {
      type: "goto-testid",
      path: "DYNAMIC_PLAN",
      testId: "planner-detail-mark-completed",
    },
    intent: "ui",
  },
  {
    id: "PD-E3",
    domain: "Employer",
    category: "Detail",
    name: "Plan activity drawer",
    probe: {
      type: "goto-testid",
      path: "DYNAMIC_PLAN",
      testId: "planner-detail-activity",
    },
    intent: "ui",
  },
  {
    id: "PD-E4",
    domain: "Employer",
    category: "Export",
    name: "Activity Export CSV",
    probe: {
      type: "goto-testid",
      path: "DYNAMIC_PLAN",
      testId: "planner-detail-activity-export",
    },
    intent: "ui",
  },
  {
    id: "PD-E5",
    domain: "Employer",
    category: "Detail",
    name: "Full P2 calendar + day drawer",
    probe: {
      type: "skip",
      reason: "Full plan-detail calendar day drawer deferred (doc D-04) — partial only",
    },
    intent: "flag",
  },

  // —— 5 Finance ——
  {
    id: "FN-E1",
    domain: "Employer",
    category: "Finance",
    name: "Finance placeholder snapshot",
    probe: {
      type: "goto-testid",
      path: "DYNAMIC_FINANCE",
      testId: "planner-employer-finance",
    },
    intent: "ui",
  },
  {
    id: "FN-E2",
    domain: "Employer",
    category: "Finance",
    name: "Full ledger + CSV export",
    probe: { type: "skip", reason: "Full finance ledger CSV deferred (doc D-01)" },
    intent: "flag",
  },

  // —— 6 Applications / filters ——
  {
    id: "AP-E1",
    domain: "Employer",
    category: "Applications",
    name: "Batch applications page",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/applications",
      testId: "planner-employer-applications",
    },
    intent: "ui",
  },
  {
    id: "AP-E2",
    domain: "Employer",
    category: "Filters",
    name: "Batch filter — All",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/applications",
      testId: "planner-batch-filter-all",
    },
    intent: "ui",
  },
  {
    id: "AP-E3",
    domain: "Employer",
    category: "Filters",
    name: "Batch filter — Needs review",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/applications",
      testId: "planner-batch-filter-pending",
    },
    intent: "ui",
  },
  {
    id: "AP-E4",
    domain: "Employer",
    category: "Applications",
    name: "Approve All Shortlisted",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/applications",
      testId: "planner-approve-all-shortlisted",
    },
    intent: "ui",
  },

  // —— 7 Roster / assignment / unassigned ——
  {
    id: "RO-E1",
    domain: "Employer",
    category: "Roster",
    name: "Roster Management index",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner/roster",
      testId: "planner-employer-roster",
    },
    intent: "ui",
  },
  {
    id: "RO-E2",
    domain: "Employer",
    category: "Roster",
    name: "Roster detail",
    probe: {
      type: "goto-testid",
      path: "DYNAMIC_ROSTER",
      testId: "planner-employer-roster-detail",
    },
    intent: "ui",
  },
  {
    id: "RO-E3",
    domain: "Employer",
    category: "Allocation",
    name: "Unassigned roster column",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_ROSTER",
      text: /Unassigned|Roster|Drag|Workers|Role/i,
    },
    intent: "ui",
  },
  {
    id: "RO-E4",
    domain: "Employer",
    category: "Allocation",
    name: "Roster drag board",
    probe: {
      type: "goto-testid",
      path: "DYNAMIC_ROSTER",
      testId: "planner-roster-drag-board",
    },
    intent: "ui",
  },
  {
    id: "SS-X1",
    domain: "Employer",
    category: "Search",
    name: "Staff search inside Planner",
    probe: {
      type: "skip",
      reason: "Staff search lives on My Staff — not Planner domain",
    },
    intent: "flag",
  },
  {
    id: "PDT-1",
    domain: "Employer",
    category: "Filters",
    name: "Show individual plan days toggle",
    probe: {
      type: "skip",
      reason: "Plan-days toggle is on Shift My Posts (/employer/shift/posts) — not teal Planner",
    },
    intent: "flag",
  },

  // —— 8 Employee Demand Home / Browse ——
  {
    id: "PH-W1",
    domain: "Employee",
    category: "Home",
    name: "Employee Gig Projects hub",
    probe: {
      type: "goto-text",
      path: "/#/employee/planner/home",
      text: /Multi-Day Project|Gig Project|Browse|Open projects|Earnings/i,
    },
    intent: "ui",
  },
  {
    id: "PH-W2",
    domain: "Employee",
    category: "Home",
    name: "Employee command grid",
    probe: {
      type: "goto-testid",
      path: "/#/employee/planner/home",
      testId: "planner-employee-command-grid",
    },
    intent: "ui",
  },
  {
    id: "BR-W1",
    domain: "Employee",
    category: "Browse",
    name: "Browse Projects page",
    probe: {
      type: "goto-testid",
      path: "/#/employee/planner/browse",
      testId: "planner-employee-browse",
    },
    intent: "ui",
  },
  {
    id: "BR-W2",
    domain: "Employee",
    category: "Browse",
    name: "Open plans counter / mega surface",
    probe: {
      type: "goto-testid",
      path: "/#/employee/planner/browse",
      testId: "planner-browse-open-plans",
    },
    intent: "ui",
  },
  {
    id: "BR-W3",
    domain: "Employee",
    category: "Browse",
    name: "Pick days & Apply / View details CTAs",
    probe: {
      type: "goto-text",
      path: "/#/employee/planner/browse",
      text: /Pick days|View details|Gig Project|Save|Browse/i,
    },
    intent: "ui",
  },
  {
    id: "PR-W1",
    domain: "Employee",
    category: "Project",
    name: "Project detail",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_PROJECT",
      text: /Project Plan|Pick Your Days|Full-page apply|Back to Browse|days/i,
    },
    intent: "ui",
  },
  {
    id: "PR-W2",
    domain: "Employee",
    category: "Availability",
    name: "Pick&Choose calendar / conflict guard",
    probe: {
      type: "click-role",
      path: "DYNAMIC_PROJECT",
      role: "button",
      name: /Pick Your Days|Pick days/i,
      afterText: /Conflict|Available|Cancel|Apply|Earnings|Full|Confirmed/i,
    },
    intent: "ui",
  },
  {
    id: "CF-W1",
    domain: "Employee",
    category: "Alerts",
    name: "Day conflict warning",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_PROJECT",
      text: /Conflict|⚠️|conflict/i,
    },
    intent: "ui",
  },
  {
    id: "AP-W1",
    domain: "Employee",
    category: "Apply",
    name: "Full-page apply",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_APPLY",
      text: /Pick your available days|Apply|days|Project/i,
    },
    intent: "ui",
  },

  // —— 9 Employee applications / workspace / earnings ——
  {
    id: "APP-W1",
    domain: "Employee",
    category: "Applications",
    name: "My Project Applications",
    probe: {
      type: "goto-testid",
      path: "/#/employee/planner/applications",
      testId: "planner-employee-applications",
    },
    intent: "ui",
  },
  {
    id: "APP-W2",
    domain: "Employee",
    category: "Filters",
    name: "Applications tab — All",
    probe: {
      type: "goto-testid",
      path: "/#/employee/planner/applications",
      testId: "planner-applications-tab-all",
    },
    intent: "ui",
  },
  {
    id: "WS-W1",
    domain: "Employee",
    category: "Workspace",
    name: "Candidate Roster Workspace hub",
    probe: {
      type: "goto-testid",
      path: "/#/employee/planner/workspace",
      testId: "planner-employee-workspace-hub",
    },
    intent: "ui",
  },
  {
    id: "WS-W2",
    domain: "Employee",
    category: "Workspace",
    name: "Workspace day check-in",
    probe: {
      type: "goto-testid",
      path: "DYNAMIC_WS_DAY",
      testId: "planner-workspace-day",
    },
    intent: "ui",
  },
  {
    id: "EA-W1",
    domain: "Employee",
    category: "Earnings",
    name: "Project Earnings",
    probe: {
      type: "goto-testid",
      path: "/#/employee/planner/earnings",
      testId: "planner-employee-earnings",
    },
    intent: "ui",
  },

  // —— 10 Weekly Shift Planner (grids / timelines) ——
  {
    id: "WSP-E1",
    domain: "Employer",
    category: "WeeklyGrid",
    name: "Employer 7-day rolling plan",
    probe: {
      type: "goto-testid",
      path: "/#/employer/planner",
      testId: "weekly-shift-planner",
    },
    intent: "ui",
  },
  {
    id: "WSP-E2",
    domain: "Employer",
    category: "WeeklyGrid",
    name: "Weekly planner title / Open swaps",
    probe: {
      type: "goto-text",
      path: "/#/employer/planner",
      text: /7-day rolling plan|Weekly Shift Planner|Open swaps/i,
    },
    intent: "ui",
  },
  {
    id: "WSP-W1",
    domain: "Employee",
    category: "WeeklyGrid",
    name: "Employee 7-day rolling plan",
    probe: {
      type: "goto-testid",
      path: "/#/employee/planner",
      testId: "weekly-shift-planner",
    },
    intent: "ui",
  },
  {
    id: "WSP-X1",
    domain: "Shared",
    category: "Timelines",
    name: "Daily / Monthly / Today-focus switchers",
    probe: {
      type: "skip",
      reason: "Only 7-day rolling grid exists — no daily/monthly/today-focus switchers",
    },
    intent: "flag",
  },
  {
    id: "WSP-X2",
    domain: "Shared",
    category: "Allocation",
    name: "Weekly time-slot staff assignment UI",
    probe: {
      type: "skip",
      reason: "Weekly planner has no staff assignment editor — Demand roster board only",
    },
    intent: "flag",
  },
  {
    id: "WSP-X3",
    domain: "Shared",
    category: "Allocation",
    name: "Weekly unassigned slot markers",
    probe: {
      type: "skip",
      reason: "Unassigned column is on Demand roster drag board, not weekly planner",
    },
    intent: "flag",
  },

  // —— 11 Swap / leave / holiday ——
  {
    id: "SW-E1",
    domain: "Employer",
    category: "Swap",
    name: "Employer swap approval",
    probe: {
      type: "click-role",
      path: "/#/employer/planner",
      role: "button",
      name: /Open swaps/i,
      afterText: /Shift swap review|Manager approvals|Approve|Reject|awaiting|swap/i,
    },
    intent: "ui",
  },
  {
    id: "SW-E2",
    domain: "Employer",
    category: "Swap",
    name: "Swap approval empty / Approve Reject",
    probe: {
      type: "goto-text",
      path: "/#/employer/planner/swaps",
      text: /Shift swap review|Manager approvals|Approve|Reject|awaiting|Weekly planner/i,
    },
    intent: "ui",
  },
  {
    id: "SW-W1",
    domain: "Employee",
    category: "Swap",
    name: "Employee swap request",
    probe: {
      type: "goto-testid",
      path: "/#/employee/planner/swaps",
      testId: "employee-swap-request",
    },
    intent: "ui",
  },
  {
    id: "SW-W2",
    domain: "Employee",
    category: "Swap",
    name: "Submit swap request CTA",
    probe: {
      type: "goto-text",
      path: "/#/employee/planner/swaps",
      text: /Submit swap|swap request|peer|limit|24 hour/i,
    },
    intent: "ui",
  },
  {
    id: "LV-X1",
    domain: "Shared",
    category: "Leave",
    name: "Leave approval modals in Planner",
    probe: {
      type: "skip",
      reason: "Leave apply/approve is HR domain — not Planner",
    },
    intent: "flag",
  },
  {
    id: "HOL-X1",
    domain: "Shared",
    category: "Holiday",
    name: "Holiday indicators in Planner",
    probe: {
      type: "skip",
      reason: "Company holidays UI is Company config — not Planner wizard",
    },
    intent: "flag",
  },

  // —— 12 Alerts / pulse ——
  {
    id: "PU-E1",
    domain: "Employer",
    category: "Alerts",
    name: "Understaff / roster pulse surface",
    probe: {
      type: "goto-text",
      path: "/#/employer/planner/roster",
      text: /Understaff|Roster|pulse|Workers|Role|No-show|RTW/i,
    },
    intent: "ui",
  },
  {
    id: "AL-E1",
    domain: "Employer",
    category: "Alerts",
    name: "Schedule conflict / unassigned pulse (Demand)",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_ROSTER",
      text: /Unassigned|Understaff|Conflict|Roster|Workers/i,
    },
    intent: "ui",
  },

  // —— 13 Vault / storage ——
  {
    id: "VX-E1",
    domain: "Employer",
    category: "Storage",
    name: "Demand plans storage",
    probe: { type: "storage", key: "wm_employer_demand_plans_v1", expectNonEmpty: true },
    intent: "ui",
  },
  {
    id: "VX-E2",
    domain: "Shared",
    category: "Storage",
    name: "Planner public index storage",
    probe: { type: "storage", key: "wm_planner_public_index_v1", expectNonEmpty: true },
    intent: "ui",
  },
  {
    id: "VX-W1",
    domain: "Employee",
    category: "Vault",
    name: "Vault planner history key",
    probe: { type: "storage", key: "wm_vault_planner_history_v1", expectNonEmpty: false },
    intent: "ui",
  },
  {
    id: "VX-W2",
    domain: "Shared",
    category: "Vault",
    name: "Dedicated Planner vault history page",
    probe: {
      type: "skip",
      reason: "Planner epochs live inside Work Vault profile — no standalone Planner vault route",
    },
    intent: "flag",
  },
];

export const PLANNER_INVENTORY_TOTAL = PLANNER_FEATURE_INVENTORY.length;
