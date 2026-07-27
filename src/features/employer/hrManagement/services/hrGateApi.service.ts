/** Job Mitra | hrGateApi.service.ts | Phase 17 HR API gate */

import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { apiService } from "../../../../shared/services/apiService";

const EMPLOYER_HR = "/v1/jobmitra/employer/hr";

interface ApiEnvelope<T> {
  data: T;
  meta?: { requestId?: string };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isHrApiSyncEnabled(): boolean {
  return AUTH_BACKEND_ENABLED;
}

export type ServerHrLeaveRequestDto = {
  id: string;
  employer_user_id: string;
  employee_user_id: string | null;
  employee_ml_id: string;
  hr_candidate_id: string;
  leave_type: string;
  status: string;
  from_date: string;
  to_date: string;
  reason: string;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ServerHrCompanyNoticeDto = {
  id: string;
  employer_user_id: string;
  title: string;
  content: string;
  posted_at: string;
  expires_at: string | null;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function asIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return "";
}

function asLeave(value: unknown): ServerHrLeaveRequestDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  if (!id) return null;
  return {
    id,
    employer_user_id: asIso(value.employer_user_id) ? String(value.employer_user_id) : "",
    employee_user_id: typeof value.employee_user_id === "string" ? value.employee_user_id : null,
    employee_ml_id: typeof value.employee_ml_id === "string" ? value.employee_ml_id : "",
    hr_candidate_id: typeof value.hr_candidate_id === "string" ? value.hr_candidate_id : "",
    leave_type: typeof value.leave_type === "string" ? value.leave_type : "annual",
    status: typeof value.status === "string" ? value.status : "pending",
    from_date: asIso(value.from_date),
    to_date: asIso(value.to_date),
    reason: typeof value.reason === "string" ? value.reason : "",
    details: isRecord(value.details) ? value.details : {},
    created_at: asIso(value.created_at),
    updated_at: asIso(value.updated_at),
  };
}

function asNotice(value: unknown): ServerHrCompanyNoticeDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  if (!id) return null;
  return {
    id,
    employer_user_id: typeof value.employer_user_id === "string" ? value.employer_user_id : "",
    title: typeof value.title === "string" ? value.title : "",
    content: typeof value.content === "string" ? value.content : "",
    posted_at: asIso(value.posted_at),
    expires_at: value.expires_at == null ? null : asIso(value.expires_at),
    details: isRecord(value.details) ? value.details : {},
    created_at: asIso(value.created_at),
    updated_at: asIso(value.updated_at),
  };
}

export const hrGateApi = {
  async listLeaveRequests(): Promise<ServerHrLeaveRequestDto[]> {
    const res = await apiService.get<ApiEnvelope<{ leaveRequests: unknown }>>(
      `${EMPLOYER_HR}/leave-requests`,
    );
    const raw = res.data.leaveRequests;
    if (!Array.isArray(raw)) return [];
    return raw.map(asLeave).filter((item): item is ServerHrLeaveRequestDto => item !== null);
  },

  async createLeaveRequest(body: Record<string, unknown>): Promise<ServerHrLeaveRequestDto> {
    const res = await apiService.post<ApiEnvelope<{ leaveRequest: unknown }>>(
      `${EMPLOYER_HR}/leave-requests`,
      body,
    );
    const row = asLeave(res.data.leaveRequest);
    if (!row) throw new Error("Invalid leave create response");
    return row;
  },

  async patchLeaveRequest(
    id: string,
    body: Record<string, unknown>,
  ): Promise<ServerHrLeaveRequestDto> {
    const res = await apiService.patch<ApiEnvelope<{ leaveRequest: unknown }>>(
      `${EMPLOYER_HR}/leave-requests/${encodeURIComponent(id)}`,
      body,
    );
    const row = asLeave(res.data.leaveRequest);
    if (!row) throw new Error("Invalid leave patch response");
    return row;
  },

  async listAttendanceLogs(): Promise<unknown[]> {
    const res = await apiService.get<ApiEnvelope<{ attendanceLogs: unknown }>>(
      `${EMPLOYER_HR}/attendance-logs`,
    );
    return Array.isArray(res.data.attendanceLogs) ? res.data.attendanceLogs : [];
  },

  async listPerformanceReviews(): Promise<unknown[]> {
    const res = await apiService.get<ApiEnvelope<{ performanceReviews: unknown }>>(
      `${EMPLOYER_HR}/performance-reviews`,
    );
    return Array.isArray(res.data.performanceReviews) ? res.data.performanceReviews : [];
  },

  async listIncidentReports(): Promise<unknown[]> {
    const res = await apiService.get<ApiEnvelope<{ incidentReports: unknown }>>(
      `${EMPLOYER_HR}/incident-reports`,
    );
    return Array.isArray(res.data.incidentReports) ? res.data.incidentReports : [];
  },

  async listCompanyNotices(): Promise<ServerHrCompanyNoticeDto[]> {
    const res = await apiService.get<ApiEnvelope<{ companyNotices: unknown }>>(
      `${EMPLOYER_HR}/company-notices`,
    );
    const raw = res.data.companyNotices;
    if (!Array.isArray(raw)) return [];
    return raw.map(asNotice).filter((item): item is ServerHrCompanyNoticeDto => item !== null);
  },

  async createCompanyNotice(body: Record<string, unknown>): Promise<ServerHrCompanyNoticeDto> {
    const res = await apiService.post<ApiEnvelope<{ companyNotice: unknown }>>(
      `${EMPLOYER_HR}/company-notices`,
      body,
    );
    const row = asNotice(res.data.companyNotice);
    if (!row) throw new Error("Invalid notice create response");
    return row;
  },

  async patchCompanyNotice(
    id: string,
    body: Record<string, unknown>,
  ): Promise<ServerHrCompanyNoticeDto> {
    const res = await apiService.patch<ApiEnvelope<{ companyNotice: unknown }>>(
      `${EMPLOYER_HR}/company-notices/${encodeURIComponent(id)}`,
      body,
    );
    const row = asNotice(res.data.companyNotice);
    if (!row) throw new Error("Invalid notice patch response");
    return row;
  },
};
