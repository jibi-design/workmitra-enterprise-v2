// src/app/storage/roleStorage.ts
export type AppRole = "employee" | "employer" | "admin";

/**
 * Phase-0 testing requirement:
 * - Role MUST be per-tab (so Employer + Employee can be opened in two tabs/windows)
 * - Data stores remain in localStorage (shared) for interaction testing
 *
 * Therefore role is stored in sessionStorage (tab-specific).
 */
const KEY_SESSION = "wm_role_session_v1";

// Legacy (previous implementation used localStorage)
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

function safeLocalGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalRemoveItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function notifyRoleChanged() {
  try {
    window.dispatchEvent(new Event(ROLE_CHANGED_EVENT));
  } catch {
    // ignore
  }
}

function migrateLegacyRoleToSessionIfPresent(): AppRole | null {
  // If this tab already has session role, keep it.
  const existing = safeSessionGetItem(KEY_SESSION);
  if (isRole(existing)) return existing;

  // Otherwise, if legacy localStorage role exists, copy it into this tab's session
  const v2 = safeLocalGetItem(KEY_V2_LEGACY);
  if (isRole(v2)) {
    safeSessionSetItem(KEY_SESSION, v2);
    return v2;
  }

  const legacy = safeLocalGetItem(KEY_LEGACY);
  if (isRole(legacy)) {
    safeSessionSetItem(KEY_SESSION, legacy);
    return legacy;
  }

  return null;
}

export const roleStorage = {
  isRole,

  get(): AppRole | null {
    // Ensure one-time migration behavior per tab
    const migrated = migrateLegacyRoleToSessionIfPresent();
    if (migrated) return migrated;

    const v = safeSessionGetItem(KEY_SESSION);
    return isRole(v) ? v : null;
  },

  set(role: AppRole) {
    safeSessionSetItem(KEY_SESSION, role);

    // We intentionally do NOT write role into localStorage anymore.
    // Keep legacy keys cleaned to prevent confusion.
    safeLocalRemoveItem(KEY_V2_LEGACY);
    safeLocalRemoveItem(KEY_LEGACY);

    notifyRoleChanged();
  },

  clear() {
    safeSessionRemoveItem(KEY_SESSION);

    // Cleanup legacy keys too
    safeLocalRemoveItem(KEY_V2_LEGACY);
    safeLocalRemoveItem(KEY_LEGACY);

    notifyRoleChanged();
  },

  subscribe(listener: () => void) {
    const onCustom = () => listener();

    // For role (session-based), we only need same-tab updates.
    // Cross-tab role sync is NOT desired (it breaks dual-tab testing).
    window.addEventListener(ROLE_CHANGED_EVENT, onCustom);

    return () => {
      window.removeEventListener(ROLE_CHANGED_EVENT, onCustom);
    };
  },
} as const;