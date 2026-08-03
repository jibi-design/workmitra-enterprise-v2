/**
 * Wave-3 — shared localStorage write result (no silent quota swallow).
 * Prefer this over try/catch empty blocks for shift/roster/workforce stores.
 */

export type LocalStorageWriteResult = { ok: true } | { ok: false; reason: "storage_error" };

export const STORAGE_QUOTA_EXCEEDED_EVENT = "wm:storage-quota-exceeded";

export function writeLocalStorageJson(key: string, value: unknown): LocalStorageWriteResult {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    try {
      window.dispatchEvent(new CustomEvent(STORAGE_QUOTA_EXCEEDED_EVENT, { detail: { key } }));
    } catch {
      /* ignore */
    }
    return { ok: false, reason: "storage_error" };
  }
}
