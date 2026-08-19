/** Job Mitra API | Blind Career candidate count. No names. No dates. */

import { careerWorkerCoversJobSite } from "../location/careerCoversJobSite.js";
import { parsePincode } from "../location/pincode.js";

export function countCandidatesCoveringJobSite(params: {
  readonly profiles: readonly {
    readonly userId: string;
    readonly basePincode: string | null;
    readonly careerCommuteRadiusKm: unknown;
  }[];
  readonly jobPincode: string | null | undefined;
}): number {
  const jobPincode = parsePincode(params.jobPincode);
  if (!jobPincode) return 0;

  const seen = new Set<string>();
  for (const row of params.profiles) {
    if (
      !careerWorkerCoversJobSite({
        workerPincode: row.basePincode,
        commuteRadiusKm: row.careerCommuteRadiusKm,
        jobPincode,
      })
    ) {
      continue;
    }
    const id = row.userId.trim().toLowerCase();
    if (id) seen.add(id);
  }
  return seen.size;
}
