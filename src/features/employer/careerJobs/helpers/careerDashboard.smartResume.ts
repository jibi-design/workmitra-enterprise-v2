/** Job Mitra | careerDashboard.smartResume.ts | Action-required career post tab */

import type { CareerTab } from "../components/CareerPipelineTabs";

export type CareerPipelineCounts = {
  readonly applied: number;
  readonly shortlisted: number;
  readonly interview: number;
  readonly offered: number;
  readonly hired: number;
};

const CAREER_TABS: readonly CareerTab[] = [
  "applied",
  "backup",
  "shortlisted",
  "interview",
  "offered",
  "hired",
  "rejected",
];

export function parseCareerDashboardTab(raw: string | null): CareerTab | null {
  if (!raw) return null;
  return CAREER_TABS.includes(raw as CareerTab) ? (raw as CareerTab) : null;
}

export function resolveCareerDashboardLandingTab(counts: CareerPipelineCounts): CareerTab {
  if (counts.offered > 0) return "offered";
  if (counts.interview > 0) return "interview";
  if (counts.shortlisted > 0) return "shortlisted";
  if (counts.applied > 0) return "applied";
  if (counts.hired > 0) return "hired";
  return "applied";
}

export function careerStageBannerCopy(
  tab: CareerTab,
  counts: CareerPipelineCounts,
): {
  readonly title: string;
  readonly message: string;
} | null {
  if (tab === "offered" && counts.offered > 0) {
    return {
      title: `${counts.offered} offer${counts.offered === 1 ? "" : "s"} waiting`,
      message: "Track accept or decline. Hiring is not complete until the candidate responds.",
    };
  }
  if (tab === "interview" && counts.interview > 0) {
    return {
      title: `${counts.interview} interview${counts.interview === 1 ? "" : "s"} in progress`,
      message: "Record results or send the next round so the pipeline does not stall.",
    };
  }
  if (tab === "shortlisted" && counts.shortlisted > 0) {
    return {
      title: `${counts.shortlisted} shortlisted — next action`,
      message: "Schedule interviews or send offers. Shortlist is not a hire.",
    };
  }
  return null;
}
