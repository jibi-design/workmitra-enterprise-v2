// App name: Job Mitra
// Strip confirmedIds from employer scoped posts + employee search (Control Center events)

import { isRec, safeArr, str } from "./shiftApplications.storage.parse";
import { getEmpPostsKey } from "../../../employer/shiftJobs/storage/employerShift.keys";
import { findScopeIdForPostId } from "../../../shared/shift/shiftTenantProjection";
import { shiftEmployerScopedKey } from "../../../shared/shift/shiftEmployerScope";

const POSTS_CHANGED = "wm:employer-shift-posts-changed";
const EMPLOYEE_POSTS_CHANGED = "wm:employee-shift-posts-changed";
const SEARCH_KEY = "wm_employee_shift_search_v1";
const SEARCH_CHANGED = "wm:employee-shift-search-changed";

function stripConfirmedIds(list: unknown[], postId: string, applicationId: string): unknown[] {
  return list.map((post) => {
    if (!isRec(post) || str(post, "id") !== postId) return post;
    const confirmedIds = Array.isArray(post.confirmedIds)
      ? post.confirmedIds.filter((id) => id !== applicationId)
      : [];
    return { ...post, confirmedIds };
  });
}

function resolvePostsKeyForPost(postId: string): string {
  const scopeId = findScopeIdForPostId(postId);
  if (scopeId) return shiftEmployerScopedKey("shift_posts_v1", scopeId);
  try {
    return getEmpPostsKey();
  } catch {
    return SEARCH_KEY;
  }
}

/** Keeps employer posts + search indexes + CC listeners in sync after cancel. */
export function stripConfirmedIdAcrossPostStores(postId: string, applicationId: string): void {
  try {
    const postsKey = resolvePostsKeyForPost(postId);
    const nextPosts = stripConfirmedIds(
      safeArr(localStorage.getItem(postsKey)),
      postId,
      applicationId,
    );
    localStorage.setItem(postsKey, JSON.stringify(nextPosts));
    window.dispatchEvent(new Event(POSTS_CHANGED));
    window.dispatchEvent(new Event(EMPLOYEE_POSTS_CHANGED));
  } catch {
    /* keep cancel even if post index write fails */
  }

  try {
    const nextSearch = stripConfirmedIds(
      safeArr(localStorage.getItem(SEARCH_KEY)),
      postId,
      applicationId,
    );
    localStorage.setItem(SEARCH_KEY, JSON.stringify(nextSearch));
    window.dispatchEvent(new Event(SEARCH_CHANGED));
  } catch {
    /* advisory — Control Center listens to search-changed */
  }
}
