// App name: Job Mitra
// Platform Lock — enqueue date-match pulses for free workers when a shift is published.

import { shiftAvailabilityPulseQueueStorage } from "../../../employee/shiftJobs/storage/shiftAvailabilityPulseQueue.storage";
import { availabilityStorage } from "../../../employee/shiftJobs/storage/availabilityStorage";
import { toDateStr } from "../helpers/shiftCreateHelpers";

/** Blind match — worker WM IDs only; never expose in employer create UI. */
export function enqueueAvailabilityMatchPulsesForShift(params: {
  postId: string;
  startAt: number;
  endAt: number;
}): number {
  const startIso = toDateStr(params.startAt);
  const endIso = toDateStr(params.endAt < params.startAt ? params.startAt : params.endAt);

  const matchedIds = new Set<string>();

  for (const workerWmId of availabilityStorage.getWorkerIdsFreeOnIsoDate(startIso)) {
    matchedIds.add(workerWmId);
  }

  if (endIso !== startIso) {
    for (const workerWmId of availabilityStorage.getWorkerIdsFreeOnIsoDate(endIso)) {
      matchedIds.add(workerWmId);
    }
  }

  const ids = [...matchedIds];
  if (ids.length === 0) return 0;

  shiftAvailabilityPulseQueueStorage.enqueueForWorkers(ids, params.postId);
  return ids.length;
}
