// src/app/storage/roleStorage.ts
export type AppRole = "employee" | "employer" | "admin";

/**
 * Phase-0 testing requirement:
 * - Role MUST be per-tab (so Employer + Employee can be opened in two tabs/windows)
 * - Data stores remain in localStorage (shared) for interaction testing
 *
 * Therefore role is stored in sessionStorage (tab-specific).
 *
 * SECURITY: Not authorization when AUTH backend is off.
 * Wave 2: legacy localStorage role keys are purged — never re-imported into session.
 */
const KEY_SESSION = "wm_role_session_v1";

const KEY_V2_LEGACY = "wm_role_v2";
const KEY_LEGACY = "wm_role";

const ROLE_CHANGED_EVENT = "wm:role-changed";

function isRole(x: unknown): x is AppRole {
  return x === "employee" || x === "employer" || x === "admin";
}

function safeSessionGetItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSetItem(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // demo-safe ignore
  }
}

function safeSessionRemoveItem(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function safeLocalRemoveItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function purgeLegacyRoleKeys(): void {
  safeLocalRemoveItem(KEY_V2_LEGACY);
  safeLocalRemoveItem(KEY_LEGACY);
}

function notifyRoleChanged() {
  try {
    window.dispatchEvent(new Event(ROLE_CHANGED_EVENT));
  } catch {
    // ignore
  }
}

export const roleStorage = {
  isRole,

  get(): AppRole | null {
    // Wave 2 P1: never migrate sticky LS roles into this tab — purge only.
    purgeLegacyRoleKeys();
    const v = safeSessionGetItem(KEY_SESSION);
    return isRole(v) ? v : null;
  },

  set(role: AppRole) {
    safeSessionSetItem(KEY_SESSION, role);
    purgeLegacyRoleKeys();
    notifyRoleChanged();
  },

  clear() {
    safeSessionRemoveItem(KEY_SESSION);
    purgeLegacyRoleKeys();
    notifyRoleChanged();
  },

  subscribe(listener: () => void) {
    const onCustom = () => listener();
    window.addEventListener(ROLE_CHANGED_EVENT, onCustom);
    return () => {
      window.removeEventListener(ROLE_CHANGED_EVENT, onCustom);
    };
  },
} as const;
