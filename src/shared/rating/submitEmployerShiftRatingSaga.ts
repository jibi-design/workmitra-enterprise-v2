// Job Mitra | submitEmployerShiftRatingSaga.ts
// Employer rates worker on a completed shift — rating + worker points.

import { favoritesStorage } from "../../features/employer/shiftJobs/storage/favoritesStorage";
import { ratingStorage } from "./ratingStorage";
import type { EmployerToWorkerRating } from "./ratingTypes";
import { workerPointsStorage, WorkerPointsStorageWriteError } from "./workerPointsStorage";

export type SubmitEmployerShiftRatingSagaInput = Omit<
  EmployerToWorkerRating,
  "id" | "createdAt" | "editedAt" | "editCount"
> & {
  workerName: string;
  jobTitle: string;
};

export type SubmitEmployerShiftRatingSagaResult =
  | { ok: true; rating: EmployerToWorkerRating; pointsApplied: boolean }
  | { ok: false; reason: "invalid_domain" | "already_rated" | "rating_write_error" };

function ratingWasPersisted(input: SubmitEmployerShiftRatingSagaInput): boolean {
  const saved = ratingStorage.getEmployerRatingForJob(
    input.employerWmId,
    input.jobId,
    input.workerWmId,
  );

  return saved !== null && saved.stars === input.stars;
}

export function submitEmployerShiftRatingSaga(
  input: SubmitEmployerShiftRatingSagaInput,
): SubmitEmployerShiftRatingSagaResult {
  if (input.domain !== "shift") {
    return { ok: false, reason: "invalid_domain" };
  }

  if (ratingStorage.hasEmployerRatedWorker(input.employerWmId, input.jobId, input.workerWmId)) {
    return { ok: false, reason: "already_rated" };
  }

  const rating = ratingStorage.saveEmployerRating(input);

  if (!ratingWasPersisted(input)) {
    return { ok: false, reason: "rating_write_error" };
  }

  try {
    if (input.stars === 5)
      workerPointsStorage.applyEvent(input.workerWmId, "rating_5star", input.jobId);
    else if (input.stars === 4)
      workerPointsStorage.applyEvent(input.workerWmId, "rating_4star", input.jobId);
    else if (input.stars <= 2)
      workerPointsStorage.applyEvent(input.workerWmId, "rating_1or2star", input.jobId);

    if (input.tags.includes("Reliable")) {
      workerPointsStorage.applyEvent(input.workerWmId, "tag_reliable", input.jobId);
    }

    if (input.hireAgain) {
      workerPointsStorage.applyEvent(input.workerWmId, "hire_again", input.jobId);
      favoritesStorage.addFromRating({
        workerWmId: input.workerWmId,
        workerName: input.workerName,
        jobTitle: input.jobTitle,
        stars: input.stars,
      });
    }

    return { ok: true, rating, pointsApplied: true };
  } catch (error) {
    if (error instanceof WorkerPointsStorageWriteError) {
      console.warn("[submitEmployerShiftRatingSaga] Rating saved but points could not be applied", {
        workerWmId: input.workerWmId,
        jobId: input.jobId,
      });
      return { ok: true, rating, pointsApplied: false };
    }

    throw error;
  }
}
