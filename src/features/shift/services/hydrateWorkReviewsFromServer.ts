/** Job Mitra | hydrateWorkReviewsFromServer.ts | Merge work_reviews into ratingStorage */

import { identityBridge } from "../../../app/identity/identity.adapter";
import { employeeProfileStorage } from "../../employee/profile/storage/employeeProfile.storage";
import { employerSettingsStorage } from "../../employer/company/storage/employerSettings.storage";
import { ratingStorage } from "../../../shared/rating/ratingStorage";
import { listShiftReviews, type ServerWorkReviewDto } from "./shiftGateApi.reviews";
import { isShiftApiSyncEnabled } from "./shiftGateApi.service";
import { expandShiftPostIdAliases, shiftPostIdBridge } from "../utils/shiftIdBridge";

function legacyForAuth(role: "employee" | "employer", authId: string): string | null {
  const map = identityBridge.load()[role];
  const needle = authId.trim().toLowerCase();
  for (const [legacy, auth] of Object.entries(map)) {
    if (auth.trim().toLowerCase() === needle) return legacy;
  }
  return null;
}

function jobIdForReview(review: ServerWorkReviewDto): string {
  const postId = review.post_id?.trim() ?? "";
  if (!postId) return "";
  return shiftPostIdBridge.resolveLocalId(postId) ?? postId;
}

function alreadyHasEr(employerMlId: string, jobId: string, workerMlId: string): boolean {
  return expandShiftPostIdAliases(jobId).some((alias) =>
    ratingStorage.hasEmployerRatedWorker(employerMlId, alias, workerMlId),
  );
}

function alreadyHasWr(workerMlId: string, jobId: string, employerMlId: string): boolean {
  return expandShiftPostIdAliases(jobId).some((alias) =>
    ratingStorage.hasWorkerRatedEmployer(workerMlId, alias, employerMlId),
  );
}

export async function hydrateWorkReviewsFromServer(
  role: "employer" | "employee",
): Promise<number> {
  if (!isShiftApiSyncEnabled()) return 0;
  let reviews: ServerWorkReviewDto[] = [];
  try {
    reviews = await listShiftReviews(role);
  } catch {
    return 0;
  }

  const employeeMl =
    employeeProfileStorage.get().uniqueId?.trim() ||
    legacyForAuth("employee", reviews[0]?.reviewee_user_id ?? "") ||
    "";
  const employerMl =
    employerSettingsStorage.get().uniqueId?.trim() ||
    legacyForAuth("employer", reviews[0]?.reviewer_user_id ?? "") ||
    "";

  let merged = 0;
  for (const review of reviews) {
    const jobId = jobIdForReview(review);
    if (!jobId) continue;
    const stars = review.rating as 1 | 2 | 3 | 4 | 5;
    if (review.direction === "employer_to_employee") {
      const workerMlId =
        legacyForAuth("employee", review.reviewee_user_id) ??
        (role === "employee" ? employeeMl : review.reviewee_user_id);
      const employerMlId =
        legacyForAuth("employer", review.reviewer_user_id) ??
        (role === "employer" ? employerMl : review.reviewer_user_id);
      if (!workerMlId || !employerMlId) continue;
      if (alreadyHasEr(employerMlId, jobId, workerMlId)) continue;
      ratingStorage.saveEmployerRating({
        domain: "shift",
        employerMlId,
        workerMlId,
        jobId,
        stars,
        tags: [],
        comment: review.body || undefined,
        hireAgain: false,
      });
      merged += 1;
    } else {
      const workerMlId =
        legacyForAuth("employee", review.reviewer_user_id) ??
        (role === "employee" ? employeeMl : review.reviewer_user_id);
      const employerMlId =
        legacyForAuth("employer", review.reviewee_user_id) ??
        (role === "employer" ? employerMl : review.reviewee_user_id);
      if (!workerMlId || !employerMlId) continue;
      if (alreadyHasWr(workerMlId, jobId, employerMlId)) continue;
      ratingStorage.saveWorkerRating({
        domain: "shift",
        workerMlId,
        employerMlId,
        jobId,
        stars,
        tags: [],
        comment: review.body || undefined,
        workAgain: false,
      });
      merged += 1;
    }
  }
  return merged;
}
