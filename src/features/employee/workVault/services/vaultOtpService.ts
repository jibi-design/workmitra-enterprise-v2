/** Phase 14 + STEP 2: OTP dual-path — never persist plaintext codes. */

import type { VaultOTP, VaultOtpPending } from "../types/vaultTypes";
import { VAULT_STORAGE_KEYS, OTP_VALIDITY_MS, OTP_CODE_LENGTH } from "../constants/vaultConstants";
import { hashOtpCode, otpCodesMatch } from "../../../../shared/security/otpCodeHash";
import { readStorage, writeStorage, removeStorage } from "../helpers/vaultStorageUtils";
import { getVisibleFolders } from "./vaultFolderService";
import {
  isVaultApiSyncEnabled,
  resolveEmployeeAuthUserId,
  vaultGateApi,
} from "./vaultGateApi.service";

type VaultOtpChallenge = {
  codeHash: string;
  generatedAt: number;
  expiresAt: number;
  used: boolean;
};

/** Same-tab plaintext for employee UI only — never written to storage. */
let memoryPlain: { code: string; expiresAt: number } | null = null;

function scrubLegacyPlaintextOtp(): void {
  const raw = readStorage<Record<string, unknown>>(VAULT_STORAGE_KEYS.otp);
  if (raw && typeof raw === "object" && typeof raw.code === "string") {
    removeStorage(VAULT_STORAGE_KEYS.otp);
  }
}

if (typeof window !== "undefined") {
  scrubLegacyPlaintextOtp();
  if (isVaultApiSyncEnabled()) {
    removeStorage(VAULT_STORAGE_KEYS.otp);
  }
}

function generateCodeLocal(): string {
  const array = new Uint8Array(OTP_CODE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => (byte % 10).toString()).join("");
}

function readPending(): VaultOtpPending | null {
  const raw = readStorage<VaultOtpPending>(VAULT_STORAGE_KEYS.otpPending);
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.otpId !== "string" || !raw.otpId.trim()) return null;
  if (typeof raw.expiresAt !== "number" || typeof raw.generatedAt !== "number") return null;
  return {
    otpId: raw.otpId.trim(),
    generatedAt: raw.generatedAt,
    expiresAt: raw.expiresAt,
  };
}

function writePending(pending: VaultOtpPending): boolean {
  return writeStorage(VAULT_STORAGE_KEYS.otpPending, pending).ok;
}

function readChallenge(): VaultOtpChallenge | null {
  const raw = readStorage<VaultOtpChallenge>(VAULT_STORAGE_KEYS.otp);
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.codeHash !== "string" || !raw.codeHash) return null;
  if (typeof raw.generatedAt !== "number" || typeof raw.expiresAt !== "number") return null;
  return {
    codeHash: raw.codeHash,
    generatedAt: raw.generatedAt,
    expiresAt: raw.expiresAt,
    used: Boolean(raw.used),
  };
}

/**
 * Reads display OTP. Auth on: pending meta only (code empty after reload).
 * Auth off: challenge hash in LS; plaintext only from same-tab memory.
 */
export function getCurrentOtp(): VaultOTP | null {
  if (isVaultApiSyncEnabled()) {
    const pending = readPending();
    if (!pending) return null;
    if (Date.now() > pending.expiresAt) {
      removeStorage(VAULT_STORAGE_KEYS.otpPending);
      return null;
    }
    return {
      code: "",
      generatedAt: pending.generatedAt,
      expiresAt: pending.expiresAt,
      used: false,
      otpId: pending.otpId,
    };
  }

  const challenge = readChallenge();
  if (!challenge) {
    memoryPlain = null;
    return null;
  }
  if (challenge.used || Date.now() > challenge.expiresAt) {
    removeStorage(VAULT_STORAGE_KEYS.otp);
    memoryPlain = null;
    return null;
  }

  const code = memoryPlain && memoryPlain.expiresAt === challenge.expiresAt ? memoryPlain.code : "";

  return {
    code,
    generatedAt: challenge.generatedAt,
    expiresAt: challenge.expiresAt,
    used: challenge.used,
  };
}

export type GenerateOtpResult =
  | { ok: true; otp: VaultOTP }
  | { ok: false; reason: "storage_error" | "api_error" | "no_visible_folders"; message?: string };

/**
 * Generates a new OTP.
 * Auth on: POST generate — stores otpId only; returns code once.
 * Auth off: stores SHA-256 hash only; returns code once in memory.
 */
