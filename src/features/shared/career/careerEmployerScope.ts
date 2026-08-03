/**
 * Employer-scoped Career localStorage keys (HR-style).
 * Pattern: wm_employer_{scopeId}_{suffix}
 *
 * Employer-owned SoT: posts, activity, create draft.
 * Worker projection apps/workspaces/search remain global flat (employee marketplace).
 */

import { employerSettingsStorage } from "../../employer/company/storage/employerSettings.storage";
import { getEmployerOrgId } from "../../employer/company/helpers/employerDualId.helpers";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";

export const CAREER_EMPLOYER_SCOPE_CHANGED_EVENT = "wm:career-employer-scope-changed";

const FALLBACK_SCOPE = "unknown_employer";

export type CareerEmployerScopedSuffix =
  "career_posts_v1" | "career_activity_log_v1" | "career_create_draft_v1";

const LEGACY_BY_SUFFIX: Record<CareerEmployerScopedSuffix, string> = {
  career_posts_v1: "wm_employer_career_posts_v1",
  career_activity_log_v1: "wm_employer_career_activity_log_v1",
  career_create_draft_v1: "wm_employer_career_create_draft_v1",
};

export function sanitizeCareerEmployerScopeId(raw: string): string {
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  if (cleaned) return cleaned;

  if (import.meta.env.PROD) {
    throw new Error(
      "[WorkMitra] Career employer scope id required; unknown_employer fallback is disabled in production.",
    );
  }

  return FALLBACK_SCOPE;
}

export function getCareerEmployerScopeId(): string {
  try {
    const profile = employerSettingsStorage.get();
    const orgId = getEmployerOrgId(profile)?.trim();
    const companyId = profile.companyUniqueId?.trim() || profile.uniqueId?.trim();
    const raw = orgId || companyId || "";

    if (!raw) {
      if (import.meta.env.PROD) {
        throw new Error("[WorkMitra] Missing employer org / company id for Career tenant scope.");
      }
      return FALLBACK_SCOPE;
    }

    return sanitizeCareerEmployerScopeId(raw);
  } catch (err) {
    if (import.meta.env.PROD) throw err;
    if (AUTH_BACKEND_ENABLED && err instanceof Error && err.message.includes("[WorkMitra]")) {
      throw err;
    }
    return FALLBACK_SCOPE;
  }
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

export function resolveCareerEmployerScopedKey(suffix: CareerEmployerScopedSuffix): string {
  const scoped = careerEmployerScopedKey(suffix);
  migrateLegacyCareerKeyOnce(suffix, scoped);
  return scoped;
}

export const CAREER_EMPLOYER_LEGACY_KEYS = { ...LEGACY_BY_SUFFIX } as const;
