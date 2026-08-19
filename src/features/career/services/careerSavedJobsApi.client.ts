import { apiService } from "../../../shared/services/apiService";
import { isCareerServerUuid } from "../utils/careerAppIdBridge";
import { EMPLOYEE_CAREER, type ApiEnvelope } from "./careerGateApi.types";

export type ServerCareerSavedJobDto = {
  id: string;
  employee_user_id: string;
  post_id: string;
  saved_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asSavedJob(value: unknown): ServerCareerSavedJobDto | null {
  if (!isRecord(value)) return null;
  const postId = typeof value.post_id === "string" ? value.post_id.trim() : "";
  const id = typeof value.id === "string" ? value.id.trim() : "";
  if (!isCareerServerUuid(postId) || !isCareerServerUuid(id)) return null;
  return {
    id,
    employee_user_id: typeof value.employee_user_id === "string" ? value.employee_user_id : "",
    post_id: postId,
    saved_at: typeof value.saved_at === "string" ? value.saved_at : "",
  };
}

export const careerSavedJobsApi = {
  async listMine(): Promise<ServerCareerSavedJobDto[]> {
    const res = await apiService.get<ApiEnvelope<{ items: unknown }>>(
      `${EMPLOYEE_CAREER}/saved-jobs`,
    );
    const raw = res.data.items;
    if (!Array.isArray(raw)) return [];
    return raw.map(asSavedJob).filter((row): row is ServerCareerSavedJobDto => row !== null);
  },

  async save(postId: string): Promise<ServerCareerSavedJobDto> {
    const res = await apiService.post<ApiEnvelope<{ item: unknown }>>(
      `${EMPLOYEE_CAREER}/saved-jobs`,
      { postId },
    );
    const item = asSavedJob(res.data.item);
    if (!item) throw new Error("Invalid save-job response");
    return item;
  },

  async unsave(postId: string): Promise<void> {
    await apiService.delete<ApiEnvelope<{ deleted: boolean }>>(
      `${EMPLOYEE_CAREER}/saved-jobs/${encodeURIComponent(postId)}`,
    );
  },
};
