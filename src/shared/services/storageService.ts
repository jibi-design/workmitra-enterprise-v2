/** Job Mitra | storageService.ts | src/shared/services/storageService.ts */

/**
 * ARCHITECTURE NOTE:
 * Typed storage wrapper. Prevents magic strings and manual JSON parsing
 * in individual components.
 */

type StorageKey = "wm_auth_token" | "wm_user_role" | "wm_theme_preference" | "wm_last_sync";

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
      // Try parsing as JSON, if it fails, return the raw string
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

  clear(): void {
    localStorage.clear();
  },
};
