// src/features/employee/workVault/services/vaultOtpService.ts

import type { VaultOTP } from "../types/vaultTypes";
import { VAULT_STORAGE_KEYS, OTP_VALIDITY_MS, OTP_CODE_LENGTH } from "../constants/vaultConstants";
import { readStorage, writeStorage, removeStorage } from "../helpers/vaultStorageUtils";
import { normalizeOtp } from "../helpers/vaultNormalizers";

/**
 * Generates a cryptographically random numeric OTP.
 */
function generateCode(): string {
  const array = new Uint8Array(OTP_CODE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => (byte % 10).toString()).join("");
}

/**
 * Reads the current OTP from storage.
 */
export function getCurrentOtp(): VaultOTP | null {
  return normalizeOtp(readStorage(VAULT_STORAGE_KEYS.otp));
}

/**
 * Generates a new OTP and stores it. Replaces any existing OTP.
 */
export function generateOtp(): VaultOTP {
  const now = Date.now();

  const otp: VaultOTP = {
    code: generateCode(),
    generatedAt: now,
    expiresAt: now + OTP_VALIDITY_MS,
    used: false,
  };

  writeStorage(VAULT_STORAGE_KEYS.otp, otp);
  return otp;
}

/**
 * Verifies a submitted OTP code.
 * Returns true only if: code matches, not expired, not already used.
 */
export function verifyOtp(submittedCode: string): boolean {
  const otp = getCurrentOtp();
  if (!otp) return false;

  const now = Date.now();

  if (otp.used) return false;
  if (now > otp.expiresAt) return false;
  if (otp.code !== submittedCode.trim()) return false;

  const consumed: VaultOTP = { ...otp, used: true };
  writeStorage(VAULT_STORAGE_KEYS.otp, consumed);
  return true;
}

/**
 * Checks if the current OTP is still valid (not expired, not used).
 */
export function isOtpActive(): boolean {
  const otp = getCurrentOtp();
  if (!otp) return false;
  if (otp.used) return false;
  return Date.now() <= otp.expiresAt;
}

/**
 * Returns remaining time in milliseconds for the current OTP.
 * Returns 0 if no active OTP.
 */
export function getOtpRemainingMs(): number {
  const otp = getCurrentOtp();
  if (!otp || otp.used) return 0;

  const remaining = otp.expiresAt - Date.now();
  return remaining > 0 ? remaining : 0;
}

/**
 * Clears the current OTP (manual invalidation).
 */
export function clearOtp(): void {
  removeStorage(VAULT_STORAGE_KEYS.otp);
}