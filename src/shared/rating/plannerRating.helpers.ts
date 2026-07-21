/**
 * Job Mitra | plannerRating.helpers.ts
 * Hybrid A2 P1.5 — entity-vs-agent rules for planner ratings.
 */

import type { RatingDomain, RatingPlannerMeta } from "./ratingTypes";

export const PUBLIC_RATING_DOMAINS: ReadonlyArray<Exclude<RatingDomain, "planner">> = [
  "shift",
  "career",
] as const;

export function isRatingDomain(value: unknown): value is RatingDomain {
  return value === "shift" || value === "career" || value === "planner";
}

/** Default public trust summaries exclude planner so long-term staffing does not dilute day rates. */
export function isPublicReputationDomain(domain: RatingDomain): boolean {
  return domain === "shift" || domain === "career";
}

/**
 * Stable jobId for a planner epoch rating.
 * Offboard-level ratings may use planId alone (epochIndex omitted / 0 with offboard convention).
 */
export function buildPlannerRatingJobId(planId: string, epochIndex?: number): string {
  const id = planId.trim();
  if (!id) return "";
  if (epochIndex === undefined || epochIndex < 0) return id;
  return `plan_${id}_e${Math.floor(epochIndex)}`;
}

export function parsePlannerPlanIdFromJobId(jobId: string): string {
  const raw = jobId.trim();
  const match = /^plan_(.+)_e\d+$/.exec(raw);
  return match?.[1] ?? raw;
}

export function parsePlannerEpochFromJobId(jobId: string): number | undefined {
  const match = /^plan_.+_e(\d+)$/.exec(jobId.trim());
  if (!match) return undefined;
  return Number(match[1]);
}

export type PlannerEntityGuardResult =
  | { ok: true; meta: RatingPlannerMeta }
  | {
      ok: false;
      reason: "missing_entity" | "missing_plan" | "site_manager_as_subject";
    };

/**
 * Board rule: reputation subject = legal entity employerMlId.
 * siteManagerId must never equal or replace the entity subject.
 */
export function guardPlannerReputationSubject(
  employerMlId: string,
  meta: RatingPlannerMeta,
): PlannerEntityGuardResult {
  const entity = employerMlId.trim();
  const planId = meta.rosterPlanId.trim();
  if (!entity) return { ok: false, reason: "missing_entity" };
  if (!planId) return { ok: false, reason: "missing_plan" };

  const siteMgr = meta.siteManagerId?.trim();
  if (siteMgr && siteMgr.toUpperCase() === entity.toUpperCase()) {
    return { ok: false, reason: "site_manager_as_subject" };
  }

  return {
    ok: true,
    meta: {
      rosterPlanId: planId,
      epochIndex:
        typeof meta.epochIndex === "number" && Number.isFinite(meta.epochIndex)
          ? Math.max(0, Math.floor(meta.epochIndex))
          : undefined,
      siteManagerId: siteMgr || undefined,
      siteId: meta.siteId?.trim() || undefined,
      assignmentId: meta.assignmentId?.trim() || undefined,
    },
  };
}

export function normalizePlannerMeta(raw: unknown): RatingPlannerMeta | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const rec = raw as Record<string, unknown>;
  const rosterPlanId =
    typeof rec.rosterPlanId === "string"
      ? rec.rosterPlanId.trim()
      : typeof rec.planId === "string"
        ? rec.planId.trim()
        : "";
  if (!rosterPlanId) return undefined;

  const epochRaw = rec.epochIndex;
  const epochIndex =
    typeof epochRaw === "number" && Number.isFinite(epochRaw)
      ? Math.max(0, Math.floor(epochRaw))
      : undefined;

  return {
    rosterPlanId,
    epochIndex,
    siteManagerId:
      typeof rec.siteManagerId === "string" && rec.siteManagerId.trim()
        ? rec.siteManagerId.trim()
        : undefined,
    siteId: typeof rec.siteId === "string" && rec.siteId.trim() ? rec.siteId.trim() : undefined,
    assignmentId:
      typeof rec.assignmentId === "string" && rec.assignmentId.trim()
        ? rec.assignmentId.trim()
        : undefined,
  };
}
