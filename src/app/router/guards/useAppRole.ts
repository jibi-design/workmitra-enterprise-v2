/**
 * Single role SoT for guards + shells (RBAC Wave 1 P0).
 * AUTH on → authStore.user.role after sessionChecked.
 * AUTH off → per-tab roleStorage (Phase-0 UX gate only — not security).
 */

import { useSyncExternalStore } from "react";
import { roleStorage, type AppRole } from "../../storage/roleStorage";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { useAuthStore } from "../../../shared/store/authStore";

function useRoleFromStorage(): AppRole | null {
  return useSyncExternalStore(roleStorage.subscribe, roleStorage.get, roleStorage.get);
}

/** Active app role for route chrome / shell gates. */
export function useAppRole(): AppRole | null {
  const authRole = useAuthStore((s) => s.user?.role ?? null);
  const storageRole = useRoleFromStorage();

  if (AUTH_BACKEND_ENABLED) {
    return authRole ?? storageRole;
  }

  return storageRole;
}

/** Sync helper for non-React paths (prefer auth role when backend auth is on). */
export function resolveAppRole(): AppRole | null {
  if (AUTH_BACKEND_ENABLED) {
    const { user } = useAuthStore.getState();
    return user?.role ?? roleStorage.get();
  }
  return roleStorage.get();
}
