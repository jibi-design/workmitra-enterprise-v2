/** Job Mitra | identity.adapter.ts | src/app/identity/identity.adapter.ts
 *
 * Client identity adapter: auth UUID (when backend auth on) vs legacy ML uniqueId.
 * Does not replace legacy fields in domain records — bridge map only.
 */

import { AUTH_BACKEND_ENABLED } from "../../shared/config/authConfig";
import { useAuthStore } from "../../shared/store/authStore";
import { employeeProfileStorage } from "../../features/employee/profile/storage/employeeProfile.storage";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";

export type ActorRole = "employee" | "employer";

export type CurrentActorId = {
  authUserId?: string;
  legacyId?: string;
  source: "auth" | "legacy";
};

export type IdentityBridgeMap = {
  employee: Record<string, string>;
  employer: Record<string, string>;
};

const BRIDGE_KEY = "wm_identity_bridge_v1";

function emptyBridge(): IdentityBridgeMap {
  return { employee: {}, employer: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeIdMap(raw: unknown): Record<string, string> {
  if (!isRecord(raw)) return {};
  const out: Record<string, string> = {};
  for (const [legacyId, authUserId] of Object.entries(raw)) {
    if (typeof legacyId !== "string" || !legacyId.trim()) continue;
    if (typeof authUserId !== "string" || !authUserId.trim()) continue;
    out[legacyId.trim()] = authUserId.trim();
  }
  return out;
}

function readLegacyUniqueId(role: ActorRole): string | undefined {
  if (role === "employee") {
    const id = employeeProfileStorage.get().uniqueId?.trim();
    return id || undefined;
  }
  const id = employerSettingsStorage.get().uniqueId?.trim();
  return id || undefined;
}

/**
 * Resolve current actor identity for the requested role only.
 * AUTH on: auth UUID only when authStore.user.role matches `role` (no cross-role bleed).
 * Legacy path: profile uniqueId from employee/employer storage for that role.
 */
export function getCurrentActorId(role: ActorRole): CurrentActorId {
  if (AUTH_BACKEND_ENABLED) {
    const user = useAuthStore.getState().user;
    const authUserId = user?.id?.trim();
    if (authUserId && user?.role === role) {
      const legacyId = readLegacyUniqueId(role);
      return legacyId ? { authUserId, legacyId, source: "auth" } : { authUserId, source: "auth" };
    }
    // Authenticated as a different role — never return peer auth UUID for this actor slot.
    const legacyId = readLegacyUniqueId(role);
    return legacyId ? { legacyId, source: "legacy" } : { source: "legacy" };
  }

  const legacyId = readLegacyUniqueId(role);
  return legacyId ? { legacyId, source: "legacy" } : { source: "legacy" };
}

export const identityBridge = {
  load(): IdentityBridgeMap {
    try {
      const raw = localStorage.getItem(BRIDGE_KEY);
      if (!raw) return emptyBridge();
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) return emptyBridge();
      return {
        employee: sanitizeIdMap(parsed.employee),
        employer: sanitizeIdMap(parsed.employer),
      };
    } catch {
      return emptyBridge();
    }
  },

  save(map: IdentityBridgeMap): void {
    try {
      const next: IdentityBridgeMap = {
        employee: sanitizeIdMap(map.employee),
        employer: sanitizeIdMap(map.employer),
      };
      localStorage.setItem(BRIDGE_KEY, JSON.stringify(next));
    } catch {
      // demo-safe ignore
    }
  },

  /** Map legacy ML/WM uniqueId → auth_users UUID for later readers. */
  upsert(role: ActorRole, legacyId: string, authUserId: string): void {
    const legacy = legacyId.trim();
    const auth = authUserId.trim();
    if (!legacy || !auth) return;

    // Retry merge: re-read before each write so dual-tab upserts do not drop peers (P1-5).
    for (let attempt = 0; attempt < 3; attempt++) {
      const map = this.load();
      if (map[role][legacy] === auth) return;

      const next: IdentityBridgeMap = {
        employee: { ...map.employee },
        employer: { ...map.employer },
      };
      next[role] = { ...next[role], [legacy]: auth };
      this.save(next);

      const verify = this.load();
      if (verify[role][legacy] === auth) return;
    }
  },
};
