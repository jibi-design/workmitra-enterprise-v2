// src/features/employee/shiftJobs/helpers/shiftApplyHelpers.ts

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type ExperienceLabel = "helper" | "fresher_ok" | "experienced";

export type ShiftPostDemo = {
  id: string;
  companyName: string;
  jobName: string;
  category: string;
  experience: ExperienceLabel;
  payPerDay: number;
  locationName: string;
  distanceKm: number;
  startAt: number;
  endAt: number;
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

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
export const POSTS_KEY = "wm_employee_shift_posts_demo_v1";
export const APPS_KEY = "wm_employee_shift_applications_v1";

/* ------------------------------------------------ */
/* Parsing                                          */
/* ------------------------------------------------ */
export function safeParsePosts(raw: string | null): ShiftPostDemo[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is ShiftPostDemo =>
      !!p && typeof p === "object" &&
      typeof (p as ShiftPostDemo).id === "string" &&
      typeof (p as ShiftPostDemo).companyName === "string" &&
      typeof (p as ShiftPostDemo).jobName === "string" &&
      typeof (p as ShiftPostDemo).payPerDay === "number" &&
      typeof (p as ShiftPostDemo).locationName === "string" &&
      typeof (p as ShiftPostDemo).startAt === "number" &&
      typeof (p as ShiftPostDemo).endAt === "number",
    );
  } catch { return []; }
}

export function safeParseApps(raw: string | null): ShiftApplicationDemo[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((a): a is ShiftApplicationDemo =>
      !!a && typeof a === "object" &&
      typeof (a as ShiftApplicationDemo).id === "string" &&
      typeof (a as ShiftApplicationDemo).postId === "string" &&
      typeof (a as ShiftApplicationDemo).createdAt === "number" &&
      ((a as ShiftApplicationDemo).status === "applied" || (a as ShiftApplicationDemo).status === "withdrawn"),
    );
  } catch { return []; }
}

export function safeWriteApps(list: ShiftApplicationDemo[]): void {
  try { localStorage.setItem(APPS_KEY, JSON.stringify(list)); } catch { /* safe */ }
}

/* ------------------------------------------------ */
/* Display helpers                                  */
/* ------------------------------------------------ */
export function cap(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function expLabel(x: ExperienceLabel): string {
  if (x === "helper") return "Helper";
  if (x === "fresher_ok") return "Fresher OK";
  return "Experienced";
}

export function fmtDateRange(startAt: number, endAt: number): string {
  try {
    const s = new Date(startAt);
    const e = new Date(endAt);
    const sameDay = s.toDateString() === e.toDateString();
    const sTxt = s.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const eTxt = e.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return sameDay ? sTxt : `${sTxt} - ${eTxt}`;
  } catch { return "Date"; }
}

export function ensureRequirements(post: ShiftPostDemo): { mustHave: string[]; goodToHave: string[] } {
  const mustHave = Array.isArray(post.mustHave) ? post.mustHave.filter((x) => typeof x === "string" && x.trim()) : [];
  const goodToHave = Array.isArray(post.goodToHave) ? post.goodToHave.filter((x) => typeof x === "string" && x.trim()) : [];
  return { mustHave, goodToHave };
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}