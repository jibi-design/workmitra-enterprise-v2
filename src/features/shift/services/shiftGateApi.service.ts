/** Job Mitra | shiftGateApi.service.ts | src/features/shift/services/shiftGateApi.service.ts
 *
 * Phase 13 — Shift DB gate (posts/apply/list/confirm). AUTH_BACKEND_ENABLED only.
 */

import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { apiService } from "../../../shared/services/apiService";
import { isShiftServerUuid } from "../utils/shiftIdBridge";
import {
  archiveShiftOpsSite,
  completeShiftWorkspace,
  listShiftReviews,
  submitShiftReview,
} from "./shiftGateApi.reviews";

const EMPLOYER_SHIFT = "/v1/jobmitra/employer/shift";
const EMPLOYEE_SHIFT = "/v1/jobmitra/employee/shift";

interface ApiEnvelope<T> {
  data: T;
  meta?: { requestId?: string };
}

export function isShiftApiSyncEnabled(): boolean {
  return AUTH_BACKEND_ENABLED;
}

export type ServerShiftPostDto = {
  id: string;
  employer_id: string;
  job_name: string;
  category: string;
  status: string;
  vacancies: number;
  start_at: string;
  end_at: string;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ServerShiftApplicationDto = {
  id: string;
  post_id: string;
  worker_wm_id: string;
  status: string;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return "";
}

function asServerPost(value: unknown): ServerShiftPostDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  if (!isShiftServerUuid(id)) return null;
  return {
    id,
    employer_id: typeof value.employer_id === "string" ? value.employer_id : "",
    job_name: typeof value.job_name === "string" ? value.job_name : "",
    category: typeof value.category === "string" ? value.category : "",
    status: typeof value.status === "string" ? value.status : "",
    vacancies: typeof value.vacancies === "number" ? value.vacancies : 1,
    start_at: asIso(value.start_at),
    end_at: asIso(value.end_at),
    details: isRecord(value.details) ? value.details : {},
    created_at: asIso(value.created_at),
    updated_at: asIso(value.updated_at),
  };
}

function asServerApp(value: unknown): ServerShiftApplicationDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  const postId = typeof value.post_id === "string" ? value.post_id.trim() : "";
  if (!isShiftServerUuid(id) || !isShiftServerUuid(postId)) return null;
  return {
    id,
    post_id: postId,
    worker_wm_id: typeof value.worker_wm_id === "string" ? value.worker_wm_id : "",
    status: typeof value.status === "string" ? value.status : "",
    details: isRecord(value.details) ? value.details : {},
    created_at: asIso(value.created_at),
    updated_at: asIso(value.updated_at),
  };
}

