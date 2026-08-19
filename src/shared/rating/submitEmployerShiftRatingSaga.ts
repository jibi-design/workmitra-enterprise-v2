// Job Mitra | submitEmployerShiftRatingSaga.ts
// Employer rates worker on a completed shift — rating + worker points.

import { persistShiftReviewToServer } from "../../features/shift/services/persistShiftReviewToServer";
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
  workspaceId?: string;
  appId?: string;
};

export type SubmitEmployerShiftRatingSagaResult =
  | { ok: true; rating: EmployerToWorkerRating; pointsApplied: boolean; persist: Promise<void> }
  | { ok: false; reason: "invalid_domain" | "already_rated" | "rating_write_error" };

function ratingWasPersisted(input: SubmitEmployerShiftRatingSagaInput): boolean {
  const saved = ratingStorage.getEmployerRatingForJob(
    input.employerMlId,
    input.jobId,
    input.workerMlId,
  );

  return saved !== null && saved.stars === input.stars;
}

export function submitEmployerShiftRatingSaga(
  input: SubmitEmployerShiftRatingSagaInput,
): SubmitEmployerShiftRatingSagaResult {
  if (input.domain !== "shift") {
    return { ok: false, reason: "invalid_domain" };
  }

  if (ratingStorage.hasEmployerRatedWorker(input.employerMlId, input.jobId, input.workerMlId)) {
    return { ok: false, reason: "already_rated" };
  }

  const rating = ratingStorage.saveEmployerRating(input);

  if (!ratingWasPersisted(input)) {
    return { ok: false, reason: "rating_write_error" };
  }

  const persist = persistShiftReviewToServer({
    role: "employer",
    workspaceId: input.workspaceId,
    postId: input.jobId,
    appId: input.appId,
    rating: input.stars,
    body: input.comment,
  });

  try {
    if (input.stars === 5)
      workerPointsStorage.applyEvent(input.workerMlId, "rating_5star", input.jobId);
    else if (input.stars === 4)
      workerPointsStorage.applyEvent(input.workerMlId, "rating_4star", input.jobId);
    else if (input.stars <= 2)
      workerPointsStorage.applyEvent(input.workerMlId, "rating_1or2star", input.jobId);

    if (input.tags.includes("Reliable")) {
      workerPointsStorage.applyEvent(input.workerMlId, "tag_reliable", input.jobId);
    }

    if (input.hireAgain) {
      workerPointsStorage.applyEvent(input.workerMlId, "hire_again", input.jobId);
      favoritesStorage.addFromRating({
        workerMlId: input.workerMlId,
        workerName: input.workerName,
        jobTitle: input.jobTitle,
        stars: input.stars,
      });
    }

    return { ok: true, rating, pointsApplied: true, persist };
  } catch (error) {
    if (error instanceof WorkerPointsStorageWriteError) {
      console.warn("[submitEmployerShiftRatingSaga] Rating saved but points could not be applied", {
        workerMlId: input.workerMlId,
        jobId: input.jobId,
      });
      return { ok: true, rating, pointsApplied: false, persist };
    }

    throw error;
  }
}
