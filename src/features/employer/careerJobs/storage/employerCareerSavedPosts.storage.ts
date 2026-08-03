/**
 * Employer-scoped Career saved posts (P1).
 * Key: wm_employer_{scopeId}_career_saved_v1
 *
 * Reserved for employer-side saved/bookmarked career posts.
 * Empty by default; legacy key migrates via careerEmployerScope if present.
 */

import { tryResolveCareerEmployerScopedKey } from "../../../shared/career/careerEmployerScope";
import { safeParse, safeWrite, type CareerStorageWriteResult } from "../helpers/careerStorageUtils";

export type EmployerCareerSavedPostRecord = {
  postId: string;
  savedAt: number;
};

function savedKey(): string | null {
  return tryResolveCareerEmployerScopedKey("career_saved_v1");
}

export function readEmployerCareerSavedPosts(): EmployerCareerSavedPostRecord[] {
  const key = savedKey();
  if (!key) return [];
  const raw = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  const parsed = safeParse<Record<string, unknown>>(raw);
  return parsed
    .map((item) => {
      const postId = typeof item.postId === "string" ? item.postId.trim() : "";
      const savedAt =
        typeof item.savedAt === "number" && Number.isFinite(item.savedAt) ? item.savedAt : 0;
      if (!postId || savedAt <= 0) return null;
      return { postId, savedAt };
    })
    .filter((item): item is EmployerCareerSavedPostRecord => item !== null);
}

export function writeEmployerCareerSavedPosts(
  records: EmployerCareerSavedPostRecord[],
): CareerStorageWriteResult {
  const key = savedKey();
  if (!key) return { ok: false, reason: "storage_error" };
  return safeWrite(key, records);
}

export function getEmployerCareerSavedStorageKey(): string {
  return savedKey() ?? "wm_employer__unavailable_career_saved_v1";
}
