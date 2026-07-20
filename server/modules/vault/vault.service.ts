// server/modules/vault/vault.service.ts
//
// Work Vault business logic layer.
// Validates all inputs before delegating to the repository.
// Returns typed result objects — never throws to route handlers (Law 1 & 2).
// All OTP codes are generated server-side using crypto.randomInt (Law 3).

import { randomInt } from "node:crypto";
import { hashPassword } from "../auth/password.js";
import {
  insertOtp,
  invalidatePriorOtps,
  verifyOtpAndCreateSession,
  getSessionById,
  listSessionsByEmployee,
  revokeSession,
} from "./vault.repository.js";
import type {
  VaultOtpGenerateResult,
  VaultOtpVerifyResult,
  VaultRevokeResult,
  VaultSessionListResult,
  VaultSessionView,
} from "./vault.types.js";

/* ── Constants ───────────────────────────────────────────────────────────── */

const OTP_VALIDITY_MS = 5 * 60 * 1000;
const OTP_CODE_LENGTH = 6;
const MAX_FOLDER_IDS = 50;
const MAX_FOLDER_ID_LENGTH = 128;
const MAX_EMPLOYER_NAME_LENGTH = 120;
const MAX_EMPLOYER_WM_ID_LENGTH = 64;
const SESSION_DURATION_MS = 30 * 60 * 1000;

/* ── Input validators ────────────────────────────────────────────────────── */

function isValidFolderIdList(ids: unknown): ids is string[] {
  if (!Array.isArray(ids)) return false;
  if (ids.length > MAX_FOLDER_IDS) return false;
  return ids.every(
    (id) => typeof id === "string" && id.trim().length > 0 && id.length <= MAX_FOLDER_ID_LENGTH,
  );
}

function isValidOtpCode(code: unknown): code is string {
  if (typeof code !== "string") return false;
  const trimmed = code.trim();
  return trimmed.length === OTP_CODE_LENGTH && /^\d{6}$/.test(trimmed);
}

function isValidEmployerName(name: unknown): name is string {
  if (typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_EMPLOYER_NAME_LENGTH;
}

function isValidEmployerWmId(wmId: unknown): wmId is string {
  if (typeof wmId !== "string") return false;
  const trimmed = wmId.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_EMPLOYER_WM_ID_LENGTH;
}

/* ── OTP code generator ──────────────────────────────────────────────────── */

function generateOtpCode(): string {
  const code = randomInt(0, 1_000_000);
  return code.toString().padStart(OTP_CODE_LENGTH, "0");
}

/* ── Service: employee generates OTP ─────────────────────────────────────── */

export async function generateVaultOtp(
  employeeId: string,
  visibleFolderIds: unknown,
): Promise<VaultOtpGenerateResult> {
  if (!isValidFolderIdList(visibleFolderIds)) {
    return { ok: false, reason: "db_error", error: new Error("Invalid visibleFolderIds") };
  }

  const sanitizedFolderIds = visibleFolderIds.map((id) => id.trim());
  const plainCode = generateOtpCode();
  const codeHash = await hashPassword(plainCode);
  const expiresAt = new Date(Date.now() + OTP_VALIDITY_MS);

  await invalidatePriorOtps(employeeId);

  const result = await insertOtp({
    employeeId,
    codeHash,
    visibleFolderIds: sanitizedFolderIds,
    expiresAt,
  });

  if (!result.ok) return result;

  return {
    ok: true,
    otpId: result.otpId,
    code: plainCode,
    expiresAt: expiresAt.getTime(),
  };
}

/* ── Service: employer verifies OTP ──────────────────────────────────────── */

export async function verifyVaultOtp(
  employeeId: string,
  employerId: string,
  code: unknown,
  employerName: unknown,
  employerWmId: unknown,
): Promise<VaultOtpVerifyResult> {
  if (!isValidOtpCode(code)) {
    return { ok: false, reason: "invalid_code" };
  }
  if (!isValidEmployerName(employerName)) {
    return { ok: false, reason: "invalid_code", error: new Error("Invalid employerName") };
  }
  if (!isValidEmployerWmId(employerWmId)) {
    return { ok: false, reason: "invalid_code", error: new Error("Invalid employerWmId") };
  }

  return verifyOtpAndCreateSession({
    employeeId,
    employerId,
    code: code.trim(),
    employerName: (employerName as string).trim(),
    employerWmId: (employerWmId as string).trim(),
    sessionDurationMs: SESSION_DURATION_MS,
  });
}

/* ── Service: validate vault session for employer requests ────────────────── */

export async function validateVaultSession(
  sessionId: string,
  requestingEmployerId: string,
): Promise<VaultSessionView | null> {
  if (!sessionId || typeof sessionId !== "string") return null;

  const session = await getSessionById(sessionId);
  if (!session) return null;
  if (session.status !== "active") return null;
  if (Date.now() > session.expiresAt) return null;
  if (session.employerId !== requestingEmployerId) return null;

  return session;
}

/* ── Service: employee views their access log ─────────────────────────────── */

export async function listEmployeeVaultSessions(
  employeeId: string,
): Promise<VaultSessionListResult> {
  return listSessionsByEmployee(employeeId);
}

/* ── Service: employee revokes a session ──────────────────────────────────── */

export async function revokeVaultSession(
  sessionId: string,
  requestingEmployeeId: string,
): Promise<VaultRevokeResult> {
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim().length === 0) {
    return { ok: false, reason: "not_found" };
  }
  return revokeSession(sessionId.trim(), requestingEmployeeId);
}