export const shiftGateApi = {
  async listMyPosts(): Promise<ServerShiftPostDto[]> {
    const res = await apiService.get<ApiEnvelope<{ posts: unknown }>>(`${EMPLOYER_SHIFT}/posts`);
    const raw = res.data.posts;
    if (!Array.isArray(raw)) return [];
    return raw.map(asServerPost).filter((p): p is ServerShiftPostDto => p !== null);
  },

  async createPost(body: Record<string, unknown>): Promise<ServerShiftPostDto> {
    const res = await apiService.post<ApiEnvelope<{ post: unknown }>>(
      `${EMPLOYER_SHIFT}/posts`,
      body,
    );
    const post = asServerPost(res.data.post);
    if (!post) throw new Error("Invalid create shift post response");
    return post;
  },

  async listPostApplications(postId: string): Promise<ServerShiftApplicationDto[]> {
    const res = await apiService.get<ApiEnvelope<{ applications: unknown }>>(
      `${EMPLOYER_SHIFT}/posts/${encodeURIComponent(postId)}/applications`,
    );
    const raw = res.data.applications;
    if (!Array.isArray(raw)) return [];
    return raw.map(asServerApp).filter((a): a is ServerShiftApplicationDto => a !== null);
  },

  async listMyApplications(workerMlId?: string): Promise<ServerShiftApplicationDto[]> {
    const params =
      workerMlId?.trim() && isShiftServerUuid(workerMlId.trim())
        ? { worker_wm_id: workerMlId.trim() }
        : undefined;
    const res = await apiService.get<ApiEnvelope<{ applications: unknown }>>(
      `${EMPLOYEE_SHIFT}/applications`,
      params,
    );
    const raw = res.data.applications;
    if (!Array.isArray(raw)) return [];
    return raw.map(asServerApp).filter((a): a is ServerShiftApplicationDto => a !== null);
  },

  async applyToPost(
    postId: string,
    body: Record<string, unknown>,
  ): Promise<ServerShiftApplicationDto> {
    const res = await apiService.post<ApiEnvelope<{ application: unknown }>>(
      `${EMPLOYEE_SHIFT}/posts/${postId}/apply`,
      body,
    );
    const application = asServerApp(res.data.application);
    if (!application) throw new Error("Invalid apply response");
    return application;
  },

  async confirm(
    postId: string,
    appId: string,
    workerMlId?: string,
    options?: { idempotencyKey?: string },
  ): Promise<{ workspace: unknown; events: unknown[] }> {
    const body =
      workerMlId?.trim() && isShiftServerUuid(workerMlId.trim())
        ? { worker_wm_id: workerMlId.trim() }
        : {};
    const headers: HeadersInit = {};
    const idempotencyKey = options?.idempotencyKey?.trim();
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    const res = await apiService.post<ApiEnvelope<{ workspace: unknown; events: unknown[] }>>(
      `${EMPLOYER_SHIFT}/posts/${postId}/applications/${appId}/confirm`,
      body,
      headers,
    );
    return res.data;
  },

  /** Wave-1: employee direct-invite accept under server vacancy CAS */
  async acceptDirectInvite(
    postId: string,
    body: Record<string, unknown>,
  ): Promise<{
    workspace: unknown;
    application: ServerShiftApplicationDto;
    events: unknown[];
  }> {
    const res = await apiService.post<
      ApiEnvelope<{ workspace: unknown; application: unknown; events: unknown[] }>
    >(`${EMPLOYEE_SHIFT}/posts/${postId}/direct-accept`, body);
    const application = asServerApp(res.data.application);
    if (!application) throw new Error("Invalid direct-accept application response");
    return {
      workspace: res.data.workspace,
      application,
      events: Array.isArray(res.data.events) ? res.data.events : [],
    };
  },

  /** Wave-5: create server invite proof before employee can direct-accept */
  async createDirectInvite(
    postId: string,
    workerWmId: string,
  ): Promise<{ id: string; token: string; worker_wm_id: string; expires_at: number }> {
    const res = await apiService.post<
      ApiEnvelope<{
        invite: { id: string; token: string; worker_wm_id: string; expires_at: number };
      }>
    >(`${EMPLOYER_SHIFT}/posts/${encodeURIComponent(postId)}/direct-invites`, {
      worker_wm_id: workerWmId.trim(),
    });
    const invite = res.data.invite;
    if (!invite?.id || !invite.token) throw new Error("Invalid direct-invite create response");
    return invite;
  },

  async updatePost(postId: string, body: Record<string, unknown>): Promise<ServerShiftPostDto> {
    const res = await apiService.patch<ApiEnvelope<{ post: unknown }>>(
      `${EMPLOYER_SHIFT}/posts/${encodeURIComponent(postId)}`,
      body,
    );
    const post = asServerPost(res.data.post);
    if (!post) throw new Error("Invalid update shift post response");
    return post;
  },

  async deletePost(postId: string): Promise<{ deleted: boolean; mode: string }> {
    const res = await apiService.delete<ApiEnvelope<{ deleted: boolean; mode: string }>>(
      `${EMPLOYER_SHIFT}/posts/${encodeURIComponent(postId)}`,
    );
    return { deleted: res.data.deleted === true, mode: res.data.mode ?? "deleted" };
  },

  async getWorkspace(
    postId: string,
    appId: string,
  ): Promise<{
    id: string;
    post_id: string;
    app_id: string;
    worker_wm_id: string;
    status: string;
  }> {
    const res = await apiService.get<ApiEnvelope<{ workspace: unknown }>>(
      `${EMPLOYER_SHIFT}/posts/${encodeURIComponent(postId)}/applications/${encodeURIComponent(appId)}/workspace`,
    );
    if (!isRecord(res.data.workspace)) throw new Error("Invalid workspace response");
    const w = res.data.workspace;
    const id = typeof w.id === "string" ? w.id : "";
    const post_id = typeof w.post_id === "string" ? w.post_id : "";
    const app_id = typeof w.app_id === "string" ? w.app_id : "";
    if (!isShiftServerUuid(id) || !isShiftServerUuid(post_id) || !isShiftServerUuid(app_id)) {
      throw new Error("Invalid workspace UUID fields");
    }
    return {
      id,
      post_id,
      app_id,
      worker_wm_id: typeof w.worker_wm_id === "string" ? w.worker_wm_id : "",
      status: typeof w.status === "string" ? w.status : "",
    };
  },

  async withdrawApplication(applicationId: string): Promise<ServerShiftApplicationDto> {
    const res = await apiService.post<ApiEnvelope<{ application: unknown }>>(
      `${EMPLOYEE_SHIFT}/applications/${encodeURIComponent(applicationId)}/withdraw`,
      {},
    );
    const application = asServerApp(res.data.application);
    if (!application) throw new Error("Invalid withdraw response");
    return application;
  },

  async patchApplicationStatus(
    postId: string,
    appId: string,
    status: "shortlisted" | "waiting" | "rejected",
  ): Promise<ServerShiftApplicationDto> {
    const res = await apiService.post<ApiEnvelope<{ application: unknown }>>(
      `${EMPLOYER_SHIFT}/posts/${encodeURIComponent(postId)}/applications/${encodeURIComponent(appId)}/status`,
      { status },
    );
    const application = asServerApp(res.data.application);
    if (!application) throw new Error("Invalid application status response");
    return application;
  },

  completeWorkspace: completeShiftWorkspace,
  submitReview: submitShiftReview,
  listReviews: listShiftReviews,
  archiveSite: archiveShiftOpsSite,
};
