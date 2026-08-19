/** Job Mitra | workspaceMessageApi.service.ts — POST/GET shift workspace chat */

import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { apiService } from "../../../shared/services/apiService";
import type { WorkspaceMessageDto } from "./workspaceMessageMerge.helpers";

const EMPLOYER = "/v1/jobmitra/employer/shift";
const EMPLOYEE = "/v1/jobmitra/employee/shift";

interface ApiEnvelope<T> {
  data: T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asMessage(value: unknown): WorkspaceMessageDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  const postId = typeof value.postId === "string" ? value.postId.trim() : "";
  const title = typeof value.title === "string" ? value.title.trim() : "";
  if (!id || !postId || !title) return null;
  return {
    id,
    postId,
    kind: value.kind === "broadcast" ? "broadcast" : "direct",
    title,
    body: typeof value.body === "string" ? value.body : "",
    actorRole: value.actorRole === "employee" ? "employee" : "employer",
    createdAt: typeof value.createdAt === "number" ? value.createdAt : Date.now(),
  };
}

export function isWorkspaceMessageApiEnabled(): boolean {
  return AUTH_BACKEND_ENABLED;
}

export const workspaceMessageApi = {
  async listMine(role: "employee" | "employer"): Promise<WorkspaceMessageDto[]> {
    const prefix = role === "employer" ? EMPLOYER : EMPLOYEE;
    const res = await apiService.get<ApiEnvelope<{ messages: unknown }>>(
      `${prefix}/workspace-messages`,
    );
    const raw = res.data.messages;
    if (!Array.isArray(raw)) return [];
    return raw.map(asMessage).filter((row): row is WorkspaceMessageDto => row !== null);
  },

  async list(role: "employee" | "employer", postId: string): Promise<WorkspaceMessageDto[]> {
    const prefix = role === "employer" ? EMPLOYER : EMPLOYEE;
    const res = await apiService.get<ApiEnvelope<{ messages: unknown }>>(
      `${prefix}/posts/${encodeURIComponent(postId)}/workspace-messages`,
    );
    const raw = res.data.messages;
    if (!Array.isArray(raw)) return [];
    return raw.map(asMessage).filter((row): row is WorkspaceMessageDto => row !== null);
  },

  async send(
    role: "employee" | "employer",
    postId: string,
    input: { kind: "broadcast" | "direct"; title: string; body: string },
  ): Promise<WorkspaceMessageDto> {
    const prefix = role === "employer" ? EMPLOYER : EMPLOYEE;
    const res = await apiService.post<ApiEnvelope<{ message: unknown }>>(
      `${prefix}/posts/${encodeURIComponent(postId)}/workspace-messages`,
      input,
    );
    const mapped = asMessage(res.data.message);
    if (!mapped) throw new Error("Invalid workspace message response");
    return mapped;
  },
};
