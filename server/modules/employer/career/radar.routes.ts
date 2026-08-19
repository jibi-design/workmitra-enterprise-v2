/** Job Mitra API | Blind Career candidates radar — count only. */

import type { ServerResponse } from "node:http";
import { CAREER_LOCATION_PATHS } from "../../../contracts/careerLocation.contracts.js";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { envelope, sendJson } from "../../../utils/http.js";
import { parsePincode } from "../../location/pincode.js";
import { countCareerCandidatesRadar } from "./candidatesRadar.service.js";

export async function handleCareerCandidatesRadarRoute(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (method !== "GET" || url.pathname !== CAREER_LOCATION_PATHS.candidatesRadar) return false;
  const locationPincode = parsePincode(url.searchParams.get("locationPincode"));
  const result = await countCareerCandidatesRadar(locationPincode);
  sendJson(res, 200, envelope({ count: result.count }, req.requestId));
  return true;
}
