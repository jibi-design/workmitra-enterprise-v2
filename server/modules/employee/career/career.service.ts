import { employeeCareerRepository, isCareerUuid } from "./career.repository.js";
import type { AuthUser } from "../../auth/types.js";
import type {
  CareerApplicationRow,
  CareerEmploymentRow,
  CareerPostRow,
} from "../../career/types.js";

export type AcceptOfferResult =
  | { ok: true; application: CareerApplicationRow }
  | { ok: false; code: string; message: string; httpStatus: number };

export type DeclineOfferResult =
  | { ok: true; application: CareerApplicationRow }
  | { ok: false; code: string; message: string; httpStatus: number };

export type ApplyToJobResult =
  | { ok: true; application: CareerApplicationRow }
  | { ok: false; code: string; message: string; httpStatus: number };

export type ListApplicationsResult =
  | { ok: true; applications: CareerApplicationRow[] }
  | { ok: false; code: string; message: string; httpStatus: number };

export const employeeCareerService = {
  async listPublishedPosts(): Promise<
    | { ok: true; posts: CareerPostRow[] }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    try {
      const posts = await employeeCareerRepository.listPublishedPosts();
      return { ok: true, posts };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to list career posts",
        httpStatus: 500,
      };
    }
  },

  async getMyApplication(
    applicationId: string,
    employee: AuthUser,
  ): Promise<
    | { ok: true; application: CareerApplicationRow }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    if (!isCareerUuid(applicationId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "applicationId must be a valid UUID",
        httpStatus: 400,
      };
    }

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
    return { ok: true, application };
  },

  /**
   * Employee applies to a published Career post.
   * Identity comes from the authenticated session only — never from the body.
   */
  async applyToJob(
    postId: string,
    employee: AuthUser,
    coverNote: string | null,
  ): Promise<ApplyToJobResult> {
    if (!isCareerUuid(postId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "postId must be a valid UUID",
        httpStatus: 400,
      };
    }

    const post = await employeeCareerRepository.findPublishedPostById(postId);
    if (!post) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Career post not found or not published",
        httpStatus: 404,
      };
    }

    const existing = await employeeCareerRepository.findApplicationByPostAndApplicant(
      postId,
      employee.id,
    );
    if (existing) {
      return {
        ok: false,
        code: "CONFLICT",
        message: "You have already applied to this career post",
        httpStatus: 409,
      };
    }

    const application = await employeeCareerRepository.createApplication({
      postId,
      applicantUserId: employee.id,
      coverNote,
    });

    await employeeCareerRepository.logLifecycleEvent({
      applicationId: application.id,
      actorUserId: employee.id,
      actorRole: "employee",
      eventType: "application_submitted",
      previousStatus: null,
      newStatus: "pending",
    });

    return { ok: true, application };
  },

  async listMyApplications(employee: AuthUser): Promise<ListApplicationsResult> {
    const applications = await employeeCareerRepository.listApplicationsByApplicant(employee.id);
    return { ok: true, applications };
  },

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

  async listMyEmployments(
    employee: AuthUser,
  ): Promise<
    | { ok: true; employments: CareerEmploymentRow[] }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    try {
      const employments = await employeeCareerRepository.listEmploymentsByEmployee(employee.id);
      return { ok: true, employments };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to list employments",
        httpStatus: 500,
      };
    }
  },

  async updateEmployment(
    employmentId: string,
    employee: AuthUser,
    body: Record<string, unknown>,
  ): Promise<
    | { ok: true; employment: CareerEmploymentRow }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    if (!isCareerUuid(employmentId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "employmentId must be a valid UUID",
        httpStatus: 400,
      };
    }

    const statusRaw = typeof body.status === "string" ? body.status.trim() : undefined;
    const details =
      body.details && typeof body.details === "object" && !Array.isArray(body.details)
        ? (body.details as Record<string, unknown>)
        : undefined;

    if (statusRaw && !["active", "resigned", "terminated"].includes(statusRaw)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Invalid employment status",
        httpStatus: 400,
      };
    }

    const updated = await employeeCareerRepository.updateEmploymentByEmployee(
      employmentId,
      employee.id,
      { status: statusRaw, details },
    );

    if (!updated) {
      return { ok: false, code: "NOT_FOUND", message: "Employment not found", httpStatus: 404 };
    }

    return { ok: true, employment: updated };
  },
};
