import { employerCareerRepository } from "./career.repository.js";
import type { AuthUser } from "../../auth/types.js";
import type { CareerOfferRow, CareerEmploymentRow } from "../../career/types.js";

export type IssueOfferResult =
  | { ok: true; offer: CareerOfferRow }
  | { ok: false; code: string; message: string; httpStatus: number };

export type ConfirmHireResult =
  | { ok: true; employment: CareerEmploymentRow; alreadyConfirmed: boolean }
  | { ok: false; code: string; message: string; httpStatus: number };

export const employerCareerService = {
  /**
   * Step 1 of the Career Employment gate.
   * Employer issues an offer to an applicant.
   *
   * Validations:
   * - Application exists
   * - Post exists and is owned by this employer
   * - Application is in a pre-offer state
   * - No offer already exists for this application
   */
  async issueOffer(
    applicationId: string,
    employer: AuthUser,
    terms: Record<string, unknown>,
    expiresAt: Date | null,
  ): Promise<IssueOfferResult> {
    const application = await employerCareerRepository.findApplicationById(applicationId);
    if (!application) {
      return { ok: false, code: "NOT_FOUND", message: "Application not found", httpStatus: 404 };
    }

    const post = await employerCareerRepository.findPostById(application.post_id);
    if (!post) {
      return { ok: false, code: "NOT_FOUND", message: "Job post not found", httpStatus: 404 };
    }

    if (post.employer_user_id !== employer.id) {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "You do not own this job post",
        httpStatus: 403,
      };
    }

    const validPreOfferStatuses = ["pending", "shortlisted", "interview_scheduled"];
    if (!validPreOfferStatuses.includes(application.status)) {
      return {
        ok: false,
        code: "INVALID_STATE",
        message: `Cannot issue offer — application is in '${application.status}' status`,
        httpStatus: 409,
      };
    }

    const existingOffer = await employerCareerRepository.findOfferByApplicationId(applicationId);
    if (existingOffer) {
      return {
        ok: false,
        code: "CONFLICT",
        message: "An offer already exists for this application",
        httpStatus: 409,
      };
    }

    const offer = await employerCareerRepository.createOffer({
      applicationId,
      employerUserId: employer.id,
      terms,
      expiresAt,
    });

    await employerCareerRepository.updateApplicationStatus(applicationId, "offer_issued");

    await employerCareerRepository.logLifecycleEvent({
      applicationId,
      actorUserId: employer.id,
      actorRole: "employer",
      eventType: "offer_issued",
      previousStatus: application.status,
      newStatus: "offer_issued",
    });

    return { ok: true, offer };
  },

  /**
   * Step 3 of the Career Employment gate.
   * Employer confirms the hire after the employee has accepted.
   *
   * This is the final gate. Employment is only created when:
   *   offer_issued → offer_accepted → THIS ACTION → hired
   *
   * Idempotent: calling this twice returns the same Employment record.
   * Concurrent calls are serialised via SELECT FOR UPDATE in the transaction.
   */
  async confirmHire(applicationId: string, employer: AuthUser): Promise<ConfirmHireResult> {
    const application = await employerCareerRepository.findApplicationById(applicationId);
    if (!application) {
      return { ok: false, code: "NOT_FOUND", message: "Application not found", httpStatus: 404 };
    }

    const post = await employerCareerRepository.findPostById(application.post_id);
    if (!post) {
      return { ok: false, code: "NOT_FOUND", message: "Job post not found", httpStatus: 404 };
    }

    if (post.employer_user_id !== employer.id) {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "You do not own this job post",
        httpStatus: 403,
      };
    }

    // Fast-path idempotency: if already hired with existing employment, return it immediately
    if (application.status === "hired") {
      const existing = await employerCareerRepository.findEmploymentByApplicationId(applicationId);
      if (existing) {
        return { ok: true, employment: existing, alreadyConfirmed: true };
      }
    }

    // Gate check before entering transaction (will be re-verified inside with row lock)
    if (application.status !== "offer_accepted" && application.status !== "hired") {
      return {
        ok: false,
        code: "INVALID_STATE",
        message: `Cannot confirm hire — employee must have accepted the offer first. Current status: '${application.status}'`,
        httpStatus: 409,
      };
    }

    try {
      const result = await employerCareerRepository.confirmHireTransaction({
        applicationId,
        postId: application.post_id,
        employeeUserId: application.applicant_user_id,
        employerUserId: employer.id,
      });

      return {
        ok: true,
        employment: result.employment,
        alreadyConfirmed: !result.wasCreated,
      };
    } catch (err) {
      const typed = err as { code?: string; httpStatus?: number; message?: string };
      if (typed.code === "INVALID_STATE") {
        return {
          ok: false,
          code: typed.code,
          message: typed.message ?? "Invalid state",
          httpStatus: typed.httpStatus ?? 409,
        };
      }
      throw err;
    }
  },
};
