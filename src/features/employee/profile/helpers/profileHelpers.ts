// src/features/employee/profile/helpers/profileHelpers.ts

import type { EmployeeProfile } from "../storage/employeeProfile.storage";
import type { ChecklistRow, ChecklistId } from "../types/profileTypes";
import { CHECKLIST_ITEMS } from "../types/profileTypes";

export function clampString(s: string, max = 40): string {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > max ? t.slice(0, max) : t;
}

export function uniqueLower(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of list) {
    const v = x.trim();
    const k = v.toLowerCase();
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

function isSameStringArray(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function isSameAvailability(
  a: EmployeeProfile["availability"],
  b: EmployeeProfile["availability"],
): boolean {
  return (
    a.weekdays === b.weekdays &&
    a.weekends === b.weekends &&
    a.morning === b.morning &&
    a.afternoon === b.afternoon &&
    a.evening === b.evening
  );
}

export function isSameProfile(a: EmployeeProfile, b: EmployeeProfile): boolean {
  return (
    a.fullName === b.fullName &&
    a.city === b.city &&
    a.photoDataUrl === b.photoDataUrl &&
    a.phoneMasked === b.phoneMasked &&
    a.emailMasked === b.emailMasked &&
    a.experience === b.experience &&
    a.preferShiftJobs === b.preferShiftJobs &&
    a.preferCareerJobs === b.preferCareerJobs &&
    isSameStringArray(a.skills, b.skills) &&
    isSameStringArray(a.languages, b.languages) &&
    isSameAvailability(a.availability, b.availability)
  );
}

export function computeChecklist(p: EmployeeProfile): { doneCount: number; totalCount: number; rows: ChecklistRow[] } {
  const av = p.availability;
  const anyDay = av.weekdays || av.weekends;
  const anyTime = av.morning || av.afternoon || av.evening;

  const doneMap: Record<ChecklistId, boolean> = {
    fullName: !!p.fullName.trim(),
    city: !!p.city.trim(),
    skills: p.skills.length > 0,
    experience: !!p.experience,
    languages: p.languages.length > 0,
    jobTypes: p.preferShiftJobs || p.preferCareerJobs,
    availability: !!anyDay && !!anyTime,
  };

  const rows: ChecklistRow[] = CHECKLIST_ITEMS.map((it) => ({ ...it, done: doneMap[it.id] }));
  const doneCount = rows.filter((r) => r.done).length;
  return { doneCount, totalCount: rows.length, rows };
}

export async function readImageAsDataUrl(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}