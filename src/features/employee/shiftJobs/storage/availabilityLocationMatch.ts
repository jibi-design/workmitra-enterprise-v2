/** Job Mitra | Date + pincode availability counts. Fail-closed. No identities. */

import { broadcastCoversJobPincode } from "../../../shared/location/broadcastCoversJobPincode";
import { getAllActiveFromStorage } from "./availabilityStorage.helpers";

export function getWorkerIdsFreeOnIsoDateNear(
  iso: string,
  jobPincode: string | null | undefined,
): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return [];

  const seen = new Set<string>();
  const output: string[] = [];

  for (const broadcast of getAllActiveFromStorage()) {
    if (!broadcast.selectedDates.includes(iso)) continue;
    if (!broadcastCoversJobPincode(broadcast, jobPincode)) continue;
    const workerKey = broadcast.workerMlId.trim().toUpperCase();
    if (seen.has(workerKey)) continue;
    seen.add(workerKey);
    output.push(broadcast.workerMlId);
  }

  return output;
}

export function countWorkersFreeOnIsoDateNear(
  iso: string,
  jobPincode: string | null | undefined,
): number {
  return getWorkerIdsFreeOnIsoDateNear(iso, jobPincode).length;
}
