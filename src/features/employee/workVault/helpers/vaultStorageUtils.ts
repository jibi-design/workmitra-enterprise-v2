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

/**
 * Generic localStorage write helper.
 */
export function writeStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
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