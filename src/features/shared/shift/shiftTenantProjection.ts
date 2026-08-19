/**
 * Dual-write helpers: employer-scoped SoT ↔ worker-readable projections.
 * Step 1 Board Remediation — isolation clean-up.
 */

import { expandShiftPostIdAliases, shiftPostIdsMatch } from "../../shift/utils/shiftIdBridge";
import {
  getShiftEmployerScopeId,
  resolveShiftEmployerScopedKey,
  sanitizeShiftEmployerScopeId,
  shiftEmployerScopedKey,
} from "./shiftEmployerScope";

/** Worker-readable applications projection (not an employer store). */
export const WORKER_APPS_PROJECTION_KEY = "wm_employee_shift_applications_v1";

/** Worker-readable direct-invites projection (not an employer store). */
export const WORKER_INVITES_PROJECTION_KEY = "wm_employee_shift_direct_invites_v1";

/** Pre-scoping global invites key — migrate once into projection / filtered employer buckets. */
export const LEGACY_GLOBAL_INVITES_KEY = "wm_shift_direct_invites_v1";

export const EMPLOYEE_SEARCH_POSTS_KEY = "wm_employee_shift_search_v1";

const POSTS_KEY_RE = /^wm_employer_(.+)_shift_posts_v1$/;

function safeParseArray(raw: string | null): unknown[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isRec(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

/** Resolve which employer scope owns a post id (search stamp first, then scoped post buckets). */
export function findScopeIdForPostId(postId: string): string | null {
  const id = postId.trim();
  if (!id || typeof localStorage === "undefined") return null;

  try {
    for (const item of safeParseArray(localStorage.getItem(EMPLOYEE_SEARCH_POSTS_KEY))) {
      if (!isRec(item)) continue;
      const itemId = typeof item.id === "string" ? item.id.trim() : "";
      if (!itemId || !shiftPostIdsMatch(itemId, id)) continue;
      const stamped = typeof item.employerScopeId === "string" ? item.employerScopeId.trim() : "";
      if (stamped) return sanitizeShiftEmployerScopeId(stamped);
    }
  } catch {
    /* continue scan */
  }

  try {
    for (const key of Object.keys(localStorage)) {
      const match = POSTS_KEY_RE.exec(key);
      if (!match) continue;
      for (const item of safeParseArray(localStorage.getItem(key))) {
        if (isRec(item) && typeof item.id === "string" && shiftPostIdsMatch(item.id, id)) {
          return sanitizeShiftEmployerScopeId(match[1] ?? "");
        }
      }
    }
  } catch {
    /* demo-safe */
  }

  return null;
}

/** Post ids owned by the active employer scope. */
export function listActiveEmployerPostIds(): Set<string> {
  const ids = new Set<string>();
  if (typeof localStorage === "undefined") return ids;

  try {
    const key = resolveShiftEmployerScopedKey("shift_posts_v1");
    for (const item of safeParseArray(localStorage.getItem(key))) {
      if (isRec(item) && typeof item.id === "string" && item.id.trim()) {
        const postId = item.id.trim();
        ids.add(postId);
        for (const alias of expandShiftPostIdAliases(postId)) ids.add(alias);
      }
    }
  } catch {
    /* demo-safe */
  }

  return ids;
}

/**
 * Upsert records into a projection array by `id`, preserving unrelated rows.
 */
export function upsertProjectionById(
  projectionKey: string,
  records: readonly Record<string, unknown>[],
  max = 500,
): void {
  if (typeof localStorage === "undefined" || records.length === 0) return;

  try {
    const existing = safeParseArray(localStorage.getItem(projectionKey));
    const byId = new Map<string, Record<string, unknown>>();

    for (const item of existing) {
      if (!isRec(item) || typeof item.id !== "string") continue;
      byId.set(item.id, item);
    }

    for (const rec of records) {
      if (typeof rec.id !== "string" || !rec.id.trim()) continue;
      byId.set(rec.id, { ...(byId.get(rec.id) ?? {}), ...rec });
    }

    const next = Array.from(byId.values()).slice(0, max);
    localStorage.setItem(projectionKey, JSON.stringify(next));
  } catch {
    /* demo-safe */
  }
}

/** Replace entire projection (used when employer rewrite is authoritative for known ids). */
export function mergeEmployerAppsIntoWorkerProjection(
  employerApps: readonly Record<string, unknown>[],
): void {
  upsertProjectionById(WORKER_APPS_PROJECTION_KEY, employerApps, 800);
}

export function mergeEmployerInvitesIntoWorkerProjection(
  employerInvites: readonly Record<string, unknown>[],
): void {
  upsertProjectionById(WORKER_INVITES_PROJECTION_KEY, employerInvites, 300);
}

/**
 * One-shot: copy legacy global invites into the worker projection when empty.
 */
export function migrateLegacyInvitesToWorkerProjection(): void {
  if (typeof localStorage === "undefined") return;

  try {
    const flag = `${WORKER_INVITES_PROJECTION_KEY}__migrated_v1`;
    if (localStorage.getItem(flag) === "1") return;

    const projectionRaw = localStorage.getItem(WORKER_INVITES_PROJECTION_KEY);
    if (projectionRaw && projectionRaw !== "[]") {
      localStorage.setItem(flag, "1");
      return;
    }

    const legacyRaw = localStorage.getItem(LEGACY_GLOBAL_INVITES_KEY);
    if (legacyRaw && legacyRaw !== "[]") {
      localStorage.setItem(WORKER_INVITES_PROJECTION_KEY, legacyRaw);
    }

    localStorage.setItem(flag, "1");
  } catch {
    /* demo-safe */
  }
}

/**
 * Hydrate empty employer invites bucket from projection/legacy filtered by this employer's posts.
 */
export function ensureEmployerInvitesHydrated(): string {
  const scopedKey = resolveShiftEmployerScopedKey("shift_direct_invites_v1");
  migrateLegacyInvitesToWorkerProjection();

  try {
    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw && scopedRaw !== "[]") return scopedKey;

    const postIds = listActiveEmployerPostIds();
    const scopeId = getShiftEmployerScopeId();
    const pool = [
      ...safeParseArray(localStorage.getItem(WORKER_INVITES_PROJECTION_KEY)),
      ...safeParseArray(localStorage.getItem(LEGACY_GLOBAL_INVITES_KEY)),
    ];

    const mine: Record<string, unknown>[] = [];
    const seen = new Set<string>();

    for (const item of pool) {
      if (!isRec(item) || typeof item.id !== "string") continue;
      if (seen.has(item.id)) continue;

      const stamped = typeof item.employerScopeId === "string" ? item.employerScopeId.trim() : "";
      const postId = typeof item.postId === "string" ? item.postId.trim() : "";
      const belongs =
        (stamped && sanitizeShiftEmployerScopeId(stamped) === scopeId) ||
        (postId && postIds.has(postId));

      if (!belongs) continue;
      seen.add(item.id);
      mine.push({ ...item, employerScopeId: scopeId });
    }

    if (mine.length > 0) {
      localStorage.setItem(scopedKey, JSON.stringify(mine.slice(0, 300)));
    }
  } catch {
    /* demo-safe */
  }

  return scopedKey;
}

/**
 * Hydrate empty employer applications bucket from worker projection filtered by posts.
 */
export function ensureEmployerAppsHydrated(): string {
  const scopedKey = resolveShiftEmployerScopedKey("shift_applications_v1");

  try {
    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw && scopedRaw !== "[]") return scopedKey;

    const postIds = listActiveEmployerPostIds();
    if (postIds.size === 0) return scopedKey;

    const mine: Record<string, unknown>[] = [];
    for (const item of safeParseArray(localStorage.getItem(WORKER_APPS_PROJECTION_KEY))) {
      if (!isRec(item) || typeof item.id !== "string") continue;
      const postId = typeof item.postId === "string" ? item.postId.trim() : "";
      if (postId && (postIds.has(postId) || [...postIds].some((owned) => shiftPostIdsMatch(owned, postId)))) {
        mine.push(item);
      }
    }

    if (mine.length > 0) {
      localStorage.setItem(scopedKey, JSON.stringify(mine));
    }
  } catch {
    /* demo-safe */
  }

  return scopedKey;
}

/** Push a single app into the owning employer scoped bucket (worker apply path). */
export function upsertAppIntoEmployerScope(app: Record<string, unknown>): void {
  const postId = typeof app.postId === "string" ? app.postId : "";
  if (!postId) return;

  const scopeId = findScopeIdForPostId(postId);
  if (!scopeId) return;

  try {
    const key = shiftEmployerScopedKey("shift_applications_v1", scopeId);
    const existing = safeParseArray(localStorage.getItem(key));
    const byId = new Map<string, Record<string, unknown>>();

    for (const item of existing) {
      if (isRec(item) && typeof item.id === "string") byId.set(item.id, item);
    }

    if (typeof app.id === "string") {
      byId.set(app.id, { ...(byId.get(app.id) ?? {}), ...app });
    }

    localStorage.setItem(key, JSON.stringify(Array.from(byId.values())));
  } catch {
    /* demo-safe */
  }
}
