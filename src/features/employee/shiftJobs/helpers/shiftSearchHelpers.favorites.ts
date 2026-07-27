import {
  FAVORITES_KEY,
  MAX_FAVORITES,
  MAX_VIEWS,
  safeStringArray,
  VIEWS_KEY,
} from "./shiftSearchHelpers.storage";

export function trackShiftView(postId: string): void {
  try {
    const existing = safeStringArray(VIEWS_KEY);
    const filtered = existing.filter((id) => id !== postId);
    const next = [postId, ...filtered].slice(0, MAX_VIEWS);
    localStorage.setItem(VIEWS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("wm:employee-shift-views-changed"));
  } catch {
    /* local-first safe */
  }
}

export function getRecentlyViewedIds(): string[] {
  return safeStringArray(VIEWS_KEY).slice(0, MAX_VIEWS);
}

export function getFavoriteShiftIds(): string[] {
  return safeStringArray(FAVORITES_KEY).slice(0, MAX_FAVORITES);
}

export function isFavoriteShift(postId: string): boolean {
  return getFavoriteShiftIds().includes(postId);
}

export function toggleFavoriteShift(postId: string): string[] {
  const existing = getFavoriteShiftIds();
  const isSaved = existing.includes(postId);

  const next = isSaved
    ? existing.filter((id) => id !== postId)
    : [postId, ...existing.filter((id) => id !== postId)].slice(0, MAX_FAVORITES);

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("wm:employee-shift-favorites-changed"));
  } catch {
    /* local-first safe */
  }

  return next;
}
