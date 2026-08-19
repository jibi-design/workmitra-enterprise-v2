/** Job Mitra | commandPalette.registry.ts | Static nav commands (ROUTE_PATHS only) */

import { ROUTE_PATHS } from "../../../app/router/routePaths";
import type { EnterpriseDomainAccent } from "./enterprise.types";

export type CommandPaletteDomain = EnterpriseDomainAccent | "general" | "vault";

export type CommandPaletteItem = {
  id: string;
  label: string;
  keywords: string[];
  path: string;
  domain: CommandPaletteDomain;
  group: string;
};

/** Employer static registry — navigation only; no domain storage reads. */
export const EMPLOYER_COMMAND_PALETTE_ITEMS: readonly CommandPaletteItem[] = [
  {
    id: "home",
    label: "Employer Home",
    keywords: ["dashboard", "home", "start"],
    path: ROUTE_PATHS.employerHome,
    domain: "general",
    group: "General",
  },
  {
    id: "notifications",
    label: "Notifications",
    keywords: ["bell", "alerts", "inbox"],
    path: ROUTE_PATHS.employerNotifications,
    domain: "general",
    group: "General",
  },
  {
    id: "settings",
    label: "Settings",
    keywords: ["preferences", "account", "company"],
    path: ROUTE_PATHS.employerSettings,
    domain: "general",
    group: "General",
  },
  {
    id: "planner-home",
    label: "Planner Home",
    keywords: ["demand", "gig", "projects", "planner"],
    path: ROUTE_PATHS.employerPlannerHome,
    domain: "planner",
    group: "Planner",
  },
  {
    id: "planner-plans",
    label: "Demand Plans",
    keywords: ["plans", "list", "active", "draft"],
    path: ROUTE_PATHS.employerPlannerPlans,
    domain: "planner",
    group: "Planner",
  },
  {
    id: "planner-new",
    label: "Create Demand Plan",
    keywords: ["new", "wizard", "publish", "create plan"],
    path: ROUTE_PATHS.employerPlannerNew,
    domain: "planner",
    group: "Planner",
  },
  {
    id: "planner-applications",
    label: "Planner Applications",
    keywords: ["batch", "approve", "applicants"],
    path: ROUTE_PATHS.employerPlannerApplications,
    domain: "planner",
    group: "Planner",
  },
  {
    id: "planner-roster",
    label: "Planner Roster",
    keywords: ["crew", "rtw", "understaff", "roster"],
    path: ROUTE_PATHS.employerPlannerRoster,
    domain: "planner",
    group: "Planner",
  },
  {
    id: "shift-home",
    label: "Shift Home",
    keywords: ["temporary", "shifts", "gig day"],
    path: ROUTE_PATHS.employerShiftHome,
    domain: "shift",
    group: "Shift",
  },
  {
    id: "shift-posts",
    label: "Shift Posts",
    keywords: ["my posts", "vacancies", "open shifts"],
    path: ROUTE_PATHS.employerShiftPosts,
    domain: "shift",
    group: "Shift",
  },
  {
    id: "shift-create",
    label: "Create Shift Post",
    keywords: ["new shift", "post", "hire today"],
    path: ROUTE_PATHS.employerShiftCreate,
    domain: "shift",
    group: "Shift",
  },
  {
    id: "shift-favorites",
    label: "Favorite Workers",
    keywords: ["favorites", "hire again", "talent"],
    path: ROUTE_PATHS.employerShiftFavorites,
    domain: "shift",
    group: "Shift",
  },
  {
    id: "shift-workspaces",
    label: "Shift Workspaces",
    keywords: ["groups", "broadcast", "chat"],
    path: ROUTE_PATHS.employerShiftWorkspaces,
    domain: "shift",
    group: "Shift",
  },
  {
    id: "shift-templates",
    label: "Shift Templates",
    keywords: ["reuse", "template"],
    path: ROUTE_PATHS.employerShiftTemplates,
    domain: "shift",
    group: "Shift",
  },
  {
    id: "career-home",
    label: "Career Home",
    keywords: ["hiring", "long-term", "jobs"],
    path: ROUTE_PATHS.employerCareerHome,
    domain: "career",
    group: "Career",
  },
  {
    id: "career-posts",
    label: "Career Posts",
    keywords: ["job list", "pipeline", "open roles"],
    path: ROUTE_PATHS.employerCareerPosts,
    domain: "career",
    group: "Career",
  },
  {
    id: "career-create",
    label: "Create Career Job",
    keywords: ["new job", "post career", "hire"],
    path: ROUTE_PATHS.employerCareerCreate,
    domain: "career",
    group: "Career",
  },
  {
    id: "career-completed",
    label: "Career Completed Records",
    keywords: ["history", "closed", "filled"],
    path: ROUTE_PATHS.employerCareerCompletedRecords,
    domain: "career",
    group: "Career",
  },
] as const;

