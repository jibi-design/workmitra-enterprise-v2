// App name: Job Mitra
// Strip confirmedIds from employer posts + employee search (Control Center events)

import { isRec, safeArr, str } from "./shiftApplications.storage.parse";

const POSTS_KEY = "wm_employer_shift_posts_v1";
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

/** Keeps employer posts + search indexes + CC listeners in sync after cancel. */
export function stripConfirmedIdAcrossPostStores(postId: string, applicationId: string): void {
  try {
    const nextPosts = stripConfirmedIds(
      safeArr(localStorage.getItem(POSTS_KEY)),
      postId,
      applicationId,
    );
    localStorage.setItem(POSTS_KEY, JSON.stringify(nextPosts));
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
