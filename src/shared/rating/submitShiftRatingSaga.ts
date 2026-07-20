// Job Mitra | submitShiftRatingSaga.ts
// GAP-017 — orchestrates worker shift rating + points award.

import { ratingStorage } from "./ratingStorage";
import type { WorkerToEmployerRating } from "./ratingTypes";
import { workerPointsStorage, WorkerPointsStorageWriteError } from "./workerPointsStorage";

export type SubmitShiftRatingSagaInput = Omit<
  WorkerToEmployerRating,
  "id" | "createdAt" | "editedAt" | "editCount"
>;

export type SubmitShiftRatingSagaResult =
  | { ok: true; rating: WorkerToEmployerRating; pointsApplied: boolean }
  | { ok: false; reason: "already_rated" | "rating_write_error" };

function ratingWasPersisted(input: SubmitShiftRatingSagaInput): boolean {
  const saved = ratingStorage.getWorkerRatingForJob(
    input.workerWmId,
    input.jobId,
    input.employerWmId,
  );

  return saved !== null && saved.stars === input.stars;
}

/**
 * Employee rates employer on a completed shift.
 * Step 1 (CRITICAL): persist rating.
 * Step 2 (IMPORTANT): award shift_complete points — loss acceptable on failure.
 */
export function submitShiftRatingSaga(
  input: SubmitShiftRatingSagaInput,
): SubmitShiftRatingSagaResult {
  if (input.domain !== "shift") {
    return { ok: false, reason: "rating_write_error" };
  }

  if (ratingStorage.hasWorkerRatedEmployer(input.workerWmId, input.jobId, input.employerWmId)) {
    return { ok: false, reason: "already_rated" };
  }

  // Step 1 — CRITICAL: persist worker rating.
  const rating = ratingStorage.saveWorkerRating(input);

  if (!ratingWasPersisted(input)) {
    return { ok: false, reason: "rating_write_error" };
  }

  // Step 2 — IMPORTANT: shift completion points (no rollback on failure).
  try {
    workerPointsStorage.applyEvent(input.workerWmId, "shift_complete", input.jobId);
    return { ok: true, rating, pointsApplied: true };
  } catch (error) {
    if (error instanceof WorkerPointsStorageWriteError) {
      console.warn("[submitShiftRatingSaga] Rating saved but points could not be applied", {
        workerWmId: input.workerWmId,
        jobId: input.jobId,
      });
      // TODO: enqueue to wm_retry_queue_v1 when retry infrastructure exists.
      return { ok: true, rating, pointsApplied: false };
    }

    throw error;
  }
}
