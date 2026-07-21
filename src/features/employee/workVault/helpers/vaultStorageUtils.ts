// WARNING DEC-012 / MIG-008: Client-side OTP path (plaintext)
// Server OTP path (Argon2 hashed) exists at server/modules/vault/
// This client path MUST BE REMOVED before production cutover
// See architecture-audits/Phase-DB-Migration-Readiness-Audit-001.md
// src/features/employee/workVault/helpers/vaultStorageUtils.ts

/**
 * Generic localStorage read helper.
 * Returns null if key doesn't exist or parse fails.
 */
export function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export type VaultStorageWriteResult = { ok: true } | { ok: false; reason: "storage_error" };

/**
 * Generic localStorage write helper.
 * Returns typed result so security-critical writes (OTP mark-used) can be checked.
 */
export function writeStorage<T>(key: string, data: T): VaultStorageWriteResult {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

/**
 * Removes a key from localStorage.
 */
export function removeStorage(key: string): void {
  localStorage.removeItem(key);
}

/**
 * Generates a short unique ID for vault entities.
 * Format: "v_" + 12 random hex chars.
 */
export function generateVaultEntityId(): string {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  const hex = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  return `v_${hex}`;
}
