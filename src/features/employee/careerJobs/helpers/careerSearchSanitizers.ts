// App name: Job Mitra
// File name: careerSearchSanitizers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerSearchSanitizers.ts

import type { CareerSearchPost } from "./careerSearchTypes";

const MAX_TEXT_LENGTH = 180;
const MAX_LONG_TEXT_LENGTH = 1_500;
const MAX_LIST_ITEMS = 20;
const MAX_SCREENING_QUESTIONS = 7;
const MAX_NOTICE_PERIOD_DAYS = 365;
const MAX_EXPERIENCE_YEARS = 50;
const MAX_INTERVIEW_ROUNDS = 10;
const MAX_SALARY_VALUE = 999_999_999;

export type Rec = Record<string, unknown>;

export function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

export function str(r: Rec, k: string): string | undefined {
  const v = r[k];
  return typeof v === "string" ? v : undefined;
}

export function num(r: Rec, k: string): number | undefined {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export function cleanText(value: string | undefined, maxLength = MAX_TEXT_LENGTH): string {
  return (value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function cleanLongText(value: string | undefined): string {
  return cleanText(value, MAX_LONG_TEXT_LENGTH);
}

function cleanStringArray(r: Rec, k: string, maxItems = MAX_LIST_ITEMS): string[] {
  const v = r[k];
  if (!Array.isArray(v)) return [];

  return Array.from(
    new Set(
      v
        .filter((x): x is string => typeof x === "string")
        .map((item) => cleanText(item))
        .filter(Boolean),
    ),
  ).slice(0, maxItems);
}

export function clampNumber(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;

  return Math.min(Math.max(value, min), max);
}

export function normalizeSalaryRange(
  minRaw: number | undefined,
  maxRaw: number | undefined,
): { min: number; max: number } {
  const min = clampNumber(minRaw, 0, MAX_SALARY_VALUE, 0);
  const max = clampNumber(maxRaw, 0, MAX_SALARY_VALUE, 0);

  if (max > 0 && max < min) {
    return { min: max, max: min };
  }

  return { min, max };
}

export function normalizeExperienceRange(
  minRaw: number | undefined,
  maxRaw: number | undefined,
): { min: number; max: number } {
  const min = clampNumber(minRaw, 0, MAX_EXPERIENCE_YEARS, 0);
  const max = clampNumber(maxRaw, 0, MAX_EXPERIENCE_YEARS, 0);

  if (max > 0 && max < min) {
    return { min: max, max: min };
  }

  return { min, max };
}

export function normalizeNoticePeriod(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;

  return Math.min(Math.max(Math.floor(value), 0), MAX_NOTICE_PERIOD_DAYS);
}

function screeningQuestions(r: Rec): { id: string; text: string }[] | undefined {
  const raw = r["screeningQuestions"];
  if (!Array.isArray(raw)) return undefined;

  const questions = raw
    .filter(isRec)
    .map((item) => {
      const id = cleanText(str(item, "id"), 80);
      const text = cleanText(str(item, "text"), 240);

      if (!id || !text) return null;

      return { id, text };
    })
    .filter((item): item is { id: string; text: string } => item !== null)
    .slice(0, MAX_SCREENING_QUESTIONS);

  return questions.length > 0 ? questions : undefined;
}

function clampJobType(x: unknown): CareerSearchPost["jobType"] {
  if (x === "full-time" || x === "part-time" || x === "contract") return x;
  return "full-time";
}

function clampWorkMode(x: unknown): CareerSearchPost["workMode"] {
  if (x === "on-site" || x === "remote" || x === "hybrid") return x;
  return "on-site";
}

function clampSalaryPeriod(x: unknown): CareerSearchPost["salaryPeriod"] {
  if (x === "monthly" || x === "yearly") return x;
  return "monthly";
}

export function isFutureClosingDate(value: number, now: number): boolean {
  return Number.isFinite(value) && value > now;
}

export function parseSearchPosts(raw: string | null): CareerSearchPost[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    const byId = new Map<string, CareerSearchPost>();

    for (const item of parsed) {
      if (!isRec(item)) continue;

      const id = cleanText(str(item, "id"), 120);
      const companyName = cleanText(str(item, "companyName"));
      const jobTitle = cleanText(str(item, "jobTitle"));
      const closingDate = num(item, "closingDate") ?? 0;

      if (!id || !companyName || !jobTitle) continue;
      if (!isFutureClosingDate(closingDate, now)) continue;

      const salary = normalizeSalaryRange(num(item, "salaryMin"), num(item, "salaryMax"));
      const experience = normalizeExperienceRange(
        num(item, "experienceMin"),
        num(item, "experienceMax"),
      );
      const interviewRounds = clampNumber(num(item, "interviewRounds"), 1, MAX_INTERVIEW_ROUNDS, 1);

      const post: CareerSearchPost = {
        id,
        companyName,
        jobTitle,
        department: cleanText(str(item, "department")),
        jobType: clampJobType(item["jobType"]),
        workMode: clampWorkMode(item["workMode"]),
        location: cleanText(str(item, "location")),
        salaryMin: salary.min,
        salaryMax: salary.max,
        salaryPeriod: clampSalaryPeriod(item["salaryPeriod"]),
        experienceMin: experience.min,
        experienceMax: experience.max,
        noticePeriodDays: normalizeNoticePeriod(num(item, "noticePeriodDays")),
        qualifications: cleanStringArray(item, "qualifications"),
        skills: cleanStringArray(item, "skills"),
        description: cleanLongText(str(item, "description")),
        responsibilities: cleanStringArray(item, "responsibilities"),
        interviewRounds,
        closingDate,
        createdAt: clampNumber(num(item, "createdAt"), 0, Number.MAX_SAFE_INTEGER, 0),
        screeningQuestions: screeningQuestions(item),
        employerId: cleanText(str(item, "employerId"), 120) || undefined,
      };

      const existing = byId.get(id);

      if (!existing || post.createdAt > existing.createdAt) {
        byId.set(id, post);
      }
    }

    return Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}
