/** Job Mitra | shiftGateApi.reviews.ts | Complete / reviews / site archive HTTP */

import { apiService } from "../../../shared/services/apiService";
import { isShiftServerUuid } from "../utils/shiftIdBridge";

const EMPLOYER_SHIFT = "/v1/jobmitra/employer/shift";
const EMPLOYEE_SHIFT = "/v1/jobmitra/employee/shift";

interface ApiEnvelope<T> {
  data: T;
  meta?: { requestId?: string };
}

export type ServerWorkReviewDto = {
  id: string;
  workspace_id: string | null;
  post_id: string | null;
  direction: "employer_to_employee" | "employee_to_employer";
  rating: number;
  body: string;
  reviewer_user_id: string;
  reviewee_user_id: string;
  created_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asReview(value: unknown): ServerWorkReviewDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  const rating = typeof value.rating === "number" ? value.rating : Number(value.rating);
  const direction = value.direction;
  if (!id || !Number.isInteger(rating) || (direction !== "employer_to_employee" && direction !== "employee_to_employer")) {
    return null;
  }
  return {
    id,
    workspace_id: typeof value.workspace_id === "string" ? value.workspace_id : null,
    post_id: typeof value.post_id === "string" ? value.post_id : null,
    direction,
    rating,
    body: typeof value.body === "string" ? value.body : "",
    reviewer_user_id: typeof value.reviewer_user_id === "string" ? value.reviewer_user_id : "",
    reviewee_user_id: typeof value.reviewee_user_id === "string" ? value.reviewee_user_id : "",
    created_at: typeof value.created_at === "string" ? value.created_at : "",
  };
}

export async function completeShiftWorkspace(workspaceId: string): Promise<{ id: string; status: string }> {
  const res = await apiService.post<ApiEnvelope<{ workspace: { id?: string; status?: string } }>>(
    `${EMPLOYER_SHIFT}/workspaces/${encodeURIComponent(workspaceId)}/complete`,
    {},
  );
  const id = res.data.workspace?.id ?? workspaceId;
  return { id, status: res.data.workspace?.status ?? "completed" };
}

export async function submitShiftReview(
  role: "employer" | "employee",
  body: {
    workspaceId: string;
    jobPostId?: string;
    appId?: string;
    rating: number;
    body?: string;
    revieweeUserId?: string;
  },
): Promise<{ id: string }> {
  if (!isShiftServerUuid(body.workspaceId)) {
    throw new Error("Server workspace UUID required");
  }
  const prefix = role === "employer" ? EMPLOYER_SHIFT : EMPLOYEE_SHIFT;
  const res = await apiService.post<ApiEnvelope<{ id: string }>>(`${prefix}/reviews`, {
    workspaceId: body.workspaceId,
    job_post_id: body.jobPostId,
    app_id: body.appId,
    rating: body.rating,
    body: body.body ?? "",
    revieweeUserId: body.revieweeUserId,
  });
  const id = res.data.id;
  if (!id || !isShiftServerUuid(id)) throw new Error("Invalid review response");
  return { id };
}

export async function listShiftReviews(role: "employer" | "employee"): Promise<ServerWorkReviewDto[]> {
  const prefix = role === "employer" ? EMPLOYER_SHIFT : EMPLOYEE_SHIFT;
  const res = await apiService.get<ApiEnvelope<{ reviews: unknown }>>(`${prefix}/reviews`);
  const raw = res.data.reviews;
  if (!Array.isArray(raw)) return [];
  return raw.map(asReview).filter((row): row is ServerWorkReviewDto => row !== null);
}

export async function archiveShiftOpsSite(
  siteId: string,
  jobPostKeys: string[] = [],
): Promise<{ archived: boolean; siteId: string }> {
  const res = await apiService.post<ApiEnvelope<{ archived?: boolean; siteId?: string }>>(
    `${EMPLOYER_SHIFT}/sites/${encodeURIComponent(siteId)}/archive`,
    { jobPostKeys },
  );
  return {
    archived: res.data.archived === true,
    siteId: typeof res.data.siteId === "string" ? res.data.siteId : siteId,
  };
}
