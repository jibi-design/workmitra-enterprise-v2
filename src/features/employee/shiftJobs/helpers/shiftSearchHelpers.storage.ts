type Rec = Record<string, unknown>;

export function safeArray(key: string): Rec[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is Rec => typeof x === "object" && x !== null);
  } catch {
    return [];
  }
}

export function safeStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

export const VIEWS_KEY = "wm_employee_shift_views_v1";
export const FAVORITES_KEY = "wm_employee_shift_favorites_v1";
export const APPS_KEY = "wm_employee_shift_applications_v1";
export const POSTS_KEY = "wm_employer_shift_posts_v1";

export const MAX_VIEWS = 5;
export const MAX_FAVORITES = 30;
