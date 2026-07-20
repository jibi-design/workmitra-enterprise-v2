// App: Job Mitra / WorkMitra_Enterprise_v2
// File: shiftCreateHelpers.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\helpers\shiftCreateHelpers.ts

import type { ExperienceLabel, ShiftPost } from "../../shiftJobs/storage/employerShift.storage";
import type { ShiftPayBasis } from "../storage/employerShift.types";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";

export type ShiftPayBasisDraft = ShiftPayBasis | "";

export const SHIFT_PAY_BASIS_OPTIONS: readonly {
  value: ShiftPayBasis;
  label: string;
  helper: string;
}[] = [
  { value: "per_hour", label: "Per hour", helper: "Best for hourly markets and shorter shifts." },
  { value: "per_day", label: "Per day", helper: "Best for daily wage or full-day work." },
  {
    value: "fixed_total",
    label: "Fixed total",
    helper: "Best when the whole work has one total amount.",
  },
  {
    value: "not_listed",
    label: "Not listed / Discuss later",
    helper: "Use when pay is not ready to publish.",
  },
];

export function getShiftPayBasisLabel(payBasis: ShiftPayBasisDraft): string {
  if (payBasis === "per_hour") return "Per hour";
  if (payBasis === "per_day") return "Per day";
  if (payBasis === "fixed_total") return "Fixed total";
  if (payBasis === "not_listed") return "Not listed / Discuss later";
  return "Select pay basis";
}

export function formatShiftPayDisplay(amount: number, payBasis: ShiftPayBasisDraft): string {
  if (payBasis === "not_listed") return "Pay not listed";
  if (payBasis === "per_hour") return amount > 0 ? `${amount} / hour` : "___ / hour";
  if (payBasis === "per_day") return amount > 0 ? `${amount} / day` : "___ / day";
  if (payBasis === "fixed_total") return amount > 0 ? `${amount} total` : "___ total";

  return amount > 0 ? `${amount} / day` : "Select pay basis";
}

export function toEpoch(dateStr: string): number {
  try {
    const d = new Date(dateStr);
    return Number.isFinite(d.getTime()) ? d.getTime() : Date.now();
  } catch {
    return Date.now();
  }
}

