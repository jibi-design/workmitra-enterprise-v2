/** Job Mitra | Planner date-by-date blind counts. Same Shift kernel. */

import { workerCoversJobSite } from "../location/workerCoversJobSite.js";
import { parsePincode } from "../location/pincode.js";
import { rolling7IsoDates } from "./availability.dates.js";
import type { AvailabilityBroadcastRecord } from "./availability.types.js";

export function countWorkersCoveringJobSite(params: {
  readonly broadcasts: readonly AvailabilityBroadcastRecord[];
  readonly jobPincode: string | null | undefined;
  readonly isoDate?: string | null;
  readonly from?: Date;
}): number {
  const jobPincode = parsePincode(params.jobPincode);
  if (!jobPincode) return 0;

  const rolling = new Set(rolling7IsoDates(params.from));
  const isoDate =
    typeof params.isoDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.isoDate)
      ? params.isoDate
      : null;

  const seen = new Set<string>();
  for (const row of params.broadcasts) {
    if (
      !workerCoversJobSite({
        workerPincode: row.basePincode,
        commuteRadiusKm: row.commuteRadiusKm,
        jobPincode,
      })
    ) {
      continue;
    }

    const dateOk = isoDate
      ? row.selectedDates.includes(isoDate)
      : row.selectedDates.some((day) => rolling.has(day));
    if (!dateOk) continue;

    seen.add(row.workerUserId.trim().toLowerCase());
  }

  return seen.size;
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PLANNER_DATES = 90;

export function countWorkersCoveringJobSiteByDates(params: {
  readonly broadcasts: readonly AvailabilityBroadcastRecord[];
  readonly jobPincode: string | null | undefined;
  readonly isoDates: readonly string[];
}): Record<string, number> {
  const dates = params.isoDates.filter((day) => ISO_RE.test(day)).slice(0, MAX_PLANNER_DATES);
  const counts: Record<string, number> = {};
  for (const day of dates) counts[day] = 0;

  const jobPincode = parsePincode(params.jobPincode);
  if (!jobPincode || dates.length === 0) return counts;

  const seenByDate = new Map<string, Set<string>>();
  for (const day of dates) seenByDate.set(day, new Set());

  for (const row of params.broadcasts) {
    if (
      !workerCoversJobSite({
        workerPincode: row.basePincode,
        commuteRadiusKm: row.commuteRadiusKm,
        jobPincode,
      })
    ) {
      continue;
    }
    const workerId = row.workerUserId.trim().toLowerCase();
    for (const day of dates) {
      if (!row.selectedDates.includes(day)) continue;
      seenByDate.get(day)?.add(workerId);
    }
  }

  for (const day of dates) {
    counts[day] = seenByDate.get(day)?.size ?? 0;
  }
  return counts;
}
