/**
 * Employer-scoped Shift localStorage keys (HR-style).
 * Pattern: wm_employer_{scopeId}_{suffix}
 *
 * Scope id = sanitize(employerOrgId | companyUniqueId | uniqueId).
 * Legacy unscoped keys migrate once into the active employer bucket.
 *
 * Production: silent fallback to "unknown_employer" is DISABLED — missing
 * org identity throws instead of writing into a shared collision bucket.
 */

import { employerSettingsStorage } from "../../employer/company/storage/employerSettings.storage";
import { getEmployerOrgId } from "../../employer/company/helpers/employerDualId.helpers";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import {
  assertCanAccessShiftEmployerScope,
  resolveAuthBoundEmployerScopeId,
} from "./shiftTenantAuthGuard";

export const SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT = "wm:shift-employer-scope-changed";

/** DEV-only collision bucket — never used when import.meta.env.PROD. */
const FALLBACK_SCOPE = "unknown_employer";

export type ShiftEmployerScopedSuffix =
  | "shift_favorites_v1"
  | "shift_posts_v1"
  | "shift_notifications_v1"
  | "shift_activity_log_v1"
  | "shift_workspaces_v1"
  | "shift_direct_invites_v1"
  | "shift_applications_v1"
  | "shift_post_drafts_v1"
  | "shift_templates_v1"
  | "selection_audit_v1";

const LEGACY_BY_SUFFIX: Record<ShiftEmployerScopedSuffix, string> = {
  shift_favorites_v1: "wm_employer_shift_favorites_v1",
  shift_posts_v1: "wm_employer_shift_posts_v1",
  shift_notifications_v1: "wm_employer_notifications_v1",
  shift_activity_log_v1: "wm_employer_shift_activity_log_v1",
  /** Workspaces were shared on the employee marketplace key. */
  shift_workspaces_v1: "wm_employee_shift_workspaces_v1",
  shift_direct_invites_v1: "wm_shift_direct_invites_v1",
  /** Employer apps hydrate from worker projection (see ensureEmployerAppsFromProjection). */
  shift_applications_v1: "wm_employee_shift_applications_v1",
  shift_post_drafts_v1: "wm_employer_shift_post_drafts_v1",
  shift_templates_v1: "wm_employer_shift_templates_v1",
  /** New append-only audit — no legacy global to migrate. */
  selection_audit_v1: "wm_employer_selection_audit_legacy_unused_v1",
};

/**
 * Suffixes that must NOT blindly copy the entire legacy global into one employer
 * (would leak multi-tenant data). Hydration is filtered by that employer's posts.
 */
const FILTERED_LEGACY_SUFFIXES: ReadonlySet<ShiftEmployerScopedSuffix> = new Set([
  "shift_workspaces_v1",
  "shift_direct_invites_v1",
  "shift_applications_v1",
  "selection_audit_v1",
]);

export function sanitizeShiftEmployerScopeId(raw: string): string {
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  if (cleaned) return cleaned;

  if (import.meta.env.PROD) {
    throw new Error(
      "[WorkMitra] Shift employer scope id required; unknown_employer fallback is disabled in production.",
    );
  }

  return FALLBACK_SCOPE;
}

export function getShiftEmployerScopeId(): string {
  try {
    const profile = employerSettingsStorage.get();
    const orgId = getEmployerOrgId(profile)?.trim();
    const companyId = profile.companyUniqueId?.trim() || profile.uniqueId?.trim();
    const raw = orgId || companyId || "";

    if (!raw) {
      if (import.meta.env.PROD) {
        throw new Error("[WorkMitra] Missing employer org / company id for Shift tenant scope.");
      }
      return FALLBACK_SCOPE;
    }

    const profileScope = sanitizeShiftEmployerScopeId(raw);
    // AUTH on: lock to session-bound tenant token (blocks dual-tab LS tenant hopping).
    return resolveAuthBoundEmployerScopeId(profileScope);
  } catch (err) {
    if (import.meta.env.PROD) throw err;
    // AUTH enforcement errors must surface even in DEV when AUTH backend is on.
    if (AUTH_BACKEND_ENABLED && err instanceof Error && err.message.includes("[WorkMitra]")) {
      throw err;
    }
    return FALLBACK_SCOPE;
  }
}

/** Builds wm_employer_{scopeId}_{suffix} */
export function shiftEmployerScopedKey(
  suffix: ShiftEmployerScopedSuffix,
  scopeId = getShiftEmployerScopeId(),
): string {
  const cleaned = sanitizeShiftEmployerScopeId(scopeId);
  assertCanAccessShiftEmployerScope(cleaned);
  return `wm_employer_${cleaned}_${suffix}`;
}

function migratedFlagKey(scopedKey: string): string {
  return `${scopedKey}__migrated_v1`;
}

/**
 * Resolve the live key for an employer-owned Shift store.
 * One-shot: copies legacy unscoped data into the scoped bucket when empty
 * (except filtered suffixes — those hydrate via dedicated helpers).
 */
export function resolveShiftEmployerScopedKey(suffix: ShiftEmployerScopedSuffix): string {
  const scoped = shiftEmployerScopedKey(suffix);
  migrateLegacyShiftKeyOnce(suffix, scoped);
  return scoped;
}

export function migrateLegacyShiftKeyOnce(
  suffix: ShiftEmployerScopedSuffix,
  scopedKey = shiftEmployerScopedKey(suffix),
): void {
  if (typeof localStorage === "undefined") return;

  try {
    const flag = migratedFlagKey(scopedKey);
    if (localStorage.getItem(flag) === "1") return;

    const legacyKey = LEGACY_BY_SUFFIX[suffix];
    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw && scopedRaw !== "[]" && scopedRaw !== "{}") {
      localStorage.setItem(flag, "1");
      return;
    }

    if (!FILTERED_LEGACY_SUFFIXES.has(suffix)) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw && legacyRaw !== "[]" && legacyRaw !== "{}") {
        localStorage.setItem(scopedKey, legacyRaw);
      }
    }

    localStorage.setItem(flag, "1");
  } catch {
    /* demo-safe */
  }
}

export function notifyShiftEmployerScopeChanged(): void {
  try {
    window.dispatchEvent(new Event(SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT));
  } catch {
    /* demo-safe */
  }
}

/** Legacy unscoped key names (admin wipe / docs). Prefer resolveShiftEmployerScopedKey at runtime. */
export const SHIFT_EMPLOYER_LEGACY_KEYS = { ...LEGACY_BY_SUFFIX } as const;

/** @internal DEV-only — exported for tests. */
export const SHIFT_EMPLOYER_DEV_FALLBACK_SCOPE = FALLBACK_SCOPE;
