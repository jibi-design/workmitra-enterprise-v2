/** Job Mitra | Planner nearby filter. Shift commute engine. No location text. */

import { workerCoversJobSite } from "../../../shared/location/workerCoversJobSite";
import type { PlannerPublicIndexEntry } from "../../../shared/planner/plannerPublic";

export function filterPlannerEntriesNearWorker(params: {
  readonly entries: readonly PlannerPublicIndexEntry[];
  readonly workerPincode: string | null | undefined;
  readonly commuteRadiusKm: unknown;
}): PlannerPublicIndexEntry[] {
  return params.entries.filter((entry) =>
    workerCoversJobSite({
      workerPincode: params.workerPincode,
      commuteRadiusKm: params.commuteRadiusKm,
      jobPincode: entry.locationPincode,
    }),
  );
}
