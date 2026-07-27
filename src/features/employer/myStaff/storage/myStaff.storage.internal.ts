import type { StaffCategory, StaffDepartment, StaffRecord } from "./myStaff.types";

export const STAFF_KEY = "wm_employer_staff_v1";
export const CATEGORIES_KEY = "wm_employer_staff_categories_v1";
export const DEPARTMENTS_KEY = "wm_employer_staff_departments_v1";
export const CHANGED_EVENT = "wm:employer-staff-changed";

export function readStaff(): StaffRecord[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StaffRecord[]) : [];
  } catch {
    return [];
  }
}

export function writeStaff(records: StaffRecord[]): void {
  localStorage.setItem(STAFF_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function readCategories(): StaffCategory[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StaffCategory[]) : [];
  } catch {
    return [];
  }
}

export function writeCategories(categories: StaffCategory[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function readDepartments(): StaffDepartment[] {
  try {
    const raw = localStorage.getItem(DEPARTMENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StaffDepartment[]) : [];
  } catch {
    return [];
  }
}

export function writeDepartments(departments: StaffDepartment[]): void {
  localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(departments));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function genId(prefix: string): string {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function sortByNewest<T extends { createdAt: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}
