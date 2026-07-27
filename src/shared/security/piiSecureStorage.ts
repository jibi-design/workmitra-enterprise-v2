/** Secure localStorage helpers for PII-bearing JSON keys. */

import { isPiiEnvelope, openPiiText, sealPiiText } from "./piiCrypto";

/** Keys that must never sit as plaintext JSON in localStorage. */
export const PII_STORAGE_KEYS = [
  "wm_employer_profile_v1",
  "wm:employer-profile",
  "wm_employee_profile_v1",
  "wm-auth-storage",
] as const;

export type PiiStorageKey = (typeof PII_STORAGE_KEYS)[number] | string;

function migratePlainToSealed(key: string, raw: string): string {
  if (isPiiEnvelope(raw)) return raw;
  const sealed = sealPiiText(raw);
  try {
    localStorage.setItem(key, sealed);
  } catch {
    /* ignore */
  }
  return sealed;
}

export const piiSecureStorage = {
  getItem(key: PiiStorageKey): string | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      if (isPiiEnvelope(raw)) return openPiiText(raw);
      // Legacy plaintext — migrate on read.
      const sealed = migratePlainToSealed(key, raw);
      return openPiiText(sealed) ?? raw;
    } catch {
      return null;
    }
  },

  setItem(key: PiiStorageKey, value: string): void {
    try {
      localStorage.setItem(key, sealPiiText(value));
    } catch (error) {
      console.error("[piiSecureStorage.setItem]", error);
    }
  },

  removeItem(key: PiiStorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },

  getJson<T>(key: PiiStorageKey): T | null {
    const raw = this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setJson(key: PiiStorageKey, value: unknown): void {
    this.setItem(key, JSON.stringify(value));
  },
};
