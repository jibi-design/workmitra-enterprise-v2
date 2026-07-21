/**
 * Job Mitra | submitPlannerRatingSaga.ts
 * Hybrid A2 P1.5 — entity-scoped planner ratings + vault sync.
 */

import { syncPlannerVaultRatings } from "../../features/employee/workVault/services/plannerVaultHistory.service";
import { ratingStorage } from "./ratingStorage";
import type {
  EmployerToWorkerRating,
  RatingPlannerMeta,
  WorkerToEmployerRating,
} from "./ratingTypes";
import {
  buildPlannerRatingJobId,
  guardPlannerReputationSubject,
  parsePlannerEpochFromJobId,
  parsePlannerPlanIdFromJobId,
} from "./plannerRating.helpers";

export type SubmitPlannerEmployerRatingInput = {
  /** Legal corporate entity Mitra Labs ID (reputation subject). */
  employerMlId: string;
  workerMlId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: EmployerToWorkerRating["tags"];
  comment?: string;
  hireAgain: boolean;
  meta: RatingPlannerMeta;
};

export type SubmitPlannerWorkerRatingInput = {
  workerMlId: string;
  /** Legal corporate entity Mitra Labs ID (reputation subject). */
  employerMlId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: WorkerToEmployerRating["tags"];
  comment?: string;
  workAgain: boolean;
  meta: RatingPlannerMeta;
};

export type SubmitPlannerRatingResult =
  | { ok: true; rating: EmployerToWorkerRating | WorkerToEmployerRating }
  | {
      ok: false;
      reason:
        | "invalid_entity"
        | "site_manager_as_subject"
        | "missing_plan"
        | "already_rated"
        | "rating_write_error";
    };

function mapGuardReason(
  reason: "missing_entity" | "missing_plan" | "site_manager_as_subject",
): Extract<SubmitPlannerRatingResult, { ok: false }>["reason"] {
  if (reason === "missing_entity") return "invalid_entity";
  if (reason === "site_manager_as_subject") return "site_manager_as_subject";
  return "missing_plan";
}

function syncVaultFromMeta(
  meta: RatingPlannerMeta,
  workerMlId: string,
  patch: { employerRating?: number; employeeRating?: number },
): void {
  const planId = meta.rosterPlanId;
  const epochIndex =
    typeof meta.epochIndex === "number" && Number.isFinite(meta.epochIndex)
      ? Math.max(0, Math.floor(meta.epochIndex))
      : 0;
  syncPlannerVaultRatings({
    planId,
    employeeMlId: workerMlId,
    epochIndex,
    ...patch,
  });
}

export function submitPlannerEmployerRating(
  input: SubmitPlannerEmployerRatingInput,
): SubmitPlannerRatingResult {
  const guard = guardPlannerReputationSubject(input.employerMlId, input.meta);
  if (!guard.ok) return { ok: false, reason: mapGuardReason(guard.reason) };

  const jobId = buildPlannerRatingJobId(guard.meta.rosterPlanId, guard.meta.epochIndex);
  if (!jobId) return { ok: false, reason: "missing_plan" };

  if (ratingStorage.hasEmployerRatedWorker(input.employerMlId, jobId, input.workerMlId)) {
    return { ok: false, reason: "already_rated" };
  }

  const rating = ratingStorage.saveEmployerRating({
    domain: "planner",
    employerMlId: input.employerMlId.trim(),
    workerMlId: input.workerMlId.trim(),
    jobId,
    stars: input.stars,
    tags: input.tags,
    comment: input.comment,
    hireAgain: input.hireAgain,
    meta: guard.meta,
  });

  const persisted = ratingStorage.getEmployerRatingForJob(
    input.employerMlId,
    jobId,
    input.workerMlId,
  );
  if (!persisted || persisted.stars !== input.stars) {
    return { ok: false, reason: "rating_write_error" };
  }

  syncVaultFromMeta(guard.meta, input.workerMlId, { employerRating: input.stars });
  return { ok: true, rating };
}

export function submitPlannerWorkerRating(
  input: SubmitPlannerWorkerRatingInput,
): SubmitPlannerRatingResult {
  const guard = guardPlannerReputationSubject(input.employerMlId, input.meta);
  if (!guard.ok) return { ok: false, reason: mapGuardReason(guard.reason) };

  const jobId = buildPlannerRatingJobId(guard.meta.rosterPlanId, guard.meta.epochIndex);
  if (!jobId) return { ok: false, reason: "missing_plan" };

  if (ratingStorage.hasWorkerRatedEmployer(input.workerMlId, jobId, input.employerMlId)) {
    return { ok: false, reason: "already_rated" };
  }

  const rating = ratingStorage.saveWorkerRating({
    domain: "planner",
    workerMlId: input.workerMlId.trim(),
    employerMlId: input.employerMlId.trim(),
    jobId,
    stars: input.stars,
    tags: input.tags,
    comment: input.comment,
    workAgain: input.workAgain,
    meta: guard.meta,
  });

  const persisted = ratingStorage.getWorkerRatingForJob(
    input.workerMlId,
    jobId,
    input.employerMlId,
  );
  if (!persisted || persisted.stars !== input.stars) {
    return { ok: false, reason: "rating_write_error" };
  }

  syncVaultFromMeta(guard.meta, input.workerMlId, { employeeRating: input.stars });
  return { ok: true, rating };
}

export function resolvePlannerIdsFromRatingJob(jobId: string): {
  planId: string;
  epochIndex: number;
} {
  return {
    planId: parsePlannerPlanIdFromJobId(jobId),
    epochIndex: parsePlannerEpochFromJobId(jobId) ?? 0,
  };
}
