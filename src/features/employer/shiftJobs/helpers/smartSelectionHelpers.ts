// src/features/employer/shiftJobs/helpers/smartSelectionHelpers.ts
//
// Smart Selection System — score each applicant and group into
// Top Picks / Good Fit / Others using rating data + points level.

import type { EmployeeShiftApplication } from "../storage/employerShift.storage";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { workerPointsStorage } from "../../../../shared/rating/workerPointsStorage";
import type { RatingLevel } from "../../../../shared/rating/ratingTypes";

/* ------------------------------------------------ */
/* Group types                                      */
/* ------------------------------------------------ */
export type SelectionGroup = "top" | "good" | "others";

export type ScoredApplication = {
  app: EmployeeShiftApplication;
  score: number;
  group: SelectionGroup;
  ratingCount: number;
  avgStars: number;
  level: RatingLevel;
  points: number;
  hireAgainPct: number;
  mustHavePct: number;
};

/* ------------------------------------------------ */
/* Level score map                                  */
/* ------------------------------------------------ */
const LEVEL_SCORE: Record<RatingLevel, number> = {
  platinum: 20,
  gold:     15,
  silver:   10,
  bronze:    5,
};

/* ------------------------------------------------ */
/* Scoring                                          */
/* ------------------------------------------------ */
// Max possible score = 40 (stars) + 20 (level) + 15 (must-have) + 10 (good-to-have) + 10 (hire-again) = 95
// Top Picks  : score >= 65
// Good Fit   : score >= 35
// Others     : score <  35

function calcMustHavePct(app: EmployeeShiftApplication): number {
  const keys = Object.keys(app.mustHaveAnswers);
  if (keys.length === 0) return 1; // no questions → full credit
  const met = Object.values(app.mustHaveAnswers).filter((v) => v === "meets").length;
  return met / keys.length;
}

function calcGoodToHavePct(app: EmployeeShiftApplication): number {
  const keys = Object.keys(app.goodToHaveAnswers);
  if (keys.length === 0) return 1;
  const met = Object.values(app.goodToHaveAnswers).filter((v) => v === "meets").length;
  return met / keys.length;
}

export function scoreApplication(app: EmployeeShiftApplication): ScoredApplication {
  const wmId = app.profileSnapshot?.uniqueId ?? "";

  /* Rating data */
  const summary = wmId ? ratingStorage.getWorkerSummary(wmId) : null;
  const ratingCount = summary?.totalRatings ?? 0;
  const avgStars = summary?.averageStars ?? 0;
  const hireAgainCount = summary?.hireAgainCount ?? 0;
  const hireAgainPct = ratingCount > 0 ? hireAgainCount / ratingCount : 0;

  /* Points + level */
  const pointsRecord = wmId ? workerPointsStorage.getByWmId(wmId) : null;
  const level: RatingLevel = pointsRecord?.level ?? "bronze";
  const points = pointsRecord?.total ?? 0;

  /* Must-have % */
  const mustHavePct = calcMustHavePct(app);
  const goodToHavePct = calcGoodToHavePct(app);

  /* Score components */
  const starScore     = ratingCount > 0 ? (avgStars / 5) * 40 : 20; // neutral 20 if no ratings
  const levelScore    = LEVEL_SCORE[level];
  const mustScore     = mustHavePct * 15;
  const goodScore     = goodToHavePct * 10;
  const hireScore     = ratingCount > 0 ? hireAgainPct * 10 : 5; // neutral 5 if no ratings

  const score = Math.round(starScore + levelScore + mustScore + goodScore + hireScore);

  /* Group */
  const group: SelectionGroup =
    score >= 65 ? "top"
    : score >= 35 ? "good"
    : "others";

  return {
    app, score, group, ratingCount,
    avgStars, level, points, hireAgainPct,
    mustHavePct,
  };
}

/* ------------------------------------------------ */
/* Group & sort applications                        */
/* ------------------------------------------------ */
export type GroupedApplications = {
  top:    ScoredApplication[];
  good:   ScoredApplication[];
  others: ScoredApplication[];
};

export function groupApplications(apps: EmployeeShiftApplication[]): GroupedApplications {
  const scored = apps.map(scoreApplication).sort((a, b) => b.score - a.score);
  return {
    top:    scored.filter((s) => s.group === "top"),
    good:   scored.filter((s) => s.group === "good"),
    others: scored.filter((s) => s.group === "others"),
  };
}

/* ------------------------------------------------ */
/* Level display helpers                            */
/* ------------------------------------------------ */
export const LEVEL_LABEL: Record<RatingLevel, string> = {
  platinum: "Platinum",
  gold:     "Gold",
  silver:   "Silver",
  bronze:   "Bronze",
};

export const LEVEL_COLOR: Record<RatingLevel, string> = {
  platinum: "#0369a1",
  gold:     "#b45309",
  silver:   "#64748b",
  bronze:   "#92400e",
};