/** Employee static registry — Day-1 destinations only (no route params). */
export const EMPLOYEE_COMMAND_PALETTE_ITEMS: readonly CommandPaletteItem[] = [
  {
    id: "ee-home",
    label: "Employee Home",
    keywords: ["dashboard", "home", "start"],
    path: ROUTE_PATHS.employeeHome,
    domain: "general",
    group: "General",
  },
  {
    id: "ee-notifications",
    label: "Notifications",
    keywords: ["bell", "alerts", "inbox"],
    path: ROUTE_PATHS.employeeNotifications,
    domain: "general",
    group: "General",
  },
  {
    id: "ee-settings",
    label: "Settings",
    keywords: ["preferences", "account"],
    path: ROUTE_PATHS.employeeSettings,
    domain: "general",
    group: "General",
  },
  {
    id: "ee-profile",
    label: "Profile",
    keywords: ["me", "identity", "photo"],
    path: ROUTE_PATHS.employeeProfile,
    domain: "general",
    group: "General",
  },
  {
    id: "ee-shift-center",
    label: "Shift Center",
    keywords: ["temporary", "shifts", "gig"],
    path: ROUTE_PATHS.employeeShiftCenter,
    domain: "shift",
    group: "Shift",
  },
  {
    id: "ee-shift-search",
    label: "Find Shifts",
    keywords: ["search", "browse", "apply"],
    path: ROUTE_PATHS.employeeShiftSearch,
    domain: "shift",
    group: "Shift",
  },
  {
    id: "ee-shift-applications",
    label: "Shift Applications",
    keywords: ["applied", "pending", "status"],
    path: ROUTE_PATHS.employeeShiftApplications,
    domain: "shift",
    group: "Shift",
  },
  {
    id: "ee-shift-workspaces",
    label: "Shift Workspaces",
    keywords: ["groups", "chat", "live work"],
    path: ROUTE_PATHS.employeeShiftWorkspaces,
    domain: "shift",
    group: "Shift",
  },
  {
    id: "ee-shift-earnings",
    label: "Shift Earnings",
    keywords: ["pay", "wallet", "money"],
    path: ROUTE_PATHS.employeeShiftEarnings,
    domain: "shift",
    group: "Shift",
  },
  {
    id: "ee-career-home",
    label: "Career Home",
    keywords: ["jobs", "long-term", "hiring"],
    path: ROUTE_PATHS.employeeCareerHome,
    domain: "career",
    group: "Career",
  },
  {
    id: "ee-career-search",
    label: "Search Career Jobs",
    keywords: ["browse", "find job", "apply"],
    path: ROUTE_PATHS.employeeCareerSearch,
    domain: "career",
    group: "Career",
  },
  {
    id: "ee-career-applications",
    label: "Career Applications",
    keywords: ["pipeline", "applied", "offers"],
    path: ROUTE_PATHS.employeeCareerApplications,
    domain: "career",
    group: "Career",
  },
  {
    id: "ee-career-workspaces",
    label: "Career Workspaces",
    keywords: ["hired", "employment", "workspace"],
    path: ROUTE_PATHS.employeeCareerWorkspaces,
    domain: "career",
    group: "Career",
  },
  {
    id: "ee-planner-home",
    label: "Planner Home",
    keywords: ["demand", "gig projects", "planner"],
    path: ROUTE_PATHS.employeePlannerHome,
    domain: "planner",
    group: "Planner",
  },
  {
    id: "ee-planner-browse",
    label: "Browse Plans",
    keywords: ["discover", "projects", "apply"],
    path: ROUTE_PATHS.employeePlannerBrowse,
    domain: "planner",
    group: "Planner",
  },
  {
    id: "ee-planner-applications",
    label: "Planner Applications",
    keywords: ["applied plans", "status"],
    path: ROUTE_PATHS.employeePlannerApplications,
    domain: "planner",
    group: "Planner",
  },
  {
    id: "ee-vault",
    label: "Work Vault",
    keywords: ["documents", "otp", "records", "identity"],
    path: ROUTE_PATHS.employeeVaultHome,
    domain: "vault",
    group: "Vault",
  },
  {
    id: "ee-vault-otp",
    label: "Vault Access Code",
    keywords: ["otp", "share", "employer access"],
    path: ROUTE_PATHS.employeeVaultOtp,
    domain: "vault",
    group: "Vault",
  },
] as const;

export function filterCommandPaletteItems(
  query: string,
  items: readonly CommandPaletteItem[] = EMPLOYER_COMMAND_PALETTE_ITEMS,
): CommandPaletteItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];

  return items.filter((item) => {
    if (item.label.toLowerCase().includes(q)) return true;
    if (item.group.toLowerCase().includes(q)) return true;
    if (item.domain.toLowerCase().includes(q)) return true;
    return item.keywords.some((kw) => kw.toLowerCase().includes(q));
  });
}

export function commandPaletteDomainCounts(
  items: readonly CommandPaletteItem[] = EMPLOYER_COMMAND_PALETTE_ITEMS,
): Record<CommandPaletteDomain, number> {
  const counts: Record<CommandPaletteDomain, number> = {
    planner: 0,
    shift: 0,
    career: 0,
    general: 0,
    vault: 0,
  };
  for (const item of items) {
    counts[item.domain] += 1;
  }
  return counts;
}
