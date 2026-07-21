/** Job Mitra | vaultGateApi.service.ts | Phase 14 — Vault OTP/sessions DB gate.
 * AUTH_BACKEND_ENABLED only. Server hashes OTP with Argon2; client never persists plaintext code.
 */

import { identityBridge } from "../../../../app/identity/identity.adapter";
import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { apiService } from "../../../../shared/services/apiService";

const EMPLOYEE_VAULT = "/v1/jobmitra/employee/vault";
const EMPLOYER_VAULT = "/v1/jobmitra/employer/vault";

const VAULT_SESSION_HEADER = "X-Vault-Session-Id";

interface ApiEnvelope<T> {
  data: T;
  meta?: { requestId?: string };
}

export type VaultServerSessionDto = {
  id: string;
  employeeId: string;
  employerId: string;
  employerName: string;
  employerMlId: string;
  visibleFolderIds: string[];
  status: "active" | "expired" | "revoked";
  startedAt: number;
  expiresAt: number;
  revokedAt: number | null;
};

export type VaultOtpGenerateDto = {
  otpId: string;
  code: string;
  expiresAt: number;
  expiresInSeconds: number;
};

export type VaultOtpVerifyDto = {
  sessionId: string;
  visibleFolderIds: string[];
  expiresAt: number;
  expiresInSeconds: number;
};

export function isVaultApiSyncEnabled(): boolean {
  return AUTH_BACKEND_ENABLED;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asMs(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

function asSession(value: unknown): VaultServerSessionDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  if (!id) return null;
  const status = value.status;
  if (status !== "active" && status !== "expired" && status !== "revoked") return null;

  return {
    id,
    employeeId: typeof value.employeeId === "string" ? value.employeeId : "",
    employerId: typeof value.employerId === "string" ? value.employerId : "",
    employerName: typeof value.employerName === "string" ? value.employerName : "",
    // Wire may still send employerWmId / employer_wm_id; normalize to employerMlId in memory.
    employerMlId:
      typeof value.employerMlId === "string"
        ? value.employerMlId
        : typeof value.employerWmId === "string"
          ? value.employerWmId
          : typeof value.employer_wm_id === "string"
            ? value.employer_wm_id
            : "",
    visibleFolderIds: asStringArray(value.visibleFolderIds),
    status,
    startedAt: asMs(value.startedAt),
    expiresAt: asMs(value.expiresAt),
    revokedAt: value.revokedAt == null ? null : asMs(value.revokedAt),
  };
}

/** Resolve WM uniqueId → auth UUID for employer verify. Accepts UUID as-is. */
export function resolveEmployeeAuthUserId(employeeRouteId: string): string | null {
  const trimmed = employeeRouteId.trim();
  if (!trimmed) return null;

  const uuidLike =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed);
  if (uuidLike) return trimmed;

  const mapped = identityBridge.load().employee[trimmed];
  return mapped?.trim() || null;
}

export function vaultSessionHeaders(sessionId: string): HeadersInit {
  return { [VAULT_SESSION_HEADER]: sessionId };
}

export const vaultGateApi = {
  async generateOtp(visibleFolderIds: string[]): Promise<VaultOtpGenerateDto> {
    const res = await apiService.post<ApiEnvelope<Record<string, unknown>>>(
      `${EMPLOYEE_VAULT}/otp/generate`,
      { visibleFolderIds },
    );
    const data = res.data;
    const otpId = typeof data.otpId === "string" ? data.otpId.trim() : "";
    const code = typeof data.code === "string" ? data.code.trim() : "";
    const expiresAt = asMs(data.expiresAt);
    if (!otpId || !code || !expiresAt) {
      throw new Error("Invalid OTP generate response");
    }
    return {
      otpId,
      code,
      expiresAt,
      expiresInSeconds:
        typeof data.expiresInSeconds === "number"
          ? data.expiresInSeconds
          : Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
    };
  },

  async verifyOtp(params: {
    code: string;
    employeeUserId: string;
    employerName: string;
    employerMlId: string;
  }): Promise<VaultOtpVerifyDto> {
    const res = await apiService.post<ApiEnvelope<Record<string, unknown>>>(
      `${EMPLOYER_VAULT}/otp/verify`,
      {
        code: params.code,
        employeeUserId: params.employeeUserId,
        employerName: params.employerName,
        // Server wire field (Step 2): keep employerWmId on the request body.
        employerWmId: params.employerMlId,
      },
    );
    const data = res.data;
    const sessionId = typeof data.sessionId === "string" ? data.sessionId.trim() : "";
    const expiresAt = asMs(data.expiresAt);
    if (!sessionId || !expiresAt) {
      throw new Error("Invalid OTP verify response");
    }
    return {
      sessionId,
      visibleFolderIds: asStringArray(data.visibleFolderIds),
      expiresAt,
      expiresInSeconds:
        typeof data.expiresInSeconds === "number"
          ? data.expiresInSeconds
          : Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
    };
  },

  async listSessions(): Promise<VaultServerSessionDto[]> {
    const res = await apiService.get<ApiEnvelope<{ sessions: unknown }>>(
      `${EMPLOYEE_VAULT}/sessions`,
    );
    const raw = res.data.sessions;
    if (!Array.isArray(raw)) return [];
    return raw.map(asSession).filter((s): s is VaultServerSessionDto => s !== null);
  },

  async revokeSession(sessionId: string): Promise<void> {
    await apiService.delete<ApiEnvelope<{ revoked: boolean }>>(
      `${EMPLOYEE_VAULT}/sessions/${encodeURIComponent(sessionId)}`,
    );
  },

  async getEmployerSession(sessionId: string): Promise<{
    sessionId: string;
    employeeId: string;
    visibleFolderIds: string[];
    status: string;
    expiresAt: number;
  }> {
    const res = await apiService.get<ApiEnvelope<Record<string, unknown>>>(
      `${EMPLOYER_VAULT}/session`,
      undefined,
      vaultSessionHeaders(sessionId),
    );
    const data = res.data;
    return {
      sessionId: typeof data.sessionId === "string" ? data.sessionId : sessionId,
      employeeId: typeof data.employeeId === "string" ? data.employeeId : "",
      visibleFolderIds: asStringArray(data.visibleFolderIds),
      status: typeof data.status === "string" ? data.status : "active",
      expiresAt: asMs(data.expiresAt),
    };
  },
};
