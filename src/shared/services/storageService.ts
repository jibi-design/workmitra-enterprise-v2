/** Job Mitra | storageService.ts — typed non-PII browser prefs only */

/**
 * Typed storage for non-sensitive preferences.
 * Auth tokens and profile PII must use piiSecureStorage / cookie sessions — never this API.
 */

type StorageKey = "wm_user_role" | "wm_theme_preference" | "wm_last_sync";

export const storageService = {
  set(key: StorageKey, value: unknown): void {
    try {
      const serializedValue = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (e) {
      console.error("[Storage Service Set Error]:", e);
    }
  },

  get<T>(key: StorageKey): T | null {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (e) {
      console.error("[Storage Service Get Error]:", e);
      return null;
    }
  },

  remove(key: StorageKey): void {
    localStorage.removeItem(key);
  },

  /** Scrub legacy bearer token key if present (never writable via this service). */
  scrubLegacyAuthToken(): void {
    try {
      localStorage.removeItem("wm_auth_token");
    } catch {
      /* ignore */
    }
  },
};

storageService.scrubLegacyAuthToken();
