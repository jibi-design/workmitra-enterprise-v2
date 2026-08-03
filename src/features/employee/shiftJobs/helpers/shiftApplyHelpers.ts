// App name: Job Mitra
// File name: shiftApplyHelpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\helpers\shiftApplyHelpers.ts

import { upsertAppIntoEmployerScope } from "../../../shared/shift/shiftTenantProjection";

export type ExperienceLabel = "helper" | "fresher_ok" | "experienced";

export type ShiftPayBasis = "per_hour" | "per_day" | "fixed_total" | "not_listed";

export type ShiftPostDemo = {
  id: string;
  companyName: string;
  jobName: string;
  category: string;
  experience: ExperienceLabel;
  payPerDay: number;
  payBasis?: ShiftPayBasis;
  locationName: string;
  locationAddress?: string;
  distanceKm: number;
  startAt: number;
  endAt: number;
  description?: string;
  shiftTiming?: string;
  mapsLink?: string;
  vacancies?: number;
  isHiddenFromSearch?: boolean;
  mustHave?: string[];
  goodToHave?: string[];
  whatWeProvide?: string[];
  quickQuestions?: { id: string; text: string }[];
  dressCode?: string;
  jobType?: "one-time" | "weekly" | "custom";
};

export type AnswerState = "meets" | "not_sure" | "dont_meet";

export type ShiftApplicationDemo = {
  id: string;
  postId: string;
  createdAt: number;
  status: "applied" | "withdrawn";
  profileSnapshot?: {
    uniqueId?: string;
    fullName?: string;
    city?: string;
    experience?: string;
    skills?: string[];
    languages?: string[];
  };
  mustHaveAnswers: Record<string, AnswerState>;
  goodToHaveAnswers: Record<string, AnswerState>;
  notes: Record<string, string>;
  withdrawnAt?: number;
  quickAnswers?: Record<string, "yes" | "no">;
};

export const POSTS_KEY = "wm_employee_shift_search_v1";
export const APPS_KEY = "wm_employee_shift_applications_v1";

export function safeParsePosts(raw: string | null): ShiftPostDemo[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (post): post is ShiftPostDemo =>
        Boolean(post) &&
        typeof post === "object" &&
        typeof (post as ShiftPostDemo).id === "string" &&
        typeof (post as ShiftPostDemo).companyName === "string" &&
        typeof (post as ShiftPostDemo).jobName === "string" &&
        typeof (post as ShiftPostDemo).payPerDay === "number" &&
        typeof (post as ShiftPostDemo).locationName === "string" &&
        typeof (post as ShiftPostDemo).startAt === "number" &&
        typeof (post as ShiftPostDemo).endAt === "number",
    );
  } catch {
    return [];
  }
}

export function safeParseApps(raw: string | null): ShiftApplicationDemo[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (app): app is ShiftApplicationDemo =>
        Boolean(app) &&
        typeof app === "object" &&
        typeof (app as ShiftApplicationDemo).id === "string" &&
        typeof (app as ShiftApplicationDemo).postId === "string" &&
        typeof (app as ShiftApplicationDemo).createdAt === "number" &&
        ((app as ShiftApplicationDemo).status === "applied" ||
          (app as ShiftApplicationDemo).status === "withdrawn"),
    );
  } catch {
    return [];
  }
}

export function safeWriteApps(list: ShiftApplicationDemo[]): void {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(list));
    for (const app of list) {
      upsertAppIntoEmployerScope(app as unknown as Record<string, unknown>);
    }
    window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
  } catch {
    // Local-first safe fallback.
  }
}

export function cap(value: string): string {
  const trimmed = value.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function expLabel(value: ExperienceLabel): string {
  if (value === "helper") return "Helper";
  if (value === "fresher_ok") return "Fresher OK";
  return "Experienced";
}

export function fmtDateRange(startAt: number, endAt: number): string {
  try {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const sameDay = start.toDateString() === end.toDateString();
    const startText = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const endText = end.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    return sameDay ? startText : `${startText} - ${endText}`;
  } catch {
    return "Date";
  }
}

export function ensureRequirements(post: ShiftPostDemo): {
  mustHave: string[];
  goodToHave: string[];
} {
  const mustHave = Array.isArray(post.mustHave)
    ? post.mustHave.filter((item) => typeof item === "string" && item.trim())
    : [];

  const goodToHave = Array.isArray(post.goodToHave)
    ? post.goodToHave.filter((item) => typeof item === "string" && item.trim())
    : [];

  return { mustHave, goodToHave };
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
