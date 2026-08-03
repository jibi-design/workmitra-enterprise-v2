/**
 * Career searchable posts index — P1 tenant isolation.
 *
 * Employer writes: wm_employer_{scopeId}_career_search_v1
 * Employee reads: merge all employer search buckets (marketplace discovery).
 * Employee optional cache: wm_employee_{workerMlId}_career_search_v1 (mirror of merged view).
 *
 * Legacy global wm_employee_career_posts_search_v1 migrates once into the *current*
 * employer bucket on first employer sync (not into every worker).
 */

import {
  careerEmployerScopedKey,
  sanitizeCareerEmployerScopeId,
  tryGetCareerEmployerScopeId,
} from "./careerEmployerScope";
import {
  getCurrentCareerEmployeeScopeId,
  resolveCareerEmployeeScopedKey,
} from "./careerEmployeeScope";

export const CAREER_SEARCH_LEGACY_KEY = "wm_employee_career_posts_search_v1";
export const CAREER_SEARCH_EMPLOYER_SUFFIX = "career_search_v1" as const;

const EMPLOYER_SEARCH_KEY_RE = /^wm_employer_[a-zA-Z0-9_-]+_career_search_v1$/;

function migratedFlag(scopedKey: string): string {
  return `${scopedKey}__migrated_v1`;
}

export function getCareerEmployerSearchStorageKey(scopeId?: string): string {
  const scope = scopeId?.trim() || tryGetCareerEmployerScopeId();
  if (!scope) {
    return "wm_employer__unavailable_career_search_v1";
  }
  return careerEmployerScopedKey(CAREER_SEARCH_EMPLOYER_SUFFIX, scope);
}

export function getCareerEmployeeSearchStorageKey(workerMlId?: string): string {
  return resolveCareerEmployeeScopedKey("career_search_v1", workerMlId);
}

/** Migrate legacy global search index into this employer's scoped bucket once. */
export function migrateLegacyCareerSearchIntoEmployerOnce(scopeId?: string): void {
  if (typeof localStorage === "undefined") return;

  const resolved = scopeId?.trim() || tryGetCareerEmployerScopeId();
  if (!resolved) return;

  const scopedKey = getCareerEmployerSearchStorageKey(resolved);
  const flag = migratedFlag(scopedKey);

  try {
    if (localStorage.getItem(flag) === "1") return;

    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw && scopedRaw !== "[]" && scopedRaw !== "{}") {
      localStorage.setItem(flag, "1");
      return;
    }

    const legacyRaw = localStorage.getItem(CAREER_SEARCH_LEGACY_KEY);
    if (legacyRaw && legacyRaw !== "[]" && legacyRaw !== "{}") {
      // Prefer posts that belong to this employer when employerId is present.
      try {
        const parsed = JSON.parse(legacyRaw) as unknown;
        if (Array.isArray(parsed)) {
          const cleanedScope = sanitizeCareerEmployerScopeId(resolved);
          const mine = parsed.filter((item) => {
            if (!item || typeof item !== "object") return false;
            const employerId = (item as { employerId?: unknown }).employerId;
            if (typeof employerId !== "string" || !employerId.trim()) return true;
            return sanitizeCareerEmployerScopeId(employerId) === cleanedScope;
          });
          localStorage.setItem(scopedKey, JSON.stringify(mine.length > 0 ? mine : parsed));
        } else {
          localStorage.setItem(scopedKey, legacyRaw);
        }
      } catch {
        localStorage.setItem(scopedKey, legacyRaw);
      }
    }

    localStorage.setItem(flag, "1");
  } catch {
    /* demo-safe */
  }
}

/** List all employer-scoped career search keys present in localStorage. */
export function listCareerEmployerSearchStorageKeys(): string[] {
  if (typeof localStorage === "undefined") return [];
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && EMPLOYER_SEARCH_KEY_RE.test(key)) keys.push(key);
    }
  } catch {
    return [];
  }
  return keys.sort();
}

/**
 * Fingerprint for useSyncExternalStore — joins all employer search buckets
 * (and current worker mirror) so cross-tenant writes invalidate the cache.
 */
export function getCareerSearchIndexFingerprint(): string {
  const parts: string[] = [];
  for (const key of listCareerEmployerSearchStorageKeys()) {
    try {
      parts.push(`${key}:${localStorage.getItem(key) ?? ""}`);
    } catch {
      parts.push(`${key}:`);
    }
  }
  // Include worker mirror if present
  try {
    const workerKey = getCareerEmployeeSearchStorageKey();
    parts.push(`${workerKey}:${localStorage.getItem(workerKey) ?? ""}`);
  } catch {
    /* ignore */
  }
  return parts.join("\n");
}

/**
 * Raw merged JSON array string of searchable posts across all employer tenants.
 * Does not fall back to unscoped legacy after migration era — legacy is only
 * pulled via migrateLegacyCareerSearchIntoEmployerOnce on employer write.
 */
export function readMergedCareerSearchIndexRaw(): string {
  const byId = new Map<string, unknown>();

  for (const key of listCareerEmployerSearchStorageKeys()) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) continue;
      for (const item of parsed) {
        if (!item || typeof item !== "object") continue;
        const id = (item as { id?: unknown }).id;
        if (typeof id !== "string" || !id.trim()) continue;
        const createdAt = (item as { createdAt?: unknown }).createdAt;
        const existing = byId.get(id);
        const existingCreated =
          existing && typeof existing === "object"
            ? (existing as { createdAt?: unknown }).createdAt
            : undefined;
        if (
          !existing ||
          (typeof createdAt === "number" &&
            typeof existingCreated === "number" &&
            createdAt > existingCreated) ||
          typeof existingCreated !== "number"
        ) {
          byId.set(id, item);
        }
      }
    } catch {
      /* skip bad bucket */
    }
  }

  // If no employer buckets yet, allow one-shot legacy read for cold start
  // (does not write unscoped — callers should migrate via employer sync).
  if (byId.size === 0) {
    try {
      const legacy = localStorage.getItem(CAREER_SEARCH_LEGACY_KEY);
      if (legacy) return legacy;
    } catch {
      /* ignore */
    }
    return "[]";
  }

  return JSON.stringify(Array.from(byId.values()));
}

/** Mirror merged index into current worker search key (employee-scoped cache). */
export function mirrorCareerSearchIndexToCurrentEmployee(mergedRaw: string): void {
  try {
    const workerKey = getCareerEmployeeSearchStorageKey(getCurrentCareerEmployeeScopeId());
    localStorage.setItem(workerKey, mergedRaw);
  } catch {
    /* demo-safe */
  }
}
