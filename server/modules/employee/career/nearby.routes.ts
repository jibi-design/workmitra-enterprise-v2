/** Job Mitra API | GET nearby Career jobs. */

import type { ServerResponse } from "node:http";
import { CAREER_LOCATION_PATHS } from "../../../contracts/careerLocation.contracts.js";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { envelope, sendJson } from "../../../utils/http.js";
import { listNearbyCareerJobsForEmployee } from "./nearbyJobs.service.js";

export async function handleCareerNearbyJobsRoute(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (method !== "GET" || url.pathname !== CAREER_LOCATION_PATHS.nearbyJobs) return false;
  const result = await listNearbyCareerJobsForEmployee(req.authenticatedUser);
  sendJson(res, 200, envelope({ posts: result.posts }, req.requestId));
  return true;
}
