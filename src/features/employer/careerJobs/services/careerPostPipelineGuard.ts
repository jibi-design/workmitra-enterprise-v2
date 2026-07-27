// App name: Job Mitra
// Pipeline mutate guard — active + paused (Wave 1 double-audit P0-2)

import type { CareerJobPost } from "../types/careerTypes";
import { getCareerPost } from "./careerPostService";

/** Posts that still allow shortlist / reject / reverse (not hire/offer/schedule). */
export function getPipelineMutableCareerPost(postId: string): CareerJobPost | null {
  const post = getCareerPost(postId);
  if (!post) return null;
  if (post.status === "active" || post.status === "paused") return post;
  return null;
}
