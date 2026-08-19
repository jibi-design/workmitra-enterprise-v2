/** Job Mitra API | Employee nearby Career jobs. Empty without work area code. */

import { isDbAuthEnabled } from "../../auth/env.js";
import type { AuthUser } from "../../auth/types.js";
import {
  filterNearbyCareerPosts,
  type NearbyCareerPostDto,
} from "../../career/nearbyJobs.match.js";
import { careerLocationRepository } from "../../location/careerLocation.repository.js";
import { employeeCareerRepository } from "./career.repository.js";

export async function listNearbyCareerJobsForEmployee(
  employee: AuthUser,
): Promise<{ ok: true; posts: NearbyCareerPostDto[] }> {
  if (!isDbAuthEnabled()) return { ok: true, posts: [] };

  let profile: Awaited<ReturnType<typeof careerLocationRepository.get>> = null;
  try {
    profile = await careerLocationRepository.get(employee.id);
  } catch {
    return { ok: true, posts: [] };
  }
  if (!profile?.basePincode) return { ok: true, posts: [] };

  let posts: Awaited<ReturnType<typeof employeeCareerRepository.listPublishedPosts>> = [];
  try {
    posts = await employeeCareerRepository.listPublishedPosts();
  } catch {
    return { ok: true, posts: [] };
  }

  return {
    ok: true,
    posts: filterNearbyCareerPosts({
      posts,
      workerPincode: profile.basePincode,
      commuteRadiusKm: profile.careerCommuteRadiusKm,
    }),
  };
}
