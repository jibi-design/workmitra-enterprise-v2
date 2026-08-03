/**
 * AUTH-on Shift tenant bind (sessionStorage — tab-local).
 * Prevents cross-tenant scoped key access when dual-tab / shared LS lab is active.
 * AUTH off → no-op (Phase-0 lab mode unchanged).
 */

import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { useAuthStore } from "../../../shared/store/authStore";

const BIND_KEY = "wm_shift_auth_tenant_bind_v1";

function sanitizeScopeId(raw: string): string {
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  if (cleaned) return cleaned;
  if (import.meta.env.PROD || AUTH_BACKEND_ENABLED) {
    throw new Error(
      "[WorkMitra] Shift employer scope id required; unknown_employer fallback is disabled under AUTH/production.",
    );
  }
  return "unknown_employer";
}

export type ShiftAuthTenantBind = {
  userId: string;
  role: string;
  scopeId: string;
  boundAt: number;
};

function readBind(): ShiftAuthTenantBind | null {
  try {
    const raw = sessionStorage.getItem(BIND_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ShiftAuthTenantBind>;
    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.role !== "string" ||
      typeof parsed.scopeId !== "string" ||
      typeof parsed.boundAt !== "number"
    ) {
      return null;
    }
    return {
      userId: parsed.userId,
      role: parsed.role,
      scopeId: sanitizeScopeId(parsed.scopeId),
      boundAt: parsed.boundAt,
    };
  } catch {
    return null;
  }
}

function writeBind(bind: ShiftAuthTenantBind): void {
  try {
    sessionStorage.setItem(BIND_KEY, JSON.stringify(bind));
  } catch {
    /* demo-safe */
  }
}

export function clearShiftAuthTenantBind(): void {
  try {
    sessionStorage.removeItem(BIND_KEY);
  } catch {
    /* demo-safe */
  }
}

/** True when AUTH backend is on and an authenticated session exists. */
export function isShiftAuthTenantEnforced(): boolean {
  if (!AUTH_BACKEND_ENABLED) return false;
  const { isAuthenticated, user } = useAuthStore.getState();
  return Boolean(isAuthenticated && user);
}

/**
 * Resolve the only employer scope this AUTH session may touch.
 * First call binds sessionStorage to profileScopeId for the auth userId.
 * Later calls ignore profile drift (God Mode / dual-tab LS) and keep the bind.
 */
export function resolveAuthBoundEmployerScopeId(profileScopeId: string): string {
  if (!AUTH_BACKEND_ENABLED) {
    return sanitizeScopeId(profileScopeId);
  }

  const { user, isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated || !user) {
    throw new Error("[WorkMitra] AUTH session required for Shift employer tenant scope.");
  }

  if (user.role === "employee") {
    throw new Error("[WorkMitra] Employee AUTH session cannot resolve employer Shift scope.");
  }

  const profileScope = sanitizeScopeId(profileScopeId);
  const existing = readBind();

  if (existing && existing.userId === user.id) {
    return existing.scopeId;
  }

  const next: ShiftAuthTenantBind = {
    userId: user.id,
    role: user.role,
    scopeId: profileScope,
    boundAt: Date.now(),
  };
  writeBind(next);
  return next.scopeId;
}

/**
 * Deny cross-tenant scoped access for authenticated employers.
 * Worker/employee paths and AUTH-off lab are allowed through.
 */
export function assertCanAccessShiftEmployerScope(scopeId: string): void {
  if (!isShiftAuthTenantEnforced()) return;

  const { user } = useAuthStore.getState();
  if (!user || user.role === "employee") return;

  const requested = sanitizeScopeId(scopeId);
  const bound = readBind();

  if (!bound || bound.userId !== user.id) {
    resolveAuthBoundEmployerScopeId(requested);
    const rebound = readBind();
    if (!rebound || rebound.scopeId !== requested) {
      throw new Error(`[WorkMitra] Cross-tenant Shift access denied for scope "${requested}".`);
    }
    return;
  }

  if (bound.scopeId !== requested) {
    throw new Error(
      `[WorkMitra] Cross-tenant Shift access denied: bound=${bound.scopeId} requested=${requested}.`,
    );
  }
}

/** Active AUTH bind snapshot (null when AUTH off or unbound). */
export function getShiftAuthTenantBind(): ShiftAuthTenantBind | null {
  if (!AUTH_BACKEND_ENABLED) return null;
  const { user } = useAuthStore.getState();
  const bind = readBind();
  if (!user || !bind || bind.userId !== user.id) return null;
  return bind;
}