export async function generateOtp(): Promise<GenerateOtpResult> {
  const visibleFolderIds = getVisibleFolders().map((f) => f.id);
  if (visibleFolderIds.length === 0) {
    return { ok: false, reason: "no_visible_folders" };
  }

  if (isVaultApiSyncEnabled()) {
    removeStorage(VAULT_STORAGE_KEYS.otp);
    memoryPlain = null;

    try {
      const dto = await vaultGateApi.generateOtp(visibleFolderIds);
      const pending: VaultOtpPending = {
        otpId: dto.otpId,
        generatedAt: Date.now(),
        expiresAt: dto.expiresAt,
      };
      if (!writePending(pending)) {
        return { ok: false, reason: "storage_error" };
      }
      return {
        ok: true,
        otp: {
          code: dto.code,
          generatedAt: pending.generatedAt,
          expiresAt: dto.expiresAt,
          used: false,
          otpId: dto.otpId,
        },
      };
    } catch (error) {
      return {
        ok: false,
        reason: "api_error",
        message: error instanceof Error ? error.message : "OTP generate failed",
      };
    }
  }

  const now = Date.now();
  const code = generateCodeLocal();
  const expiresAt = now + OTP_VALIDITY_MS;
  const challenge: VaultOtpChallenge = {
    codeHash: await hashOtpCode(code),
    generatedAt: now,
    expiresAt,
    used: false,
  };

  const write = writeStorage(VAULT_STORAGE_KEYS.otp, challenge);
  if (!write.ok) return { ok: false, reason: "storage_error" };

  memoryPlain = { code, expiresAt };

  return {
    ok: true,
    otp: { code, generatedAt: now, expiresAt, used: false },
  };
}

/**
 * Verifies a submitted OTP (auth-off hash challenge).
 * Auth on: employers must use verifyOtpViaApi — this returns false.
 */
export async function verifyOtp(submittedCode: string): Promise<boolean> {
  if (isVaultApiSyncEnabled()) {
    return false;
  }

  const challenge = readChallenge();
  if (!challenge || challenge.used) return false;
  if (Date.now() > challenge.expiresAt) {
    removeStorage(VAULT_STORAGE_KEYS.otp);
    memoryPlain = null;
    return false;
  }

  const ok = await otpCodesMatch(submittedCode, challenge.codeHash);
  if (!ok) return false;

  const write = writeStorage(VAULT_STORAGE_KEYS.otp, { ...challenge, used: true });
  if (!write.ok) return false;

  memoryPlain = null;
  return true;
}

export type VerifyOtpApiResult =
  | {
      ok: true;
      sessionId: string;
      visibleFolderIds: string[];
      expiresAt: number;
    }
  | { ok: false; reason: "api_error" | "missing_employee_id"; message?: string };

export async function verifyOtpViaApi(params: {
  code: string;
  employeeRouteId: string;
  employerName: string;
  employerMlId: string;
}): Promise<VerifyOtpApiResult> {
  if (!isVaultApiSyncEnabled()) {
    return { ok: false, reason: "api_error", message: "Vault API sync is disabled" };
  }

  const employeeUserId = resolveEmployeeAuthUserId(params.employeeRouteId);
  if (!employeeUserId) {
    return {
      ok: false,
      reason: "missing_employee_id",
      message: "Employee auth id not linked. Employee must sign in once to map WM id → auth UUID.",
    };
  }

  try {
    const dto = await vaultGateApi.verifyOtp({
      code: params.code.trim(),
      employeeUserId,
      employerName: params.employerName,
      employerMlId: params.employerMlId,
    });
    removeStorage(VAULT_STORAGE_KEYS.otpPending);
    removeStorage(VAULT_STORAGE_KEYS.otp);
    return {
      ok: true,
      sessionId: dto.sessionId,
      visibleFolderIds: dto.visibleFolderIds,
      expiresAt: dto.expiresAt,
    };
  } catch (error) {
    return {
      ok: false,
      reason: "api_error",
      message: error instanceof Error ? error.message : "OTP verify failed",
    };
  }
}

export function isOtpActive(): boolean {
  if (isVaultApiSyncEnabled()) {
    const pending = readPending();
    if (!pending) return false;
    return Date.now() <= pending.expiresAt;
  }

  const otp = getCurrentOtp();
  if (!otp) return false;
  if (otp.used) return false;
  return Date.now() <= otp.expiresAt;
}

export function getOtpRemainingMs(): number {
  if (isVaultApiSyncEnabled()) {
    const pending = readPending();
    if (!pending) return 0;
    const remaining = pending.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  const otp = getCurrentOtp();
  if (!otp || otp.used) return 0;

  const remaining = otp.expiresAt - Date.now();
  return remaining > 0 ? remaining : 0;
}

export function clearOtp(): void {
  memoryPlain = null;
  removeStorage(VAULT_STORAGE_KEYS.otp);
  removeStorage(VAULT_STORAGE_KEYS.otpPending);
}
