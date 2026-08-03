/**
 * Secure storage for PII-bearing JSON keys.
 * Sprint 1: device key in IndexedDB; envelopes upgraded to AES-GCM (wmenc2)
 * with an in-memory plaintext mirror for sync Zustand/profile callers.
 */

import {
  ensurePiiCryptoReady,
  isPiiEnvelope,
  openPiiText,
  openPiiTextAsync,
  sealPiiTextAsync,
} from "./piiCrypto";

/** Keys that must never sit as plaintext JSON in localStorage. */
export const PII_STORAGE_KEYS = [
  "wm_employer_profile_v1",
  "wm:employer-profile",
  "wm_employee_profile_v1",
  "wm-auth-storage",
  "wm_contact_verification_v1",
] as const;

export type PiiStorageKey = (typeof PII_STORAGE_KEYS)[number] | string;

/** Hot mirror — sync getItem after hydrate / setItem. */
const memoryMirror = new Map<string, string>();

async function persistSealed(key: string, plaintext: string): Promise<void> {
  const sealed = await sealPiiTextAsync(plaintext);
  try {
    localStorage.setItem(key, sealed);
  } catch (error) {
    console.error("[piiSecureStorage.persist]", error);
  }
}

/**
 * Call once at app boot (before React render).
 * Loads device key into IndexedDB path and hydrates PII mirrors.
 */
export async function hydratePiiSecureStorage(): Promise<void> {
  await ensurePiiCryptoReady();
  const keys = new Set<string>([...PII_STORAGE_KEYS]);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("wm_") || k.startsWith("wm-") || k.startsWith("wm:"))) {
        keys.add(k);
      }
    }
  } catch {
    /* ignore */
  }

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      if (isPiiEnvelope(raw)) {
        const plain = await openPiiTextAsync(raw);
        if (plain != null) {
          memoryMirror.set(key, plain);
          // Upgrade legacy v1 → v2 AES-GCM
          if (raw.startsWith("wmenc1:")) {
            await persistSealed(key, plain);
          }
        }
      }
    } catch {
      /* ignore per-key */
    }
  }
}

export const piiSecureStorage = {
  getItem(key: PiiStorageKey): string | null {
    if (memoryMirror.has(key)) return memoryMirror.get(key)!;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      if (isPiiEnvelope(raw)) {
        const plain = openPiiText(raw);
        if (plain != null) {
          memoryMirror.set(key, plain);
          return plain;
        }
        return null;
      }
      // Legacy plaintext — mirror + async seal upgrade
      memoryMirror.set(key, raw);
      void persistSealed(key, raw);
      return raw;
    } catch {
      return null;
    }
  },

  setItem(key: PiiStorageKey, value: string): void {
    memoryMirror.set(key, value);
    void persistSealed(key, value);
  },

  removeItem(key: PiiStorageKey): void {
    memoryMirror.delete(key);
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
