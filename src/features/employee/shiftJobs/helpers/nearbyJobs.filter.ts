/** Job Mitra | Nearby shift filter — worker pincode + radius. Fail-closed. */

import { workerCoversJobSite } from "../../../shared/location/workerCoversJobSite";

export function filterPostsNearWorker<T extends { locationPincode?: string | null }>(params: {
  readonly posts: readonly T[];
  readonly workerPincode: string | null | undefined;
  readonly commuteRadiusKm: unknown;
}): T[] {
  return params.posts.filter((post) =>
    workerCoversJobSite({
      workerPincode: params.workerPincode,
      commuteRadiusKm: params.commuteRadiusKm,
      jobPincode: post.locationPincode,
    }),
  );
}
