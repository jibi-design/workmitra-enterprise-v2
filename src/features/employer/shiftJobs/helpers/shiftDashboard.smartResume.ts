/** Job Mitra | shiftDashboard.smartResume.ts | Action-required tab for post dashboard
 * Pulse may expire. Smart landing + banner remain the source of truth (SR-16).
 * Landing never auto-confirms a worker (SR-18).
 */

import type { DashboardTab } from "./shiftDashboardHelpers";

export type ShiftPipelineCounts = {
  readonly applied: number;
  readonly shortlisted: number;
  readonly backup: number;
  readonly selected: number;
};

export function resolveShiftDashboardLandingTab(
  counts: ShiftPipelineCounts,
  vacancies: number,
): DashboardTab {
  const remaining = Math.max(0, Math.floor(vacancies) - counts.selected);
  if (remaining > 0 && counts.shortlisted > 0) return "shortlisted";
  if (counts.applied > 0) return "applied";
  if (remaining > 0 && counts.backup > 0) return "backup";
  if (counts.selected > 0) return "selected";
  return "applied";
}

export function shiftPipelineHasLaterWork(counts: ShiftPipelineCounts): boolean {
  return counts.shortlisted > 0 || counts.backup > 0 || counts.selected > 0;
}

export function shiftConfirmBannerCopy(
  shortlistedCount: number,
  remainingVacancies: number,
): {
  readonly title: string;
  readonly message: string;
} {
  const n = Math.max(0, shortlistedCount);
  const left = Math.max(0, remainingVacancies);
  const who = n === 1 ? "1 shortlisted worker waiting" : `${n} shortlisted workers waiting`;
  const fill = left <= 1 ? "fill vacancy" : `fill ${left} vacancies`;
  return {
    title: `${who} — Tap Confirm to ${fill}`,
    message: "Shortlist is not the final hire. Open Confirm Worker on the candidate you want.",
  };
}
