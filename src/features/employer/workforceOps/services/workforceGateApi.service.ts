/** Job Mitra | workforceGateApi.service.ts | Phase 17 Workforce API gate */

import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { apiService } from "../../../../shared/services/apiService";

const EMPLOYER_WF = "/v1/jobmitra/employer/workforce";

interface ApiEnvelope<T> {
  data: T;
  meta?: { requestId?: string };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isWorkforceApiSyncEnabled(): boolean {
  return AUTH_BACKEND_ENABLED;
}

export type ServerWorkforceGroupDto = {
  id: string;
  employer_user_id: string;
  name: string;
  description: string;
  status: string;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ServerWorkforceMemberDto = {
  id: string;
  group_id: string;
  employee_user_id: string | null;
  employee_ml_id: string;
  role: string;
  status: string;
  joined_at: string;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function asIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return "";
}

function asGroup(value: unknown): ServerWorkforceGroupDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  if (!id) return null;
  return {
    id,
    employer_user_id: typeof value.employer_user_id === "string" ? value.employer_user_id : "",
    name: typeof value.name === "string" ? value.name : "",
    description: typeof value.description === "string" ? value.description : "",
    status: typeof value.status === "string" ? value.status : "active",
    details: isRecord(value.details) ? value.details : {},
    created_at: asIso(value.created_at),
    updated_at: asIso(value.updated_at),
  };
}

function asMember(value: unknown): ServerWorkforceMemberDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  if (!id) return null;
  return {
    id,
    group_id: typeof value.group_id === "string" ? value.group_id : "",
    employee_user_id: typeof value.employee_user_id === "string" ? value.employee_user_id : null,
    employee_ml_id: typeof value.employee_ml_id === "string" ? value.employee_ml_id : "",
    role: typeof value.role === "string" ? value.role : "",
    status: typeof value.status === "string" ? value.status : "active",
    joined_at: asIso(value.joined_at),
    details: isRecord(value.details) ? value.details : {},
    created_at: asIso(value.created_at),
    updated_at: asIso(value.updated_at),
  };
}

export const workforceGateApi = {
  async listGroups(): Promise<ServerWorkforceGroupDto[]> {
    const res = await apiService.get<ApiEnvelope<{ groups: unknown }>>(`${EMPLOYER_WF}/groups`);
    const raw = res.data.groups;
    if (!Array.isArray(raw)) return [];
    return raw.map(asGroup).filter((g): g is ServerWorkforceGroupDto => g !== null);
  },

  async createGroup(body: Record<string, unknown>): Promise<ServerWorkforceGroupDto> {
    const res = await apiService.post<ApiEnvelope<{ group: unknown }>>(
      `${EMPLOYER_WF}/groups`,
      body,
    );
    const row = asGroup(res.data.group);
    if (!row) throw new Error("Invalid workforce group create response");
    return row;
  },

  async patchGroup(id: string, body: Record<string, unknown>): Promise<ServerWorkforceGroupDto> {
    const res = await apiService.patch<ApiEnvelope<{ group: unknown }>>(
      `${EMPLOYER_WF}/groups/${encodeURIComponent(id)}`,
      body,
    );
    const row = asGroup(res.data.group);
    if (!row) throw new Error("Invalid workforce group patch response");
    return row;
  },

  async listMembers(groupId: string): Promise<ServerWorkforceMemberDto[]> {
    const res = await apiService.get<ApiEnvelope<{ members: unknown }>>(
      `${EMPLOYER_WF}/groups/${encodeURIComponent(groupId)}/members`,
    );
    const raw = res.data.members;
    if (!Array.isArray(raw)) return [];
    return raw.map(asMember).filter((m): m is ServerWorkforceMemberDto => m !== null);
  },

  async addMember(
    groupId: string,
    body: Record<string, unknown>,
  ): Promise<ServerWorkforceMemberDto> {
    const res = await apiService.post<ApiEnvelope<{ member: unknown }>>(
      `${EMPLOYER_WF}/groups/${encodeURIComponent(groupId)}/members`,
      body,
    );
    const row = asMember(res.data.member);
    if (!row) throw new Error("Invalid workforce member create response");
    return row;
  },

  async removeMember(groupId: string, memberId: string): Promise<void> {
    await apiService.delete(
      `${EMPLOYER_WF}/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}`,
    );
  },
};
