/** Job Mitra | Recommended tab ranking without location text. */

import type { CareerDiscoveryTabId } from "./careerDiscoveryHelpers";
import { rankCareerPostsForRecommended } from "./careerNearby.rank";
import type { CareerSearchPost } from "./careerSearchTypes";

export function mapCareerIdsToPosts(ids: string[], posts: CareerSearchPost[]): CareerSearchPost[] {
  return ids
    .map((id) => posts.find((post) => post.id === id) ?? null)
    .filter((post): post is CareerSearchPost => post !== null);
}

export function selectCareerDiscoveryVisiblePosts(params: {
  readonly discovered: CareerSearchPost[];
  readonly filtered: CareerSearchPost[];
  readonly activeTab: CareerDiscoveryTabId;
  readonly query: string;
  readonly locationQuery: string;
  readonly nearbyIds: readonly string[];
  readonly workerPincode: string;
  readonly commuteRadiusKm: unknown;
}): CareerSearchPost[] {
  if (params.activeTab !== "best" || params.query.trim() || params.locationQuery.trim()) {
    return params.discovered;
  }
  if (!params.workerPincode.trim()) return params.discovered;
  return rankCareerPostsForRecommended({
    posts: params.filtered,
    workerPincode: params.workerPincode,
    commuteRadiusKm: params.commuteRadiusKm,
    nearbyIds: params.nearbyIds,
  });
}