export function toDateStr(epoch: number): string {
  try {
    const d = new Date(epoch);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export function todayStr(): string {
  return toDateStr(Date.now());
}

export function tomorrowEpoch(): number {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

export function normalizeLines(raw: string, opts: { maxItems: number; maxLen: number }): string[] {
  const lines = raw
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => (x.length > opts.maxLen ? x.slice(0, opts.maxLen) : x));

  const seen = new Set<string>();
  const out: string[] = [];

  for (const x of lines) {
    const k = x.toLowerCase();
    if (seen.has(k)) continue;

    seen.add(k);
    out.push(x);

    if (out.length >= opts.maxItems) break;
  }

  return out;
}

export function expLabel(e: ExperienceLabel): string {
  if (e === "helper") return "Helper (minimum experience)";
  if (e === "fresher_ok") return "Fresher (no experience needed)";
  return "Experienced only";
}

export function isDirtyCheck(fields: {
  companyName: string;
  jobName: string;
  category: string;
  description: string;
  vacanciesStr: string;
  payPerDayStr: string;
  payBasis: ShiftPayBasisDraft;
  locationName: string;
  mustHave: string;
  goodToHave: string;
}): boolean {
  return (
    fields.companyName.trim().length > 0 ||
    fields.jobName.trim().length > 0 ||
    fields.category.trim().length > 0 ||
    fields.description.trim().length > 0 ||
    fields.vacanciesStr.trim().length > 0 ||
    fields.payPerDayStr.trim().length > 0 ||
    fields.payBasis.length > 0 ||
    fields.locationName.trim().length > 0 ||
    fields.mustHave.trim().length > 0 ||
    fields.goodToHave.trim().length > 0
  );
}

export function validateShiftForm(p: {
  companyName: string;
  jobName: string;
  locationName: string;
  vacanciesStr: string;
  payPerDay: number;
  payBasis: ShiftPayBasisDraft;
  startAt: number;
  endAt: number;
}): string[] {
  const e: string[] = [];

  if (p.companyName.trim().length < 2) e.push("Company name is required (min 2 characters).");
  if (p.jobName.trim().length < 2) e.push("Job title is required (min 2 characters).");
  if (p.locationName.trim().length < 2) e.push("Work location is required.");
  if ((Number(p.vacanciesStr) || 0) < 1) e.push("At least 1 worker is needed.");
  if (!p.payBasis) e.push("Pay basis is required.");
  if (p.payBasis && p.payBasis !== "not_listed" && p.payPerDay <= 0) {
    e.push("Pay amount must be greater than 0.");
  }
  if (p.endAt < p.startAt) e.push("End date cannot be before start date.");

  return e;
}

export function validateWizardStep1(p: {
  companyName: string;
  jobName: string;
  vacanciesStr: string;
}): string[] {
  const e: string[] = [];

  if (p.companyName.trim().length < 2) e.push("Company name is required (min 2 characters).");
  if (p.jobName.trim().length < 2) e.push("Job title / role is required (min 2 characters).");
  if ((Number(p.vacanciesStr) || 0) < 1) e.push("At least 1 worker is needed.");

  return e;
}

export function validateWizardStep2(p: {
  locationName: string;
  payPerDay: number;
  payBasis: ShiftPayBasisDraft;
  startAt: number;
  endAt: number;
}): string[] {
  const e: string[] = [];

  if (p.locationName.trim().length < 2) e.push("City / area is required.");
  if (!p.payBasis) e.push("Pay basis is required.");
  if (p.payBasis && p.payBasis !== "not_listed" && p.payPerDay <= 0) {
    e.push("Pay amount must be greater than 0.");
  }
  if (p.endAt < p.startAt) e.push("End date cannot be before start date.");

  return e;
}

export type AutoFillData = {
  companyName: string;
  industryType: string;
  locationCity: string;
};

export function getAutoFillData(): AutoFillData {
  const profile = employerSettingsStorage.get();

  return {
    companyName: profile.companyName || "",
    industryType: profile.industryType || "",
    locationCity: profile.locationCity || "",
  };
}

export type ShiftDuplicateWarning = {
  id: string;
  jobName: string;
  companyName: string;
  locationName: string;
  dateRange: string;
  reason: string;
};

type DuplicateCandidate = {
  jobName: string;
  companyName: string;
  category: string;
  locationName: string;
  startAt: number;
  endAt: number;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isPlaceholderCategory(value: string): boolean {
  const normalized = normalizeText(value);
  return normalized === "" || normalized === "category" || normalized === "other";
}

function sameDateRange(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return toDateStr(aStart) === toDateStr(bStart) && toDateStr(aEnd) === toDateStr(bEnd);
}

function dateRangeLabel(startAt: number, endAt: number): string {
  const start = toDateStr(startAt);
  const end = toDateStr(endAt);
  return start === end ? start : `${start} to ${end}`;
}

function isSameLocation(postLocationRaw: string, candidateLocationRaw: string): boolean {
  const postLocation = normalizeText(postLocationRaw);
  const candidateLocation = normalizeText(candidateLocationRaw);

  if (!postLocation || !candidateLocation) return false;

  return postLocation.includes(candidateLocation) || candidateLocation.includes(postLocation);
}

export function findDuplicateShiftWarnings(
  posts: ShiftPost[],
  candidate: DuplicateCandidate,
): ShiftDuplicateWarning[] {
  const jobName = normalizeText(candidate.jobName);
  const companyName = normalizeText(candidate.companyName);
  const candidateCategory = normalizeText(candidate.category);
  const locationName = normalizeText(candidate.locationName);

  if (!jobName || !companyName || !locationName) return [];

  return posts
    .filter((post) => post.status !== "completed" && post.status !== "cancelled")
    .filter((post) => {
      const sameJob = normalizeText(post.jobName) === jobName;
      const sameCompany = normalizeText(post.companyName) === companyName;
      const sameLocation = isSameLocation(post.locationName, locationName);
      const sameDates = sameDateRange(post.startAt, post.endAt, candidate.startAt, candidate.endAt);

      if (!sameJob || !sameCompany || !sameLocation || !sameDates) return false;

      const postCategory = normalizeText(post.category);
      const sameCategory = postCategory === candidateCategory;
      const categoryNotReliable =
        isPlaceholderCategory(postCategory) || isPlaceholderCategory(candidateCategory);

      return sameCategory || categoryNotReliable;
    })
    .slice(0, 3)
    .map((post) => {
      const postCategory = normalizeText(post.category);
      const sameCategory = postCategory === candidateCategory;
      const categoryNotReliable =
        isPlaceholderCategory(postCategory) || isPlaceholderCategory(candidateCategory);

      return {
        id: post.id,
        jobName: post.jobName,
        companyName: post.companyName,
        locationName: post.locationName,
        dateRange: dateRangeLabel(post.startAt, post.endAt),
        reason:
          sameCategory && !categoryNotReliable
            ? "Similar active shift already exists for the same job, company, location, category, and date."
            : "Similar active shift already exists for the same job, company, location, and date. Category was not reliable enough to ignore it.",
      };
    });
}
