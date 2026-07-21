/** Job Mitra | commandPalette.registry.ts | Static employer nav commands (ROUTE_PATHS only) */

import { ROUTE_PATHS } from "../../../app/router/routePaths";
import type { EnterpriseDomainAccent } from "./enterprise.types";

export type CommandPaletteDomain = EnterpriseDomainAccent | "general";

export type CommandPaletteItem = {
  id: string;
  label: string;
  keywords: string[];
  path: string;
  domain: CommandPaletteDomain;
  group: string;
};

/** Static registry — navigation only; no domain storage reads. */
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
  };
  for (const item of items) {
    counts[item.domain] += 1;
  }
  return counts;
}
