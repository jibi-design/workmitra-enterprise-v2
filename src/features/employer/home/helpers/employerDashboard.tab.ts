/** Job Mitra | employerDashboard.tab.ts | Event day tab query (legacy utilities alias) */

import { ROUTE_PATHS } from "../../../../app/router/routePaths";

export const EMPLOYER_EVENT_DAY_TAB = "event-day";
export const EMPLOYER_EVENT_DAY_TAB_LEGACY = "utilities";

export type EmployerDashboardTab = "operations" | "event-day";

export function parseEmployerDashboardTab(raw: string | null): EmployerDashboardTab {
  if (raw === EMPLOYER_EVENT_DAY_TAB || raw === EMPLOYER_EVENT_DAY_TAB_LEGACY) {
    return "event-day";
  }
  return "operations";
}

export function employerDashboardEventDayHref(): string {
  return ROUTE_PATHS.employerDashboardEventDay;
}

export function writeEmployerDashboardTabParam(
  searchParams: URLSearchParams,
  tab: EmployerDashboardTab,
): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  if (tab === "operations") next.delete("tab");
  else next.set("tab", EMPLOYER_EVENT_DAY_TAB);
  return next;
}
