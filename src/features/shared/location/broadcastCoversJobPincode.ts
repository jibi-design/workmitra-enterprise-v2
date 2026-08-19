/** Job Mitra | Broadcast vs job-site pincode match. Fail-closed. No GPS. */

import { workerCoversJobSite } from "./workerCoversJobSite";

export type LocationMatchBroadcast = {
  readonly basePincode?: string | null;
  readonly commuteRadius?: unknown;
};

export function broadcastCoversJobPincode(
  broadcast: LocationMatchBroadcast,
  jobPincode: string | null | undefined,
): boolean {
  return workerCoversJobSite({
    workerPincode: broadcast.basePincode,
    commuteRadiusKm: broadcast.commuteRadius,
    jobPincode,
  });
}
