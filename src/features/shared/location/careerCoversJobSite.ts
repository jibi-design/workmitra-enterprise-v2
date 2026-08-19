/** Job Mitra | Career work-area match. No dates. No GPS. */

import {
  careerRadiusToKm,
  parseCareerCommuteRadius,
} from "./careerCommuteRadius";
import { coversJobSiteByKm } from "./workerCoversJobSite";

export function careerWorkerCoversJobSite(params: {
  readonly workerPincode: string | null | undefined;
  readonly commuteRadiusKm: unknown;
  readonly jobPincode: string | null | undefined;
}): boolean {
  return coversJobSiteByKm({
    workerPincode: params.workerPincode,
    jobPincode: params.jobPincode,
    radiusKm: careerRadiusToKm(parseCareerCommuteRadius(params.commuteRadiusKm)),
  });
}
