import { employeeCareerRepository } from "./career.repository.js";
import type { AuthUser } from "../../auth/types.js";
import type { CareerApplicationRow } from "../../career/types.js";

export type AcceptOfferResult =
  | { ok: true; application: CareerApplicationRow }
  | { ok: false; code: string; message: string; httpStatus: number };

export type DeclineOfferResult =
  | { ok: true; application: CareerApplicationRow }
  | { ok: false; code: string; message: string; httpStatus: number };

export const employeeCareerService = {
  /**
   * Step 2 of the Career Employment gate.
   * Employee accepts the offer issued by the employer.
   *
   * Validations:
   * - Application exists
   * - Caller is the applicant (never trust client-supplied IDs)
   * - Application status is 'offer_issued'
   * - A pending offer exists and has not expired
   *
   * After this step the employer may call confirm-hire (Step 3).
   * Employment is NOT created here — only after employer confirmation.
   */
  async acceptOffer(applicationId: string, employee: AuthUser): Promise<AcceptOfferResult> {
    const application = await employeeCareerRepository.findApplicationById(applicationId);
    if (!application) {
      return { ok: false, code: "NOT_FOUND", message: "Application not found", httpStatus: 404 };
    }

    if (application.applicant_user_id !== employee.id) {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "You are not the applicant for this application",
        httpStatus: 403,
      };
    }

    if (application.status !== "offer_issued") {
      return {
        ok: false,
        code: "INVALID_STATE",
        message: `Cannot accept offer — application is in '${application.status}' status`,
        httpStatus: 409,
      };
    }

    const offer = await employeeCareerRepository.findPendingOfferByApplicationId(applicationId);
    if (!offer) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "No active offer found for this application",
        httpStatus: 404,
      };
    }

    if (offer.expires_at !== null && offer.expires_at < new Date()) {
      return {
        ok: false,
        code: "OFFER_EXPIRED",
        message: "This offer has expired and can no longer be accepted",
        httpStatus: 410,
      };
    }

    try {
      await employeeCareerRepository.acceptOfferTransaction(applicationId, offer.id);
    } catch (err) {
      const typed = err as { code?: string; httpStatus?: number; message?: string };
      if (typed.code === "CONFLICT") {
        return {
          ok: false,
          code: typed.code,
          message: typed.message ?? "Offer state conflict",
          httpStatus: typed.httpStatus ?? 409,
        };
      }
      throw err;
    }

    await employeeCareerRepository.logLifecycleEvent({
      applicationId,
      actorUserId: employee.id,
      actorRole: "employee",
      eventType: "offer_accepted",
      previousStatus: "offer_issued",
      newStatus: "offer_accepted",
    });

    const updated = await employeeCareerRepository.findApplicationById(applicationId);
    return { ok: true, application: updated! };
  },

  /**
   * Employee declines the offer.
   * No Employment is created. Application moves to 'offer_declined'.
   *
   * Validations mirror acceptOffer — same ownership and state checks.
   */
  async declineOffer(applicationId: string, employee: AuthUser): Promise<DeclineOfferResult> {
    const application = await employeeCareerRepository.findApplicationById(applicationId);
    if (!application) {
      return { ok: false, code: "NOT_FOUND", message: "Application not found", httpStatus: 404 };
    }

    if (application.applicant_user_id !== employee.id) {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "You are not the applicant for this application",
        httpStatus: 403,
      };
    }

    if (application.status !== "offer_issued") {
      return {
        ok: false,
        code: "INVALID_STATE",
        message: `Cannot decline offer — application is in '${application.status}' status`,
        httpStatus: 409,
      };
    }

    const offer = await employeeCareerRepository.findPendingOfferByApplicationId(applicationId);
    if (!offer) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "No active offer found for this application",
        httpStatus: 404,
      };
    }

    try {
      await employeeCareerRepository.declineOfferTransaction(applicationId, offer.id);
    } catch (err) {
      const typed = err as { code?: string; httpStatus?: number; message?: string };
      if (typed.code === "CONFLICT") {
        return {
          ok: false,
          code: typed.code,
          message: typed.message ?? "Offer state conflict",
          httpStatus: typed.httpStatus ?? 409,
        };
      }
      throw err;
    }

    await employeeCareerRepository.logLifecycleEvent({
      applicationId,
      actorUserId: employee.id,
      actorRole: "employee",
      eventType: "offer_declined",
      previousStatus: "offer_issued",
      newStatus: "offer_declined",
    });

    const updated = await employeeCareerRepository.findApplicationById(applicationId);
    return { ok: true, application: updated! };
  },
};
