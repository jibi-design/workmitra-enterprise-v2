/**
 * Employer-scoped Career localStorage keys (HR-style).
 * Pattern: wm_employer_{scopeId}_{suffix}
 *
 * Employer-owned SoT: posts, activity, create draft, applications, workspaces.
 * Worker projections live under wm_employee_{workerMlId}_* (see careerEmployeeScope).
 *
 * B-P1-4: use tryGetCareerEmployerScopeId / hasValidCareerEmployerScope for UI guards.
 * getCareerEmployerScopeId remains fail-closed for writers in PROD / AUTH.
 */

import { employerSettingsStorage } from "../../employer/company/storage/employerSettings.storage";
import { getEmployerOrgId } from "../../employer/company/helpers/employerDualId.helpers";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";

export const CAREER_EMPLOYER_SCOPE_CHANGED_EVENT = "wm:career-employer-scope-changed";

const FALLBACK_SCOPE = "unknown_employer";

export type CareerEmployerScopedSuffix =
  | "career_posts_v1"
  | "career_activity_log_v1"
  | "career_create_draft_v1"
  | "career_applications_v1"
  | "career_workspaces_v1"
  | "career_search_v1"
  | "career_saved_v1";

export type CareerEmployerScopeDenyReason = "missing_org_id" | "invalid_org_id";

export type CareerEmployerScopePeek =
  { ok: true; scopeId: string } | { ok: false; reason: CareerEmployerScopeDenyReason };

const LEGACY_BY_SUFFIX: Record<CareerEmployerScopedSuffix, string> = {
  career_posts_v1: "wm_employer_career_posts_v1",
  career_activity_log_v1: "wm_employer_career_activity_log_v1",
  career_create_draft_v1: "wm_employer_career_create_draft_v1",
  // Legacy apps/workspaces were global employee keys — migrate once into employer bucket.
  career_applications_v1: "wm_employee_career_applications_v1",
  career_workspaces_v1: "wm_employee_career_workspaces_v1",
  // P1: marketplace search index was a single global employee key.
  career_search_v1: "wm_employee_career_posts_search_v1",
  career_saved_v1: "wm_employer_career_saved_v1",
};

function cleanScopeToken(raw: string): string {
  return raw.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
}

/**
 * Non-throwing scope resolution for UI guards and zero-leak soft paths.
 * Never returns the demo collision bucket when PROD or AUTH is on.
 */
export function peekCareerEmployerScopeId(): CareerEmployerScopePeek {
  try {
    const profile = employerSettingsStorage.get();
    const orgId = getEmployerOrgId(profile)?.trim();
    const companyId = profile.companyUniqueId?.trim() || profile.uniqueId?.trim();
    const raw = orgId || companyId || "";

    if (!raw) {
      return { ok: false, reason: "missing_org_id" };
    }

    const cleaned = cleanScopeToken(raw);
    if (!cleaned) {
      return { ok: false, reason: "invalid_org_id" };
    }

    if (cleaned === FALLBACK_SCOPE && (import.meta.env.PROD || AUTH_BACKEND_ENABLED)) {
      return { ok: false, reason: "missing_org_id" };
    }

    return { ok: true, scopeId: cleaned };
  } catch {
    return { ok: false, reason: "missing_org_id" };
  }
}

export function tryGetCareerEmployerScopeId(): string | null {
  const peek = peekCareerEmployerScopeId();
  return peek.ok ? peek.scopeId : null;
}

/** True when Career may safely read/write tenant-scoped stores and call employer APIs. */
export function hasValidCareerEmployerScope(): boolean {
  return peekCareerEmployerScopeId().ok;
}

export function sanitizeCareerEmployerScopeId(raw: string): string {
  const cleaned = cleanScopeToken(raw);
  if (cleaned) return cleaned;

  if (import.meta.env.PROD) {
    throw new Error(
      "[WorkMitra] Career employer scope id required; unknown_employer fallback is disabled in production.",
    );
  }

  return FALLBACK_SCOPE;
}

export function getCareerEmployerScopeId(): string {
  const peek = peekCareerEmployerScopeId();
  if (peek.ok) return peek.scopeId;

  if (import.meta.env.PROD || AUTH_BACKEND_ENABLED) {
    throw new Error("[WorkMitra] Missing employer org / company id for Career tenant scope.");
  }

  return FALLBACK_SCOPE;
}

export function careerEmployerScopedKey(
  suffix: CareerEmployerScopedSuffix,
  scopeId = getCareerEmployerScopeId(),
): string {
  const cleaned = sanitizeCareerEmployerScopeId(scopeId);
  return `wm_employer_${cleaned}_${suffix}`;
}

function migratedFlagKey(scopedKey: string): string {
  return `${scopedKey}__migrated_v1`;
}

export function migrateLegacyCareerKeyOnce(
  suffix: CareerEmployerScopedSuffix,
  scopedKey = careerEmployerScopedKey(suffix),
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

    const legacyRaw = localStorage.getItem(legacyKey);
    if (legacyRaw && legacyRaw !== "[]" && legacyRaw !== "{}") {
      localStorage.setItem(scopedKey, legacyRaw);
    }

    localStorage.setItem(flag, "1");
  } catch {
    /* demo-safe */
  }
}

/** Apps/workspaces/search use filtered or custom migrate (legacy was global / shared). */
const FILTERED_MIGRATE_SUFFIXES: ReadonlySet<CareerEmployerScopedSuffix> = new Set([
  "career_applications_v1",
  "career_workspaces_v1",
  "career_search_v1",
]);

export function resolveCareerEmployerScopedKey(
  suffix: CareerEmployerScopedSuffix,
  scopeId?: string,
): string {
  const scoped = careerEmployerScopedKey(suffix, scopeId ?? getCareerEmployerScopeId());
  if (!FILTERED_MIGRATE_SUFFIXES.has(suffix)) {
    migrateLegacyCareerKeyOnce(suffix, scoped);
  }
  return scoped;
}

/**
 * Soft resolve — returns null when employer org/company id is missing.
 * Callers must not fall back to unscoped legacy keys (zero-leak).
 */
export function tryResolveCareerEmployerScopedKey(
  suffix: CareerEmployerScopedSuffix,
): string | null {
  const scopeId = tryGetCareerEmployerScopeId();
  if (!scopeId) return null;
  return resolveCareerEmployerScopedKey(suffix, scopeId);
}

export const CAREER_EMPLOYER_LEGACY_KEYS = { ...LEGACY_BY_SUFFIX } as const;
