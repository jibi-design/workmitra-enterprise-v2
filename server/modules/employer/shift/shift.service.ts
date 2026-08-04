import type { AuthUser } from "../../auth/types.js";
import type { ShiftPostRow, ShiftWorkspaceRow } from "../../shift/types.js";
import { employerShiftRepository, isShiftUuid } from "./shift.repository.js";
import { isLiveShiftStatus } from "../verification/employerMaturity.policy.js";
import { employerVerificationService } from "../verification/employerVerification.service.js";

export type ShiftPostMutationResult =
  | { ok: true; post: ShiftPostRow }
  | {
      ok: false;
      code: string;
      message: string;
      httpStatus: number;
      reason?: string;
      maturityStage?: string;
    };

export type ShiftPostListResult =
  | { ok: true; posts: ShiftPostRow[] }
  | { ok: false; code: string; message: string; httpStatus: number };

export type ShiftPostDeleteResult =
  | { ok: true; mode: "deleted" | "cancelled" }
  | { ok: false; code: string; message: string; httpStatus: number };

export type ShiftWorkspaceGetResult =
  | { ok: true; workspace: ShiftWorkspaceRow }
  | { ok: false; code: string; message: string; httpStatus: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseIsoDate(value: unknown, _field: string): Date | null {
  void _field;
  if (typeof value === "number" && Number.isFinite(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "string" && value.trim()) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function gateLivePublish(employer: AuthUser, status: string): ShiftPostMutationResult | null {
  if (!isLiveShiftStatus(status)) return null;
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

export const employerShiftService = {
  async listMyPosts(employer: AuthUser): Promise<ShiftPostListResult> {
    const posts = await employerShiftRepository.listPostsByEmployer(employer.id);
    return { ok: true, posts };
  },

  async createPost(
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<ShiftPostMutationResult> {
    const jobName = asNonEmptyString(body.job_name) ?? asNonEmptyString(body.jobName);
    const category = asNonEmptyString(body.category) ?? "general";
    if (!jobName) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "job_name is required",
        httpStatus: 400,
      };
    }

    const vacanciesRaw = body.vacancies;
    const vacancies =
      typeof vacanciesRaw === "number" && Number.isInteger(vacanciesRaw) ? vacanciesRaw : NaN;
    if (!Number.isInteger(vacancies) || vacancies < 1) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "vacancies must be a positive integer",
        httpStatus: 400,
      };
    }

    const startAt =
      parseIsoDate(body.start_at, "start_at") ?? parseIsoDate(body.startAt, "startAt");
    const endAt = parseIsoDate(body.end_at, "end_at") ?? parseIsoDate(body.endAt, "endAt");
    if (!startAt || !endAt || endAt <= startAt) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "start_at and end_at are required and end_at must be after start_at",
        httpStatus: 400,
      };
    }

    const statusRaw = typeof body.status === "string" ? body.status.trim() : "active";
    if (statusRaw !== "active" && statusRaw !== "completed" && statusRaw !== "cancelled") {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "status must be active, completed, or cancelled",
        httpStatus: 400,
      };
    }

    const denied = gateLivePublish(employer, statusRaw);
    if (denied) return denied;

    const details = isRecord(body.details) ? body.details : {};

    const post = await employerShiftRepository.createPost({
      employerId: employer.id,
      jobName,
      category,
      status: statusRaw,
      vacancies,
      startAt,
      endAt,
      details,
    });

    return { ok: true, post };
  },

  async updatePost(
    postId: string,
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<ShiftPostMutationResult> {
    if (!isShiftUuid(postId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "postId must be a valid UUID",
        httpStatus: 400,
      };
    }

    const existing = await employerShiftRepository.findPostById(postId);
    if (!existing) {
      return { ok: false, code: "NOT_FOUND", message: "Shift post not found", httpStatus: 404 };
    }
    if (existing.employer_id !== employer.id) {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "You do not own this shift post",
        httpStatus: 403,
      };
    }

    const jobName =
      asNonEmptyString(body.job_name) ?? asNonEmptyString(body.jobName) ?? existing.job_name;
    const category = asNonEmptyString(body.category) ?? existing.category;

    const vacanciesRaw = body.vacancies;
    const vacancies =
      typeof vacanciesRaw === "number" && Number.isInteger(vacanciesRaw)
        ? vacanciesRaw
        : existing.vacancies;
    if (!Number.isInteger(vacancies) || vacancies < 1) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "vacancies must be a positive integer",
        httpStatus: 400,
      };
    }

    const startAt =
      parseIsoDate(body.start_at, "start_at") ??
      parseIsoDate(body.startAt, "startAt") ??
      existing.start_at;
    const endAt =
      parseIsoDate(body.end_at, "end_at") ?? parseIsoDate(body.endAt, "endAt") ?? existing.end_at;
    if (!startAt || !endAt || endAt <= startAt) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "start_at and end_at are required and end_at must be after start_at",
        httpStatus: 400,
      };
    }

    const statusRaw = typeof body.status === "string" ? body.status.trim() : existing.status;
    if (statusRaw !== "active" && statusRaw !== "completed" && statusRaw !== "cancelled") {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "status must be active, completed, or cancelled",
        httpStatus: 400,
      };
    }

    const denied = gateLivePublish(employer, statusRaw);
    if (denied) return denied;

    const details = isRecord(body.details)
      ? { ...(isRecord(existing.details) ? existing.details : {}), ...body.details }
      : existing.details;

    const post = await employerShiftRepository.updatePost({
      postId,
      employerId: employer.id,
      jobName,
      category,
      status: statusRaw,
      vacancies,
      startAt,
      endAt,
      details: isRecord(details) ? details : {},
    });

    if (!post) {
      return { ok: false, code: "NOT_FOUND", message: "Shift post not found", httpStatus: 404 };
    }
    return { ok: true, post };
  },

  async deletePost(postId: string, employer: AuthUser): Promise<ShiftPostDeleteResult> {
    if (!isShiftUuid(postId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "postId must be a valid UUID",
        httpStatus: 400,
      };
    }

    const mode = await employerShiftRepository.deletePostIfNoApplications(postId, employer.id);
    if (mode === "not_found") {
      return { ok: false, code: "NOT_FOUND", message: "Shift post not found", httpStatus: 404 };
    }
    if (mode === "forbidden") {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "You do not own this shift post",
        httpStatus: 403,
      };
    }
    return { ok: true, mode };
  },

  async getWorkspaceForApplication(
    postId: string,
    appId: string,
    employer: AuthUser,
  ): Promise<ShiftWorkspaceGetResult> {
    if (!isShiftUuid(postId) || !isShiftUuid(appId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "postId and appId must be valid UUIDs",
        httpStatus: 400,
      };
    }

    const post = await employerShiftRepository.findPostById(postId);
    if (!post) {
      return { ok: false, code: "NOT_FOUND", message: "Shift post not found", httpStatus: 404 };
    }
    if (post.employer_id !== employer.id) {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "You do not own this shift post",
        httpStatus: 403,
      };
    }

    const application = await employerShiftRepository.findApplicationById(appId);
    if (!application || application.post_id !== postId) {
      return { ok: false, code: "NOT_FOUND", message: "Application not found", httpStatus: 404 };
    }

    const workspace = await employerShiftRepository.findWorkspaceByPostAndApp(postId, appId);
    if (!workspace) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Workspace not found for this application",
        httpStatus: 404,
      };
    }

    return { ok: true, workspace };
  },

  async getOwnedPost(postId: string, employer: AuthUser): Promise<ShiftPostMutationResult> {
    if (!isShiftUuid(postId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "postId must be a valid UUID",
        httpStatus: 400,
      };
    }
    const post = await employerShiftRepository.findPostById(postId);
    if (!post) {
      return { ok: false, code: "NOT_FOUND", message: "Shift post not found", httpStatus: 404 };
    }
    if (post.employer_id !== employer.id) {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "You do not own this shift post",
        httpStatus: 403,
      };
    }
    return { ok: true, post };
  },

  async getPublishedPost(postId: string): Promise<ShiftPostRow | null> {
    if (!isShiftUuid(postId)) return null;
    const post = await employerShiftRepository.findPostById(postId);
    if (!post || post.status !== "active") return null;
    return post;
  },
};
