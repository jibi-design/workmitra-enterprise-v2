/** Job Mitra | Replace employee search LS with nearby posts (AUTH on). */

import type { ShiftPostDemo } from "../types/shiftSearch.types";

const POSTS_KEY = "wm_employee_shift_search_v1";
const POSTS_CHANGED_EVENT = "wm:employee-shift-search-changed";

export function replaceShiftSearchPosts(posts: ShiftPostDemo[]): void {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event(POSTS_CHANGED_EVENT));
}
