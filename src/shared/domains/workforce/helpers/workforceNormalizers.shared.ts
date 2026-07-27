import type { AnnouncementShift } from "../types/workforceTypes";
import {
  getBoolean,
  getString,
  isRecord,
  type UnknownRecord,
} from "../storage/workforceStorageUtils";

export function normalizeShift(raw: unknown): AnnouncementShift | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");
  const name = getString(raw, "name");

  if (!id || !name) return null;

  return {
    id,
    name,
    startTime: getString(raw, "startTime"),
    endTime: getString(raw, "endTime"),
    hasBreak: getBoolean(raw, "hasBreak", false),
    breakStartTime: getString(raw, "breakStartTime"),
    breakEndTime: getString(raw, "breakEndTime"),
  };
}

export function normalizeShifts(raw: unknown): AnnouncementShift[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeShift).filter((shift): shift is AnnouncementShift => shift !== null);
}

export function normalizeVacancyMap(raw: unknown): Record<string, Record<string, number>> {
  if (!isRecord(raw)) return {};

  const result: Record<string, Record<string, number>> = {};

  for (const [catId, shiftMap] of Object.entries(raw)) {
    if (!isRecord(shiftMap)) continue;

    const inner: Record<string, number> = {};

    for (const [shiftId, val] of Object.entries(shiftMap as UnknownRecord)) {
      if (typeof val === "number" && Number.isFinite(val) && val >= 0) {
        inner[shiftId] = Math.floor(val);
      }
    }

    if (Object.keys(inner).length > 0) {
      result[catId] = inner;
    }
  }

  return result;
}
