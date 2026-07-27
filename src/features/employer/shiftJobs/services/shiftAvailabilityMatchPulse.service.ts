// App name: Job Mitra
// Platform Lock — enqueue date-match pulses for free workers when a shift is published.

import { shiftAvailabilityPulseQueueStorage } from "../../../shared/shift/shiftEmployeeBridge";
import { availabilityStorage } from "../../../shared/shift/availability.reader";
import { toDateStr } from "../helpers/shiftCreateHelpers";

/** Cap fan-out so a single publish cannot enqueue unbounded pulses (SC-4). */
export const MAX_NOTIFY_WORKERS = 200;

/** Blind match — worker Mitra Labs IDs only; never expose in employer create UI. */
export function enqueueAvailabilityMatchPulsesForShift(params: {
  postId: string;
  startAt: number;
  endAt: number;
}): number {
  const startIso = toDateStr(params.startAt);
  const endIso = toDateStr(params.endAt < params.startAt ? params.startAt : params.endAt);

  const matchedIds = new Set<string>();

  for (const workerMlId of availabilityStorage.getWorkerIdsFreeOnIsoDate(startIso)) {
    matchedIds.add(workerMlId);
    if (matchedIds.size >= MAX_NOTIFY_WORKERS) break;
  }

  if (endIso !== startIso && matchedIds.size < MAX_NOTIFY_WORKERS) {
    for (const workerMlId of availabilityStorage.getWorkerIdsFreeOnIsoDate(endIso)) {
      matchedIds.add(workerMlId);
      if (matchedIds.size >= MAX_NOTIFY_WORKERS) break;
    }
  }

  const ids = [...matchedIds].slice(0, MAX_NOTIFY_WORKERS);
  if (ids.length === 0) return 0;

  shiftAvailabilityPulseQueueStorage.enqueueForWorkers(ids, params.postId);
  return ids.length;
}
