/** Job Mitra API | Career nearby filter + distance sort. No dates. No codes in DTO. */

import { careerWorkerCoversJobSite } from "../location/careerCoversJobSite.js";
import { parsePincode } from "../location/pincode.js";
import { distanceKmBetweenWorkAreas } from "../location/workerCoversJobSite.js";
import type { CareerPostRow } from "./types.js";

export type NearbyCareerPostDto = {
  id: string;
  employer_user_id: string;
  title: string;
  description: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  distanceKm: number | null;
};

export function jobWorkAreaCodeOf(post: CareerPostRow): string | null {
  const fromColumn = parsePincode(post.location_pincode);
  if (fromColumn) return fromColumn;
  const details = post.details;
  if (!details || typeof details !== "object") return null;
  const raw = details.locationPincode;
  return parsePincode(typeof raw === "string" ? raw : null);
}

export function toPublicNearbyCareerPost(
  post: CareerPostRow,
  workerPincode: string,
): NearbyCareerPostDto {
  return {
    id: post.id,
    employer_user_id: post.employer_user_id,
    title: post.title,
    description: post.description,
    status: post.status,
    created_at: post.created_at,
    updated_at: post.updated_at,
    distanceKm: distanceKmBetweenWorkAreas(workerPincode, jobWorkAreaCodeOf(post)),
  };
}

export function filterNearbyCareerPosts(params: {
  readonly posts: readonly CareerPostRow[];
  readonly workerPincode: string | null | undefined;
  readonly commuteRadiusKm: unknown;
}): NearbyCareerPostDto[] {
  const workerPincode = parsePincode(params.workerPincode);
  if (!workerPincode) return [];

  const matched = params.posts.filter((post) => {
    if (post.status !== "published") return false;
    return careerWorkerCoversJobSite({
      workerPincode,
      commuteRadiusKm: params.commuteRadiusKm,
      jobPincode: jobWorkAreaCodeOf(post),
    });
  });

  const publicPosts = matched.map((post) => toPublicNearbyCareerPost(post, workerPincode));
  publicPosts.sort((a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) return 0;
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });
  return publicPosts;
}
