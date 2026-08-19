/**
 * Job Mitra — Career Module Feature Inventory (canonical checklist source)
 * Used by live-visual-career-micro-audit.spec.ts
 *
 * Domains: Employer | Employee | Shared
 * Intent: ui = visual-auditable | demo = seed/demo | dev = DEV-only | flag = feature-flagged
 *
 * Career Jobs ONLY — never mix with Shift Jobs state/UI.
 */

export type CareerInventoryItem = {
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

export const CAREER_FEATURE_INVENTORY: CareerInventoryItem[] = [
  // —— 1 Navigation / Home ——
  {
    id: "NAV-CE1",
    domain: "Employer",
    category: "Navigation",
    name: "Employer Career Home (active)",
    probe: { type: "goto-testid", path: "/#/employer/career", testId: "employer-career-home-active" },
    intent: "ui",
  },
  {
    id: "NAV-CE5",
    domain: "Employer",
    category: "Navigation",
    name: "Create Career Job CTA",
    probe: {
      type: "goto-role",
      path: "/#/employer/career",
      role: "button",
      name: /Create Career Job|Create Job/i,
    },
    intent: "ui",
  },
  {
    id: "NAV-CE7",
    domain: "Employer",
    category: "Navigation",
    name: "Career Posts page",
    probe: {
      type: "goto-testid",
      path: "/#/employer/career/posts",
      testId: "employer-career-posts-page",
    },
    intent: "ui",
  },
  {
    id: "NAV-CE8",
    domain: "Employer",
    category: "Navigation",
    name: "Completed Records page",
    probe: {
      type: "goto-testid",
      path: "/#/employer/career/completed-records",
      testId: "employer-career-completed-records",
    },
    intent: "ui",
  },
  {
    id: "NAV-CW1",
    domain: "Employee",
    category: "Navigation",
    name: "Employee Career Home",
    probe: {
      type: "goto-text",
      path: "/#/employee/career",
      text: /Career Jobs|Build your long-term|Find Career/i,
    },
    intent: "ui",
  },
  {
    id: "NAV-CW2",
    domain: "Employee",
    category: "Navigation",
    name: "Header Find Career Jobs pill",
    probe: {
      type: "goto-role",
      path: "/#/employee/career",
      role: "button",
      name: /Find Career Jobs/i,
    },
    intent: "ui",
  },
  {
    id: "NAV-CW3",
    domain: "Employee",
    category: "Navigation",
    name: "Find Career Jobs CTA",
    probe: {
      type: "goto-role",
      path: "/#/employee/career",
      role: "button",
      name: /Find Career Jobs/i,
    },
    intent: "ui",
  },
  {
    id: "NAV-CW4",
    domain: "Employee",
    category: "Navigation",
    name: "My Applications CTA",
    probe: {
      type: "goto-role",
      path: "/#/employee/career",
      role: "button",
      name: /My Applications|Applications/i,
    },
    intent: "ui",
  },
  {
    id: "NAV-SH1",
    domain: "Shared",
    category: "Navigation",
    name: "Guest careers browse",
    probe: { type: "goto-text", path: "/#/careers", text: /Career|Jobs|Browse/i },
    intent: "ui",
  },

  // —— 2 Dashboard / Status ——
  {
    id: "DB-CE1",
    domain: "Employer",
    category: "Dashboard",
    name: "Employer Career hero / KPI surface",
    probe: {
      type: "goto-text",
      path: "/#/employer/career",
      text: /Employer Career|Interviews|Career Jobs|Active/i,
    },
    intent: "ui",
  },
  {
    id: "DB-CE5",
    domain: "Employer",
    category: "Dashboard",
    name: "Draft reminder Resume Draft",
    probe: {
      type: "goto-role",
      path: "/#/employer/career",
      role: "button",
      name: /Resume Draft/i,
    },
    intent: "ui",
  },
  {
    id: "DB-CW1",
    domain: "Employee",
    category: "Dashboard",
    name: "Home metrics Open roles / Applications",
    probe: {
      type: "goto-text",
      path: "/#/employee/career",
      text: /Open roles|Applications|Next steps|Workspace/i,
    },
    intent: "ui",
  },
  {
    id: "DB-CW2",
    domain: "Employee",
    category: "Dashboard",
    name: "Applications KPI tiles",
    probe: {
      type: "goto-text",
      path: "/#/employee/career/applications",
      text: /Active|Interview|Offers|Closed|Confirmed|Applied/i,
    },
    intent: "ui",
  },

  // —— 3 Create ——
  {
    id: "CR-CE1",
    domain: "Employer",
    category: "Create",
    name: "Create wizard page",
    probe: {
      type: "goto-text",
      path: "/#/employer/career/create",
      text: /Publish a stable Career Job|Basic Info|Career Job/i,
    },
    intent: "ui",
  },
  {
    id: "CR-CE2",
    domain: "Employer",
    category: "Create",
    name: "Step Basic Info",
    probe: {
      type: "goto-text",
      path: "/#/employer/career/create",
      text: /Basic Info/i,
    },
    intent: "ui",
  },
  {
    id: "CR-CE6",
    domain: "Employer",
    category: "Create",
    name: "Skills Required field (create)",
    probe: {
      type: "goto-text",
      path: "/#/employer/career/create",
      text: /Skills Required|Skills/i,
    },
    intent: "ui",
  },
  {
    id: "CR-CE8",
    domain: "Employer",
    category: "Create",
    name: "Save Draft control",
    probe: {
      type: "goto-role",
      path: "/#/employer/career/create",
      role: "button",
      name: /Save Draft/i,
    },
    intent: "ui",
  },
  {
    id: "CR-CE9",
    domain: "Employer",
    category: "Create",
    name: "Wizard Next control",
    probe: {
      type: "goto-role",
      path: "/#/employer/career/create",
      role: "button",
      name: /^Next$/i,
    },
    intent: "ui",
  },
  {
    id: "CR-CE10",
    domain: "Employer",
    category: "Create",
    name: "Publish Job control (may be later step)",
    probe: {
      type: "goto-role",
      path: "/#/employer/career/create",
      role: "button",
      name: /Publish Job|Publish/i,
    },
    intent: "ui",
  },

  // —— 4 Search / Listings ——
  {
    id: "SR-CW1",
    domain: "Employee",
    category: "Search",
    name: "Career Search page",
    probe: {
      type: "goto-text",
      path: "/#/employee/career/search",
      text: /Find your next career|Career Search|Search/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW2",
    domain: "Employee",
    category: "Search",
    name: "Search workspace / inputs",
    probe: {
      type: "goto-text",
      path: "/#/employee/career/search",
      text: /Search workspace|Job title|Location|Search/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW3",
    domain: "Employee",
    category: "Search",
    name: "Filters toggle",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /Filters/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW4",
    domain: "Employee",
    category: "Search",
    name: "Job type filter chips",
    probe: {
      type: "click-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /Filters/i,
      afterText: /All types|Full-time|Part-time|Contract/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW5",
    domain: "Employee",
    category: "Search",
    name: "Work mode filter chips",
    probe: {
      type: "click-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /Filters/i,
      afterText: /All modes|On-site|Remote|Hybrid/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW6",
    domain: "Employee",
    category: "Search",
    name: "Experience filter chips",
    probe: {
      type: "click-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /Filters/i,
      afterText: /0-1|1-3|3-7|7\+|Experience/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW7",
    domain: "Employee",
    category: "Search",
    name: "Clear filters",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /Clear filters/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW8",
    domain: "Employee",
    category: "Search",
    name: "Save Search",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /Save Search/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW9",
    domain: "Employee",
    category: "Search",
    name: "Tab Search",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /^Search$/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW10",
    domain: "Employee",
    category: "Search",
    name: "Tab Recent",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /Recent|Recently Viewed/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW11",
    domain: "Employee",
    category: "Search",
    name: "Tab Saved",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /^Saved$|Saved Jobs/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW12",
    domain: "Employee",
    category: "Search",
    name: "Tab Applied",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /^Applied$|Applied Jobs/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW13",
    domain: "Employee",
    category: "Search",
    name: "Job card Save control",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /Save job|Unsave job|Save/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CW14",
    domain: "Employee",
    category: "Search",
    name: "Job card View Details",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /View Details|View Application/i,
    },
    intent: "ui",
  },
  {
    id: "SR-CE1",
    domain: "Employer",
    category: "Search",
    name: "Employer posts list",
    probe: {
      type: "goto-testid",
      path: "/#/employer/career/posts",
      testId: "employer-career-posts-page",
    },
    intent: "ui",
  },
  {
    id: "SR-CE2",
    domain: "Employer",
    category: "Search",
    name: "Posts filter grid",
    probe: {
      type: "goto-testid",
      path: "/#/employer/career/posts",
      testId: "career-posts-filter-grid",
    },
    intent: "ui",
  },
  {
    id: "SR-CE3",
    domain: "Employer",
    category: "Search",
    name: "Posts text search",
    probe: {
      type: "goto-text",
      path: "/#/employer/career/posts",
      text: /Search by job, company|Posts|Active|Draft|Filter/i,
    },
    intent: "ui",
  },
  {
    id: "GAP-SR1",
    domain: "Employee",
    category: "Search",
    name: "Salary range filter chip",
    probe: { type: "skip", reason: "No dedicated salary-range filter UI (salary on post/create only)" },
    intent: "ui",
  },

  // —— 5 Apply / Applications ——
  {
    id: "AP-CW1",
    domain: "Employee",
    category: "Apply",
    name: "Post details page",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_POST",
      text: /Operations Executive|Apply|Job|Company/i,
    },
    intent: "ui",
  },
  {
    id: "AP-CW3",
    domain: "Employee",
    category: "Apply",
    name: "Skills tags on post details",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_POST",
      text: /Skills|Operations|Communication/i,
    },
    intent: "ui",
  },
  {
    id: "AP-CW5",
    domain: "Employee",
    category: "Apply",
    name: "Apply form surface",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_POST",
      text: /Apply for this position|Cover|Submit Application|Already applied|Withdraw|Application status/i,
    },
    intent: "ui",
  },
  {
    id: "AP-CW6",
    domain: "Employee",
    category: "Apply",
    name: "Submit Application CTA",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_POST",
      role: "button",
      name: /Submit Application|Apply/i,
    },
    intent: "ui",
  },
  {
    id: "AP-CW7",
    domain: "Employee",
    category: "Apply",
    name: "Already applied / Withdraw on details",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_POST",
      role: "button",
      name: /Withdraw/i,
    },
    intent: "ui",
  },
  {
    id: "AP-CW9",
    domain: "Employee",
    category: "Applications",
    name: "Applications page",
    probe: {
      type: "goto-text",
      path: "/#/employee/career/applications",
      text: /Applications|My Applications|Active|Interview/i,
    },
    intent: "ui",
  },
  {
    id: "AP-CW10",
    domain: "Employee",
    category: "Applications",
    name: "Filter tabs Active/Interview/Offers",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/applications",
      role: "button",
      name: /Active|Interview|Offers|Closed|All/i,
    },
    intent: "ui",
  },
  {
    id: "AP-CW11",
    domain: "Employee",
    category: "Applications",
    name: "Status stepper Applied→Shortlist→Interview",
    probe: {
      type: "goto-text",
      path: "/#/employee/career/applications",
      text: /Applied|Shortlist|Interview|Decision/i,
    },
    intent: "ui",
  },
  {
    id: "AP-CW12",
    domain: "Employee",
    category: "Applications",
    name: "Withdraw on applications list",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/applications",
      role: "button",
      name: /Withdraw/i,
    },
    intent: "ui",
  },
  {
    id: "AP-CE1",
    domain: "Employer",
    category: "Applications",
    name: "Applicant quick-view control",
    probe: {
      type: "goto-testid",
      path: "DYNAMIC_DASH",
      testId: "DYNAMIC_QUICK_VIEW",
    },
    intent: "ui",
  },
  {
    id: "GAP-AP1",
    domain: "Employee",
    category: "Apply",
    name: "Portfolio builder / CV file upload",
    probe: {
      type: "skip",
      reason: "Cover note + resumeSummary only — no dedicated portfolio/CV upload UI",
    },
    intent: "ui",
  },
  {
    id: "GAP-AP2",
    domain: "Employee",
    category: "Applications",
    name: "Exact Under Review / Hired / Rejected tracker labels",
    probe: {
      type: "skip",
      reason: "Uses Active|Interview|Offers|Closed tabs + Applied|Shortlist|Interview|Decision stepper",
    },
    intent: "demo",
  },

  // —— 6 Dashboard pipeline / Actions ——
  {
    id: "DB-CE8",
    domain: "Employer",
    category: "Dashboard",
    name: "Candidate Command Center",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_DASH",
      text: /Candidate Command Center|Applied|Shortlist|Interview/i,
    },
    intent: "ui",
  },
  {
    id: "AC-CE18",
    domain: "Employer",
    category: "Actions",
    name: "Pipeline tab Applied",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_DASH",
      text: /Applied|New queue/i,
    },
    intent: "ui",
  },
  {
    id: "AC-CE18B",
    domain: "Employer",
    category: "Actions",
    name: "Pipeline tab Shortlist",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_DASH",
      role: "button",
      name: /Shortlist/i,
    },
    intent: "ui",
  },
  {
    id: "AC-CE18C",
    domain: "Employer",
    category: "Actions",
    name: "Pipeline tab Interview",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_DASH",
      text: /Interview|Rounds/i,
    },
    intent: "ui",
  },
  {
    id: "AC-CE1",
    domain: "Employer",
    category: "Actions",
    name: "Move to Shortlist",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_DASH",
      role: "button",
      name: /Move to Shortlist/i,
    },
    intent: "ui",
  },
  {
    id: "AC-CE3",
    domain: "Employer",
    category: "Actions",
    name: "Reject candidate",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_DASH",
      role: "button",
      name: /^Reject$/i,
    },
    intent: "ui",
  },
  {
    id: "AC-CE4",
    domain: "Employer",
    category: "Actions",
    name: "Notes",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_DASH",
      role: "button",
      name: /^Notes$/i,
    },
    intent: "ui",
  },
  {
    id: "AC-CE6",
    domain: "Employer",
    category: "Actions",
    name: "Bulk reject control",
    probe: {
      type: "goto-testid",
      path: "DYNAMIC_DASH",
      testId: "career-candidate-bulk-reject",
    },
    intent: "ui",
  },
  {
    id: "AC-CE11",
    domain: "Employer",
    category: "Actions",
    name: "Pause Applications",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_DASH",
      role: "button",
      name: /Pause Applications/i,
    },
    intent: "ui",
  },
  {
    id: "AC-CE15",
    domain: "Employer",
    category: "Actions",
    name: "Close Job Post",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_DASH",
      role: "button",
      name: /Close Job Post/i,
    },
    intent: "ui",
  },
  {
    id: "AC-CE17",
    domain: "Employer",
    category: "Actions",
    name: "Mark as Hired",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_DASH",
      role: "button",
      name: /Mark as Hired/i,
    },
    intent: "ui",
  },

  // —— 7 Interview & Offer ——
  {
    id: "IV-CE1",
    domain: "Employer",
    category: "Interview",
    name: "Schedule Interview CTA",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_DASH",
      role: "button",
      name: /Schedule Interview/i,
    },
    intent: "ui",
  },
  {
    id: "IV-CE2",
    domain: "Employer",
    category: "Interview",
    name: "Schedule Interview modal (open)",
    probe: {
      type: "click-role",
      path: "DYNAMIC_DASH",
      role: "button",
      name: /Schedule Interview/i,
      afterText: /Phone|Video|In-person|Confirm Schedule/i,
    },
    intent: "ui",
  },
  {
    id: "IV-CE6",
    domain: "Employer",
    category: "Offer",
    name: "Send Offer control",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_DASH",
      role: "button",
      name: /Send Offer/i,
    },
    intent: "ui",
  },
  {
    id: "IV-CW1",
    domain: "Employee",
    category: "Interview",
    name: "Accept Interview",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/applications",
      role: "button",
      name: /Accept Interview/i,
    },
    intent: "ui",
  },
  {
    id: "IV-CW2",
    domain: "Employee",
    category: "Interview",
    name: "Decline Interview",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/applications",
      role: "button",
      name: /Decline Interview/i,
    },
    intent: "ui",
  },
  {
    id: "IV-CW4",
    domain: "Employee",
    category: "Offer",
    name: "Accept Offer",
    probe: {
      type: "goto-role",
      path: "/#/employee/career/applications",
      role: "button",
      name: /Accept Offer/i,
    },
    intent: "ui",
  },
  {
    id: "GAP-IV1",
    domain: "Shared",
    category: "Interview",
    name: "Full calendar / timeslot grid",
    probe: {
      type: "skip",
      reason: "Schedule modal uses date/time inputs only — no calendar grid UI",
    },
    intent: "ui",
  },

  // —— 8 Vault / Workspaces / Records ——
  {
    id: "VT-CW1",
    domain: "Employee",
    category: "Vault",
    name: "Saved jobs tab",
    probe: {
      type: "click-role",
      path: "/#/employee/career/search",
      role: "button",
      name: /^Saved$|Saved Jobs/i,
      afterText: /Saved|Bookmark|No saved|Operations/i,
    },
    intent: "ui",
  },
  {
    id: "VT-CW2",
    domain: "Employee",
    category: "Workspaces",
    name: "Career workspaces list",
    probe: {
      type: "goto-text",
      path: "/#/employee/career/workspaces",
      text: /Workspace|Current job|Career|No workspace/i,
    },
    intent: "ui",
  },
  {
    id: "VT-CW3",
    domain: "Employee",
    category: "Workspaces",
    name: "Workspace detail",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_WS",
      text: /Workspace|Resign|Employment|Operations/i,
    },
    intent: "ui",
  },
  {
    id: "VT-CW4",
    domain: "Employee",
    category: "Workspaces",
    name: "Resign job",
    probe: {
      type: "goto-role",
      path: "DYNAMIC_WS",
      role: "button",
      name: /Resign job|Resign/i,
    },
    intent: "ui",
  },
  {
    id: "VT-CW5",
    domain: "Employee",
    category: "Records",
    name: "Employee completed records",
    probe: {
      type: "goto-text",
      path: "/#/employee/career/completed-records",
      text: /Completed|Records|History|Career/i,
    },
    intent: "ui",
  },
  {
    id: "VT-CE3",
    domain: "Employer",
    category: "Records",
    name: "Employer completed records + filters",
    probe: {
      type: "goto-testid",
      path: "/#/employer/career/completed-records",
      testId: "career-completed-filters",
    },
    intent: "ui",
  },
  {
    id: "VT-CE1",
    domain: "Employer",
    category: "Vault",
    name: "Candidate Work Vault review route",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_VAULT",
      text: /Work Vault|Documents|Profile|OTP|Access/i,
    },
    intent: "ui",
  },
  {
    id: "GAP-VT1",
    domain: "Shared",
    category: "Vault",
    name: "Career-only certificates / offer-letter gallery",
    probe: {
      type: "skip",
      reason: "Uses shared Work Vault OTP review — no career-only cert gallery",
    },
    intent: "ui",
  },

  // —— 9 Skills ——
  {
    id: "SK-CE1",
    domain: "Employer",
    category: "Skills",
    name: "Skills on create / post",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_DASH",
      text: /Skills|Operations|Communication/i,
    },
    intent: "ui",
  },
  {
    id: "SK-CW1",
    domain: "Employee",
    category: "Skills",
    name: "Skills chips on post details",
    probe: {
      type: "goto-text",
      path: "DYNAMIC_POST",
      text: /Skills|Operations|Communication/i,
    },
    intent: "ui",
  },
  {
    id: "GAP-SK1",
    domain: "Shared",
    category: "Skills",
    name: "Quiz / assessment / badges / upskill training",
    probe: {
      type: "skip",
      reason: "No dedicated career quiz/training/assessment UI — skills tags + match only",
    },
    intent: "ui",
  },

  // —— 10 Alerts / Signals ——
  {
    id: "AL-CW2",
    domain: "Employee",
    category: "Alerts",
    name: "Notifications bell",
    probe: {
      type: "goto-role",
      path: "/#/employee/career",
      role: "button",
      name: /Notifications/i,
    },
    intent: "ui",
  },
  {
    id: "AL-CE2",
    domain: "Employer",
    category: "Alerts",
    name: "Employer notifications bell",
    probe: {
      type: "goto-role",
      path: "/#/employer/career",
      role: "button",
      name: /Notifications/i,
    },
    intent: "ui",
  },
  {
    id: "AL-CW1",
    domain: "Employee",
    category: "Alerts",
    name: "Pending actions hub (interview/offer)",
    probe: {
      type: "goto-testid",
      path: "/#/employee/career",
      testId: "pending-actions-hub",
    },
    intent: "ui",
  },
  {
    id: "AL-CE1",
    domain: "Employer",
    category: "Alerts",
    name: "Pulse applications card",
    probe: {
      type: "pulse-active",
      path: "/#/employer/career",
      flow: "career_application_received",
      nodeId: "career-dashboard-applications",
    },
    intent: "ui",
  },

  // —— 11 Storage / demo / flags ——
  {
    id: "ST-POSTS",
    domain: "Employer",
    category: "Storage",
    name: "Employer career posts storage",
    probe: { type: "storage", key: "wm_employer_career_posts_v1", expectNonEmpty: true },
    intent: "ui",
  },
  {
    id: "ST-APPS",
    domain: "Employee",
    category: "Storage",
    name: "Employee career applications storage",
    probe: { type: "storage", key: "wm_employee_career_applications_v1", expectNonEmpty: true },
    intent: "ui",
  },
  {
    id: "ST-SEARCH",
    domain: "Employee",
    category: "Storage",
    name: "Employee career search corpus",
    probe: { type: "storage", key: "wm_employee_career_posts_search_v1", expectNonEmpty: true },
    intent: "ui",
  },
  {
    id: "ST-VAULT",
    domain: "Shared",
    category: "Storage",
    name: "Vault career history",
    probe: { type: "storage", key: "wm_vault_career_history_v1", expectNonEmpty: false },
    intent: "ui",
  },
  {
    id: "ST-FL1",
    domain: "Shared",
    category: "Settings",
    name: "killCareer module flag",
    probe: { type: "skip", reason: "Feature-flagged kill switch — not probed as live UI" },
    intent: "flag",
  },
  {
    id: "DM-E2E1",
    domain: "Shared",
    category: "Demo",
    name: "Career circuit seed post id",
    probe: { type: "storage", key: "wm_employer_career_posts_v1", expectNonEmpty: true },
    intent: "demo",
  },
];

export const CAREER_INVENTORY_COUNT = CAREER_FEATURE_INVENTORY.length;
