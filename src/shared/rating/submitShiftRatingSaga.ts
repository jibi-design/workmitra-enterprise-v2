// Job Mitra | submitShiftRatingSaga.ts
// GAP-017 — orchestrates worker shift rating + points award.

import { ratingStorage } from "./ratingStorage";
import type { WorkerToEmployerRating } from "./ratingTypes";
import { workerPointsStorage, WorkerPointsStorageWriteError } from "./workerPointsStorage";
import { persistShiftReviewToServer } from "../../features/shift/services/persistShiftReviewToServer";
import { enqueueShiftRetry } from "../shift/shiftRetryQueue";

export type SubmitShiftRatingSagaInput = Omit<
  WorkerToEmployerRating,
  "id" | "createdAt" | "editedAt" | "editCount"
> & {
  workspaceId?: string;
  appId?: string;
};

export type SubmitShiftRatingSagaResult =
  | { ok: true; rating: WorkerToEmployerRating; pointsApplied: boolean; persist: Promise<void> }
  | { ok: false; reason: "already_rated" | "rating_write_error" };

function ratingWasPersisted(input: SubmitShiftRatingSagaInput): boolean {
  const saved = ratingStorage.getWorkerRatingForJob(
    input.workerMlId,
    input.jobId,
    input.employerMlId,
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

  if (ratingStorage.hasWorkerRatedEmployer(input.workerMlId, input.jobId, input.employerMlId)) {
    return { ok: false, reason: "already_rated" };
  }

  // Step 1 — CRITICAL: persist worker rating.
  const rating = ratingStorage.saveWorkerRating(input);

  if (!ratingWasPersisted(input)) {
    return { ok: false, reason: "rating_write_error" };
  }

  const persist = persistShiftReviewToServer({
    role: "employee",
    workspaceId: input.workspaceId,
    postId: input.jobId,
    appId: input.appId,
    rating: input.stars,
    body: input.comment,
  });

  // Step 2 — IMPORTANT: shift completion points (no rollback on failure).
  try {
    workerPointsStorage.applyEvent(input.workerMlId, "shift_complete", input.jobId);
    return { ok: true, rating, pointsApplied: true, persist };
  } catch (error) {
    if (error instanceof WorkerPointsStorageWriteError) {
      console.warn("[submitShiftRatingSaga] Rating saved but points could not be applied", {
        workerMlId: input.workerMlId,
        jobId: input.jobId,
      });
      // IMPORTANT: rating is persisted; enqueue points retry.
      enqueueShiftRetry("rating_points", {
        workerMlId: input.workerMlId,
        jobId: input.jobId,
      });
      return { ok: true, rating, pointsApplied: false, persist };
    }

    throw error;
  }
}
