/** Job Mitra API | Filter published posts by worker commute coverage. Fail-closed. */

import { workerCoversJobSite } from "../location/workerCoversJobSite.js";
import { parsePincode } from "../location/pincode.js";
import type { ShiftPostRow } from "./types.js";

function jobPincodeOf(post: ShiftPostRow): string | null {
  const fromColumn = parsePincode(post.location_pincode);
  if (fromColumn) return fromColumn;
  const details = post.details;
  if (!details || typeof details !== "object") return null;
  const raw = details.locationPincode;
  return parsePincode(typeof raw === "string" ? raw : null);
}

export function filterNearbyPublishedPosts(params: {
  readonly posts: readonly ShiftPostRow[];
  readonly workerPincode: string | null | undefined;
  readonly commuteRadiusKm: unknown;
}): ShiftPostRow[] {
  const workerPincode = parsePincode(params.workerPincode);
  if (!workerPincode) return [];

  return params.posts.filter((post) => {
    if (post.status !== "active") return false;
    return workerCoversJobSite({
      workerPincode,
      commuteRadiusKm: params.commuteRadiusKm,
      jobPincode: jobPincodeOf(post),
    });
  });
}
