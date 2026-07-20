// server/modules/vault/vault.types.ts
//
// Shared types for the Work Vault domain.
// Used by vault.repository.ts, vault.service.ts, and vault route handlers.

/* ── DB row shapes (1:1 with table columns) ─────────────────────────────── */

export type VaultOtpRow = {
  id: string;
  employee_id: string;
  code_hash: string;
  visible_folder_ids: string[];
  attempt_count: number;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
};

export type VaultSessionRow = {
  id: string;
  employee_id: string;
  employer_id: string;
  employer_name: string;
  employer_wm_id: string;
  visible_folder_ids: string[];
  status: VaultSessionStatus;
  started_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
};

export type VaultAccessLogRow = {
  id: string;
  session_id: string;
  employee_id: string;
  employer_id: string;
  event_type: VaultAccessEventType;
  occurred_at: Date;
};

/* ── Domain enumerations ────────────────────────────────────────────────── */

export type VaultSessionStatus = "active" | "expired" | "revoked";
export type VaultAccessEventType = "session_created" | "session_revoked" | "session_expired";

/* ── Service-layer view types (camelCase, timestamps as ms numbers) ──────── */

export type VaultSessionView = {
  id: string;
  employeeId: string;
  employerId: string;
  employerName: string;
  employerWmId: string;
  visibleFolderIds: string[];
  status: VaultSessionStatus;
  startedAt: number;
  expiresAt: number;
  revokedAt: number | null;
};

export type VaultAccessLogView = {
  id: string;
  sessionId: string;
  employeeId: string;
  employerId: string;
  eventType: VaultAccessEventType;
  occurredAt: number;
};

/* ── Repository input types ─────────────────────────────────────────────── */

export type CreateOtpParams = {
  employeeId: string;
  codeHash: string;
  visibleFolderIds: string[];
  expiresAt: Date;
};

export type VerifyOtpAndCreateSessionParams = {
  employeeId: string;
  employerId: string;
  code: string;
  employerName: string;
  employerWmId: string;
  sessionDurationMs: number;
};

/* ── Saga result types (Law 1 — Saga Law) ───────────────────────────────── */

export type VaultOtpGenerateResult =
  | { ok: true; otpId: string; code: string; expiresAt: number }
  | { ok: false; reason: "db_error"; error?: unknown };

export type VaultOtpVerifyResult =
  | { ok: true; session: VaultSessionView }
  | {
      ok: false;
      reason: "no_active_otp" | "invalid_code" | "otp_locked" | "employee_not_found" | "db_error";
      error?: unknown;
    };

export type VaultRevokeResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_found" | "already_closed" | "forbidden" | "db_error";
      error?: unknown;
    };

export type VaultSessionListResult =
  { ok: true; sessions: VaultSessionView[] } | { ok: false; reason: "db_error"; error?: unknown };
