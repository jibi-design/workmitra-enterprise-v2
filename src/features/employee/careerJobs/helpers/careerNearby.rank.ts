/** Job Mitra | Rank Career recommended feed by commute. No location text on cards. */

import { careerWorkerCoversJobSite } from "../../../shared/location/careerCoversJobSite";
import { parsePincode } from "../../../shared/location/pincode";
import { distanceKmBetweenWorkAreas } from "../../../shared/location/workerCoversJobSite";
import type { CareerSearchPost } from "./careerSearchTypes";

export function rankCareerPostsForRecommended(params: {
  readonly posts: readonly CareerSearchPost[];
  readonly workerPincode: string | null | undefined;
  readonly commuteRadiusKm: unknown;
  readonly nearbyIds?: readonly string[];
}): CareerSearchPost[] {
  const nearbyIds = params.nearbyIds ?? [];
  if (nearbyIds.length > 0) {
    const byId = new Map(params.posts.map((post) => [post.id, post]));
    return nearbyIds
      .map((id) => byId.get(id) ?? null)
      .filter((post): post is CareerSearchPost => post !== null);
  }

  const workerPincode = parsePincode(params.workerPincode);
  if (!workerPincode) return [...params.posts];

  const openArea = params.posts.filter((post) => !parsePincode(post.locationPincode));
  const matched = params.posts.filter((post) =>
    Boolean(parsePincode(post.locationPincode)) &&
    careerWorkerCoversJobSite({
      workerPincode,
      commuteRadiusKm: params.commuteRadiusKm,
      jobPincode: post.locationPincode,
    }),
  );

  return [...matched, ...openArea].sort((a, b) => {
    const da = distanceKmBetweenWorkAreas(workerPincode, a.locationPincode);
    const db = distanceKmBetweenWorkAreas(workerPincode, b.locationPincode);
    if (da == null && db == null) return 0;
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });
}
