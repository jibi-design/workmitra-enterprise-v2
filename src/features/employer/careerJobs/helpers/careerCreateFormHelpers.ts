// src/features/employer/careerJobs/helpers/careerCreateFormHelpers.ts
import type { InterviewRoundConfig } from "../types/careerTypes";

export function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

export function normalizeTagInput(raw: string, maxItems: number): string[] {
  const items = raw.split("\n").map((x) => x.trim()).filter(Boolean).map((x) => (x.length > 80 ? x.slice(0, 80) : x));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of items) {
    const k = x.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
    if (out.length >= maxItems) break;
  }
  return out;
}

export function tomorrow30d(): number {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  d.setHours(23, 59, 59, 0);
  return d.getTime();
}

export const CAREER_CREATE_STEPS = [
  { num: 1, label: "Basic Info" },
  { num: 2, label: "Requirements" },
  { num: 3, label: "Interview & Review" },
] as const;

export const DEFAULT_INTERVIEW_ROUNDS: InterviewRoundConfig[] = [
  { round: 1, label: "Screening", mode: "phone" },
];