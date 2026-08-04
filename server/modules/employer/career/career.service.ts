import { employerCareerRepository, isCareerUuid } from "./career.repository.js";
import type { AuthUser } from "../../auth/types.js";
import type {
  CareerApplicationRow,
  CareerOfferRow,
  CareerEmploymentRow,
  CareerPostRow,
} from "../../career/types.js";
import { isLiveCareerStatus } from "../verification/employerMaturity.policy.js";
import { employerVerificationService } from "../verification/employerVerification.service.js";

export type IssueOfferResult =
  | { ok: true; offer: CareerOfferRow }
  | { ok: false; code: string; message: string; httpStatus: number };

export type ConfirmHireResult =
  | { ok: true; employment: CareerEmploymentRow; alreadyConfirmed: boolean }
  | { ok: false; code: string; message: string; httpStatus: number };

export type CareerPostMutationResult =
  | { ok: true; post: CareerPostRow }
  | {
      ok: false;
      code: string;
      message: string;
      httpStatus: number;
      reason?: string;
      maturityStage?: string;
    };

export type CareerPostListResult =
  | { ok: true; posts: CareerPostRow[] }
  | { ok: false; code: string; message: string; httpStatus: number };

export type CareerPostDeleteResult =
  { ok: true } | { ok: false; code: string; message: string; httpStatus: number };

const ALLOWED_SERVER_POST_STATUSES = new Set(["draft", "published", "closed"]);

const ALLOWED_APPLICATION_STATUSES = new Set([
  "pending",
  "shortlisted",
  "interview_scheduled",
  "offer_issued",
  "offer_accepted",
  "offer_declined",
  "hired",
  "rejected",
  "withdrawn",
]);

const EMPLOYER_PATCHABLE_APPLICATION_STATUSES = new Set([
  "pending",
  "shortlisted",
  "interview_scheduled",
  "rejected",
]);

export type CareerApplicationListResult =
  | { ok: true; applications: CareerApplicationRow[] }
  | { ok: false; code: string; message: string; httpStatus: number };

