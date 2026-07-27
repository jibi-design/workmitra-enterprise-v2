import type { WorkforceCategory, WorkforceStaff, WorkforceTemplate } from "../types/workforceTypes";
import {
  getNumber,
  getString,
  getStringArray,
  isRecord,
  safeParse,
  safeRead,
} from "../storage/workforceStorageUtils";
import { normalizeShifts, normalizeVacancyMap } from "./workforceNormalizers.shared";

export function normalizeCategory(raw: unknown): WorkforceCategory | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");
  const name = getString(raw, "name");

  if (!id || !name) return null;

  return {
    id,
    name,
    createdAt: getNumber(raw, "createdAt"),
    sortOrder: getNumber(raw, "sortOrder"),
  };
}

export function readCategories(key: string): WorkforceCategory[] {
  return safeParse<unknown>(safeRead(key))
    .map(normalizeCategory)
    .filter((category): category is WorkforceCategory => category !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function normalizeStaff(raw: unknown): WorkforceStaff | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");
  const employeeUniqueId = getString(raw, "employeeUniqueId");

  if (!id || !employeeUniqueId) return null;

  const ratingRaw = raw.rating;
  const rating =
    typeof ratingRaw === "number" && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;

  return {
    id,
    employeeUniqueId,
    employeeName: getString(raw, "employeeName"),
    employeeCity: getString(raw, "employeeCity"),
    employeeSkills: getStringArray(raw, "employeeSkills"),
    categories: getStringArray(raw, "categories"),
    rating,
    ratingCount: getNumber(raw, "ratingCount"),
    ratingComment: getString(raw, "ratingComment"),
    plusPoints: getString(raw, "plusPoints"),
    bio: getString(raw, "bio"),
    addedAt: getNumber(raw, "addedAt"),
    status: getString(raw, "status") === "removed" ? "removed" : "active",
    removedAt: raw.removedAt !== undefined ? getNumber(raw, "removedAt") : undefined,
  };
}

export function readStaff(key: string): WorkforceStaff[] {
  return safeParse<unknown>(safeRead(key))
    .map(normalizeStaff)
    .filter((staff): staff is WorkforceStaff => staff !== null);
}

export function normalizeTemplate(raw: unknown): WorkforceTemplate | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");
  const name = getString(raw, "name");

  if (!id || !name) return null;

  return {
    id,
    name,
    targetCategories: getStringArray(raw, "targetCategories"),
    shifts: normalizeShifts(raw.shifts),
    vacancyPerCategoryPerShift: normalizeVacancyMap(raw.vacancyPerCategoryPerShift),
    waitingBuffer: getNumber(raw, "waitingBuffer"),
    titlePattern: getString(raw, "titlePattern"),
    description: getString(raw, "description"),
    location: getString(raw, "location"),
    createdAt: getNumber(raw, "createdAt"),
  };
}

export function readTemplates(key: string): WorkforceTemplate[] {
  return safeParse<unknown>(safeRead(key))
    .map(normalizeTemplate)
    .filter((template): template is WorkforceTemplate => template !== null);
}
