/** Indexed shift application counts — O(1) lookup by postId */

import { EMPLOYEE_APPS_KEY } from "./dashboardHelpers.apps";

export type AppsByPostCounts = {
  total: number;
  byStatus: Record<string, number>;
};

type AppsIndexCache = {
  raw: string | null;
  byPostId: Map<string, AppsByPostCounts>;
};

const EMPTY_COUNTS: AppsByPostCounts = { total: 0, byStatus: {} };

let cache: AppsIndexCache = { raw: "__init__", byPostId: new Map() };

function emptyCounts(): AppsByPostCounts {
  return { total: 0, byStatus: {} };
}

function rebuildIndex(raw: string | null): Map<string, AppsByPostCounts> {
  const byPostId = new Map<string, AppsByPostCounts>();
  if (!raw) return byPostId;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return byPostId;
  }

  if (!Array.isArray(parsed)) return byPostId;

  for (const item of parsed) {
    if (typeof item !== "object" || item === null) continue;
    const rec = item as Record<string, unknown>;
    const postId = rec["postId"];
    if (typeof postId !== "string" || !postId) continue;

    const status = typeof rec["status"] === "string" ? rec["status"] : "unknown";
    const current = byPostId.get(postId) ?? emptyCounts();
    current.total += 1;
    current.byStatus[status] = (current.byStatus[status] ?? 0) + 1;
    byPostId.set(postId, current);
  }

  return byPostId;
}

function ensureIndex(): Map<string, AppsByPostCounts> {
  const raw = localStorage.getItem(EMPLOYEE_APPS_KEY);
  if (raw === cache.raw) return cache.byPostId;
  cache = { raw, byPostId: rebuildIndex(raw) };
  return cache.byPostId;
}

/** Invalidate when apps blob changes outside normal localStorage reads. */
export function invalidateAppsByPostIndex(): void {
  cache = { raw: "__init__", byPostId: new Map() };
}

export function getAppsCountsForPost(postId: string): AppsByPostCounts {
  return ensureIndex().get(postId) ?? EMPTY_COUNTS;
}

export function countApplicationsForPostIndexed(postId: string, statusFilter?: string): number {
  const counts = getAppsCountsForPost(postId);
  if (!statusFilter) return counts.total;
  return counts.byStatus[statusFilter] ?? 0;
}