export type CareerApplicationMutationResult =
  | { ok: true; application: CareerApplicationRow }
  | { ok: false; code: string; message: string; httpStatus: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNonEmptyString(value: unknown, _field: string): string | null {
  void _field;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeCreateOrUpdateBody(body: Record<string, unknown>):
  | {
      ok: true;
      title: string;
      description: string;
      location: string | null;
      status: string;
      details: Record<string, unknown>;
    }
  | {
      ok: false;
      message: string;
    } {
  const title = asNonEmptyString(body.title, "title");
  const description = asNonEmptyString(body.description, "description");
  if (!title) return { ok: false, message: "title is required" };
  if (!description) return { ok: false, message: "description is required" };

  const locationRaw = body.location;
  const location =
    typeof locationRaw === "string" && locationRaw.trim() ? locationRaw.trim() : null;

  const statusRaw = typeof body.status === "string" ? body.status.trim() : "published";
  if (!ALLOWED_SERVER_POST_STATUSES.has(statusRaw)) {
    return { ok: false, message: "status must be draft, published, or closed" };
  }

  const details = isRecord(body.details) ? body.details : {};

  return { ok: true, title, description, location, status: statusRaw, details };
}

function gateLivePublish(employer: AuthUser, status: string): CareerPostMutationResult | null {
  if (!isLiveCareerStatus(status)) return null;
  const gate = employerVerificationService.assertEmployerCanPublishLive(employer);
  if (gate.ok) return null;
  return {
    ok: false,
    code: gate.code,
    reason: gate.reason,
    message: gate.message,
    httpStatus: gate.httpStatus,
    maturityStage: gate.maturityStage,
  };
}

export const employerCareerService = {
  async listMyPosts(employer: AuthUser): Promise<CareerPostListResult> {
    const posts = await employerCareerRepository.listPostsByEmployer(employer.id);
    return { ok: true, posts };
  },

  async createPost(
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<CareerPostMutationResult> {
    const normalized = normalizeCreateOrUpdateBody(body);
    if (!normalized.ok) {
      return { ok: false, code: "VALIDATION_ERROR", message: normalized.message, httpStatus: 400 };
    }

    const denied = gateLivePublish(employer, normalized.status);
    if (denied) return denied;

    const post = await employerCareerRepository.createPost({
      employerUserId: employer.id,
      title: normalized.title,
      description: normalized.description,
      location: normalized.location,
      status: normalized.status,
      details: normalized.details,
    });

    return { ok: true, post };
  },

  async updatePost(
    postId: string,
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<CareerPostMutationResult> {
    const existing = await employerCareerRepository.findPostById(postId);
    if (!existing) {
      return { ok: false, code: "NOT_FOUND", message: "Job post not found", httpStatus: 404 };
    }
    if (existing.employer_user_id !== employer.id) {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "You do not own this job post",
        httpStatus: 403,
      };
    }

    const normalized = normalizeCreateOrUpdateBody(body);
    if (!normalized.ok) {
      return { ok: false, code: "VALIDATION_ERROR", message: normalized.message, httpStatus: 400 };
    }

    const denied = gateLivePublish(employer, normalized.status);
    if (denied) return denied;

    const post = await employerCareerRepository.updatePost({
      postId,
      employerUserId: employer.id,
      title: normalized.title,
      description: normalized.description,
      location: normalized.location,
      status: normalized.status,
      details: normalized.details,
    });

    if (!post) {
      return { ok: false, code: "NOT_FOUND", message: "Job post not found", httpStatus: 404 };
    }

    return { ok: true, post };
  },

  async deletePost(postId: string, employer: AuthUser): Promise<CareerPostDeleteResult> {
    const existing = await employerCareerRepository.findPostById(postId);
    if (!existing) {
      return { ok: false, code: "NOT_FOUND", message: "Job post not found", httpStatus: 404 };
    }
    if (existing.employer_user_id !== employer.id) {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "You do not own this job post",
        httpStatus: 403,
      };
    }

    const deleted = await employerCareerRepository.softDeletePost(postId, employer.id);
    if (!deleted) {
      return { ok: false, code: "NOT_FOUND", message: "Job post not found", httpStatus: 404 };
    }
    return { ok: true };
  },

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
  async confirmHire(
    applicationId: string,
    employer: AuthUser,
    details?: Record<string, unknown>,
  ): Promise<ConfirmHireResult> {
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

    const snapshotDetails: Record<string, unknown> = {
      ...(details ?? {}),
      jobTitle: details?.jobTitle ?? post.title,
      companyName:
        details?.companyName ??
        (typeof post.details?.companyName === "string" ? post.details.companyName : ""),
      location: details?.location ?? post.location ?? "",
      postTitle: post.title,
    };

    try {
      const result = await employerCareerRepository.confirmHireTransaction({
        applicationId,
        postId: application.post_id,
        employeeUserId: application.applicant_user_id,
        employerUserId: employer.id,
        details: snapshotDetails,
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

  async listApplicationsForJob(
    jobId: string,
    employer: AuthUser,
  ): Promise<CareerApplicationListResult> {
    if (!isCareerUuid(jobId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "jobId must be a valid UUID",
        httpStatus: 400,
      };
    }

    const post = await employerCareerRepository.findPostById(jobId);
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

    const applications = await employerCareerRepository.listApplicationsByPostId(jobId);
    return { ok: true, applications };
  },

  async getApplicationForJob(
    jobId: string,
    applicationId: string,
    employer: AuthUser,
  ): Promise<CareerApplicationMutationResult> {
    if (!isCareerUuid(jobId) || !isCareerUuid(applicationId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "jobId and applicationId must be valid UUIDs",
        httpStatus: 400,
      };
    }

    const post = await employerCareerRepository.findPostById(jobId);
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

    const application = await employerCareerRepository.findApplicationByPostAndId(
      jobId,
      applicationId,
    );
    if (!application) {
      return { ok: false, code: "NOT_FOUND", message: "Application not found", httpStatus: 404 };
    }

    return { ok: true, application };
  },

  async updateApplicationStatus(
    jobId: string,
    applicationId: string,
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<CareerApplicationMutationResult> {
    if (!isCareerUuid(jobId) || !isCareerUuid(applicationId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "jobId and applicationId must be valid UUIDs",
        httpStatus: 400,
      };
    }

    const statusRaw = typeof body.status === "string" ? body.status.trim() : "";
    if (!statusRaw || !ALLOWED_APPLICATION_STATUSES.has(statusRaw)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "status must be a valid career application status",
        httpStatus: 400,
      };
    }
    if (!EMPLOYER_PATCHABLE_APPLICATION_STATUSES.has(statusRaw)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message:
          "status patch is limited to pending, shortlisted, interview_scheduled, or rejected",
        httpStatus: 400,
      };
    }

    const post = await employerCareerRepository.findPostById(jobId);
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

    const application = await employerCareerRepository.findApplicationByPostAndId(
      jobId,
      applicationId,
    );
    if (!application) {
      return { ok: false, code: "NOT_FOUND", message: "Application not found", httpStatus: 404 };
    }

    if (application.status === statusRaw) {
      return { ok: true, application };
    }

    // Gate statuses (offer/hire) must use dedicated endpoints
    const locked = ["offer_issued", "offer_accepted", "hired"];
    if (locked.includes(application.status)) {
      return {
        ok: false,
        code: "INVALID_STATE",
        message: `Cannot patch status while application is in '${application.status}' — use offer/confirm-hire flows`,
        httpStatus: 409,
      };
    }

    await employerCareerRepository.updateApplicationStatus(applicationId, statusRaw);
    await employerCareerRepository.logLifecycleEvent({
      applicationId,
      actorUserId: employer.id,
      actorRole: "employer",
      eventType: "status_updated",
      previousStatus: application.status,
      newStatus: statusRaw,
    });

    const updated = await employerCareerRepository.findApplicationById(applicationId);
    if (!updated) {
      return { ok: false, code: "NOT_FOUND", message: "Application not found", httpStatus: 404 };
    }
    return { ok: true, application: updated };
  },

  async shortlistApplication(
    applicationId: string,
    employer: AuthUser,
  ): Promise<CareerApplicationMutationResult> {
    if (!isCareerUuid(applicationId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "applicationId must be a valid UUID",
        httpStatus: 400,
      };
    }

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

    if (application.status === "shortlisted") {
      return { ok: true, application };
    }

    if (application.status !== "pending") {
      return {
        ok: false,
        code: "INVALID_STATE",
        message: `Cannot shortlist — application is in '${application.status}' status`,
        httpStatus: 409,
      };
    }

    await employerCareerRepository.updateApplicationStatus(applicationId, "shortlisted");
    await employerCareerRepository.logLifecycleEvent({
      applicationId,
      actorUserId: employer.id,
      actorRole: "employer",
      eventType: "shortlisted",
      previousStatus: application.status,
      newStatus: "shortlisted",
    });

    const updated = await employerCareerRepository.findApplicationById(applicationId);
    if (!updated) {
      return { ok: false, code: "NOT_FOUND", message: "Application not found", httpStatus: 404 };
    }
    return { ok: true, application: updated };
  },

  async listMyEmployments(
    employer: AuthUser,
  ): Promise<
    | { ok: true; employments: CareerEmploymentRow[] }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    try {
      const employments = await employerCareerRepository.listEmploymentsByEmployer(employer.id);
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
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<
    | { ok: true; employment: CareerEmploymentRow }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
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

    const updated = await employerCareerRepository.updateEmploymentDetails(
      employmentId,
      employer.id,
      { status: statusRaw, details },
    );

    if (!updated) {
      return { ok: false, code: "NOT_FOUND", message: "Employment not found", httpStatus: 404 };
    }

    return { ok: true, employment: updated };
  },
};
