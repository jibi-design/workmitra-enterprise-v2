// src/features/employer/shiftJobs/helpers/shiftCreateHelpers.ts

import type { ExperienceLabel } from "../storage/employerShift.storage";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";

/* ------------------------------------------------ */
/* Date helpers                                     */
/* ------------------------------------------------ */
export function toEpoch(dateStr: string): number {
  try { const d = new Date(dateStr); return Number.isFinite(d.getTime()) ? d.getTime() : Date.now(); } catch { return Date.now(); }
}

export function toDateStr(epoch: number): string {
  try { const d = new Date(epoch); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; } catch { return ""; }
}

export function todayStr(): string { return toDateStr(Date.now()); }

export function tomorrowEpoch(): number {
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); return d.getTime();
}

export function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

/* ------------------------------------------------ */
/* Requirements normalizer                          */
/* ------------------------------------------------ */
export function normalizeLines(raw: string, opts: { maxItems: number; maxLen: number }): string[] {
  const lines = raw.split("\n").map((x) => x.trim()).filter(Boolean).map((x) => x.length > opts.maxLen ? x.slice(0, opts.maxLen) : x);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of lines) { const k = x.toLowerCase(); if (seen.has(k)) continue; seen.add(k); out.push(x); if (out.length >= opts.maxItems) break; }
  return out;
}

/* ------------------------------------------------ */
/* Experience label                                 */
/* ------------------------------------------------ */
export function expLabel(e: ExperienceLabel): string {
  if (e === "helper") return "Helper (minimum experience)";
  if (e === "fresher_ok") return "Fresher (no experience needed)";
  return "Experienced only";
}

/* ------------------------------------------------ */
/* Dirty check                                      */
/* ------------------------------------------------ */
export function isDirtyCheck(fields: {
  companyName: string; jobName: string; category: string; description: string;
  vacanciesStr: string; payPerDayStr: string; locationName: string; mustHave: string; goodToHave: string;
}): boolean {
  return (
    fields.companyName.trim().length > 0 || fields.jobName.trim().length > 0 ||
    fields.category.trim().length > 0 || fields.description.trim().length > 0 ||
    fields.vacanciesStr.trim().length > 0 || fields.payPerDayStr.trim().length > 0 ||
    fields.locationName.trim().length > 0 || fields.mustHave.trim().length > 0 || fields.goodToHave.trim().length > 0
  );
}

/* ------------------------------------------------ */
/* Validation                                       */
/* ------------------------------------------------ */
export function validateShiftForm(p: {
  companyName: string; jobName: string; locationName: string;
  vacanciesStr: string; payPerDay: number; startAt: number; endAt: number;
}): string[] {
  const e: string[] = [];
  if (p.companyName.trim().length < 2) e.push("Company name is required (min 2 characters).");
  if (p.jobName.trim().length < 2) e.push("Job title is required (min 2 characters).");
  if (p.locationName.trim().length < 2) e.push("Work location is required.");
  if ((Number(p.vacanciesStr) || 0) < 1) e.push("At least 1 worker is needed.");
  if (p.payPerDay <= 0) e.push("Pay per day must be greater than 0.");
  if (p.endAt < p.startAt) e.push("End date cannot be before start date.");
  return e;
}

/* ------------------------------------------------ */
/* Auto-fill from employer settings                 */
/* ------------------------------------------------ */
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