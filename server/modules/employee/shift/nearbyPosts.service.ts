/** Job Mitra API | Employee nearby shift posts. Empty when base pincode missing. */

import { isDbAuthEnabled } from "../../auth/env.js";
import type { AuthUser } from "../../auth/types.js";
import type { ShiftPostRow } from "../../shift/types.js";
import { availabilityService } from "../../shift/availability.service.js";
import { filterNearbyPublishedPosts } from "../../shift/nearbyPosts.match.js";
import { listActivePublishedPosts } from "../../employer/shift/shift.posts.public.repository.js";

export type NearbyPostsResult = { ok: true; posts: ShiftPostRow[] };

export async function listNearbyPostsForEmployee(employee: AuthUser): Promise<NearbyPostsResult> {
  const mine = await availabilityService.getMine(employee);
  if (!mine.basePincode) {
    return { ok: true, posts: [] };
  }

  let posts: ShiftPostRow[] = [];
  if (isDbAuthEnabled()) {
    try {
      posts = await listActivePublishedPosts();
    } catch {
      posts = [];
    }
  }

  return {
    ok: true,
    posts: filterNearbyPublishedPosts({
      posts,
      workerPincode: mine.basePincode,
      commuteRadiusKm: mine.commuteRadius,
    }),
  };
}
