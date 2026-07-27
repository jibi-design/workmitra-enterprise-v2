import type { WorkforceAnnouncement, WorkforceApplication } from "../types/workforceTypes";
import {
  getBoolean,
  getNumber,
  getString,
  getStringArray,
  isRecord,
  safeParse,
  safeRead,
} from "../storage/workforceStorageUtils";
import { normalizeShifts, normalizeVacancyMap } from "./workforceNormalizers.shared";

const VALID_ANN_STATUS = new Set(["open", "analyzing", "confirmed", "completed", "cancelled"]);

export function normalizeAnnouncement(raw: unknown): WorkforceAnnouncement | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");

  if (!id) return null;

  const statusRaw = getString(raw, "status");
  const status = VALID_ANN_STATUS.has(statusRaw)
    ? (statusRaw as WorkforceAnnouncement["status"])
    : "open";

  return {
    id,
    title: getString(raw, "title"),
    date: getString(raw, "date"),
    time: getString(raw, "time"),
    location: getString(raw, "location"),
    description: getString(raw, "description"),
    targetCategories: getStringArray(raw, "targetCategories"),
    shifts: normalizeShifts(raw.shifts),
    vacancyPerCategoryPerShift: normalizeVacancyMap(raw.vacancyPerCategoryPerShift),
    waitingBuffer: getNumber(raw, "waitingBuffer"),
    autoReplace: getBoolean(raw, "autoReplace", true),
    status,
    createdAt: getNumber(raw, "createdAt"),
    confirmedAt: raw.confirmedAt !== undefined ? getNumber(raw, "confirmedAt") : undefined,
    completedAt: raw.completedAt !== undefined ? getNumber(raw, "completedAt") : undefined,
    isTemplate: getBoolean(raw, "isTemplate", false),
    templateName: getString(raw, "templateName") || undefined,
    clonedFrom: getString(raw, "clonedFrom") || undefined,
  };
}

export function readAnnouncements(key: string): WorkforceAnnouncement[] {
  return safeParse<unknown>(safeRead(key))
    .map(normalizeAnnouncement)
    .filter((announcement): announcement is WorkforceAnnouncement => announcement !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

const VALID_APP_STATUS = new Set([
  "applied",
  "selected",
  "waiting",
  "not_selected",
  "confirmed",
  "cancelled",
]);

export function normalizeApplication(raw: unknown): WorkforceApplication | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");
  const announcementId = getString(raw, "announcementId");

  if (!id || !announcementId) return null;

  const statusRaw = getString(raw, "status");
  const status = VALID_APP_STATUS.has(statusRaw)
    ? (statusRaw as WorkforceApplication["status"])
    : "applied";

  const ratingRaw = raw.rating;
  const rating =
    typeof ratingRaw === "number" && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;

  return {
    id,
    announcementId,
    staffId: getString(raw, "staffId"),
    employeeUniqueId: getString(raw, "employeeUniqueId"),
    employeeName: getString(raw, "employeeName"),
    categoryId: getString(raw, "categoryId"),
    shiftIds: getStringArray(raw, "shiftIds"),
    rating,
    hasDateConflict: getBoolean(raw, "hasDateConflict", false),
    status,
    appliedAt: getNumber(raw, "appliedAt"),
    confirmedAt: raw.confirmedAt !== undefined ? getNumber(raw, "confirmedAt") : undefined,
    cancelledAt: raw.cancelledAt !== undefined ? getNumber(raw, "cancelledAt") : undefined,
    cancelReason:
      (getString(raw, "cancelReason") as WorkforceApplication["cancelReason"]) || undefined,
    cancelNote: getString(raw, "cancelNote") || undefined,
  };
}

export function readApplications(key: string): WorkforceApplication[] {
  return safeParse<unknown>(safeRead(key))
    .map(normalizeApplication)
    .filter((application): application is WorkforceApplication => application !== null);
}
