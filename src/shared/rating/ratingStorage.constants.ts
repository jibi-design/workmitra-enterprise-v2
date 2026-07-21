export const ER_KEY = "wm_ratings_employer_to_worker_v1";
export const WR_KEY = "wm_ratings_worker_to_employer_v1";
export const CHANGED_EVENT = "wm:ratings-changed";
export const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
export const MAX_RATING_COMMENT_LENGTH = 240;
export const MAX_RATING_TAGS = 8;

export type EditResult = { success: true } | { success: false; reason: string };

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
