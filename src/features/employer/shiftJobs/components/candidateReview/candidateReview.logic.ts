// App name: Job Mitra
// File name: candidateReview.logic.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\candidateReview\candidateReview.logic.ts

import type { EmployeeShiftApplication, PriorityTag } from "../../storage/employerShift.storage";
import type {
  CandidateMatchTier,
  CandidateReviewFilters,
  CandidateReviewSummary,
} from "./candidateReview.types";

export function applyCandidateReviewPriority(
  apps: readonly EmployeeShiftApplication[],
  priorityTags: Record<string, PriorityTag | undefined>,
  useSmartGroups: boolean,
): EmployeeShiftApplication[] {
  return apps.map((app) => ({
    ...app,
    priorityTag: app.priorityTag ?? priorityTags[app.id] ?? (useSmartGroups ? "review" : undefined),
  }));
}

export function getCandidateReviewItems(
  apps: readonly EmployeeShiftApplication[],
  filters: CandidateReviewFilters,
): EmployeeShiftApplication[] {
  const query = normalizeText(filters.query);

  return [...apps]
    .filter((app) => matchesQuery(app, query))
    .filter((app) => matchesPriorityFilter(app, filters.priority))
    .filter((app) => matchesMatchFilter(app, filters.match))
    .sort((a, b) => compareCandidates(a, b, filters.sort));
}

export function getCandidateReviewSummary(
  sourceApps: readonly EmployeeShiftApplication[],
  visibleApps: readonly EmployeeShiftApplication[],
  filters: CandidateReviewFilters,
): CandidateReviewSummary {
  const tiers = sourceApps.map((app) => getCandidateMatchTier(app));

  return {
    total: sourceApps.length,
    visible: visibleApps.length,
    strong: tiers.filter((tier) => tier === "strong").length,
    good: tiers.filter((tier) => tier === "good").length,
    needsReview: tiers.filter((tier) => tier === "needs_review").length,
    activeFilters: getActiveFilterCount(filters),
  };
}

export function isCandidateReviewFilterActive(filters: CandidateReviewFilters): boolean {
  return getActiveFilterCount(filters) > 0;
}

function getActiveFilterCount(filters: CandidateReviewFilters): number {
  let count = 0;

  if (filters.query.trim().length > 0) count += 1;
  if (filters.match !== "all") count += 1;
  if (filters.priority !== "all") count += 1;
  if (filters.sort !== "recommended") count += 1;

  return count;
}

function matchesQuery(app: EmployeeShiftApplication, query: string): boolean {
  if (query.length === 0) {
    return true;
  }

  return getCandidateSearchText(app).includes(query);
}

function matchesPriorityFilter(
  app: EmployeeShiftApplication,
  filter: CandidateReviewFilters["priority"],
): boolean {
  if (filter === "all") return true;
  if (filter === "none") return app.priorityTag === undefined;
  return app.priorityTag === filter;
}

function matchesMatchFilter(
  app: EmployeeShiftApplication,
  filter: CandidateReviewFilters["match"],
): boolean {
  if (filter === "all") return true;
  return getCandidateMatchTier(app) === filter;
}

function compareCandidates(
  a: EmployeeShiftApplication,
  b: EmployeeShiftApplication,
  sortMode: CandidateReviewFilters["sort"],
): number {
  if (sortMode === "newest") {
    return b.createdAt - a.createdAt;
  }

  if (sortMode === "oldest") {
    return a.createdAt - b.createdAt;
  }

  if (sortMode === "name") {
    return getCandidateName(a).localeCompare(getCandidateName(b), "en-IN", {
      sensitivity: "base",
    });
  }

  const priorityDiff = getPriorityRank(a.priorityTag) - getPriorityRank(b.priorityTag);

  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  const matchDiff = getMatchRank(getCandidateMatchTier(a)) - getMatchRank(getCandidateMatchTier(b));

  if (matchDiff !== 0) {
    return matchDiff;
  }

  return b.createdAt - a.createdAt;
}

function getCandidateMatchTier(app: EmployeeShiftApplication): CandidateMatchTier {
  const mustAnswers = Object.values(app.mustHaveAnswers);
  const goodAnswers = Object.values(app.goodToHaveAnswers);
  const profile = app.profileSnapshot;

  const mustTotal = mustAnswers.length;
  const goodTotal = goodAnswers.length;
  const mustMeets = mustAnswers.filter((answer) => answer === "meets").length;
  const goodMeets = goodAnswers.filter((answer) => answer === "meets").length;
  const mustMisses = mustAnswers.filter((answer) => answer === "dont_meet").length;
  const hasProfile = Boolean(profile?.fullName || profile?.city || profile?.skills?.length);

  if (app.priorityTag === "priority") {
    return "strong";
  }

  if (!hasProfile || mustMisses > 0) {
    return "needs_review";
  }

  if (mustTotal > 0 && mustMeets === mustTotal) {
    return "strong";
  }

  if (app.priorityTag === "good") {
    return "good";
  }

  if (mustMeets > 0 || goodMeets > 0 || (mustTotal === 0 && goodTotal === 0 && hasProfile)) {
    return "good";
  }

  return "needs_review";
}

function getPriorityRank(tag: PriorityTag | undefined): number {
  if (tag === "priority") return 0;
  if (tag === "good") return 1;
  if (tag === "review") return 2;
  return 3;
}

function getMatchRank(tier: CandidateMatchTier): number {
  if (tier === "strong") return 0;
  if (tier === "good") return 1;
  return 2;
}

function getCandidateName(app: EmployeeShiftApplication): string {
  return app.profileSnapshot?.fullName?.trim() || app.profileSnapshot?.uniqueId || app.id;
}

function getCandidateSearchText(app: EmployeeShiftApplication): string {
  const profile = app.profileSnapshot;

  return normalizeText(
    [
      app.id,
      app.status,
      app.priorityTag,
      profile?.uniqueId,
      profile?.fullName,
      profile?.city,
      profile?.experience,
      profile?.skills?.join(" "),
      profile?.languages?.join(" "),
      Object.values(app.notes).join(" "),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}
