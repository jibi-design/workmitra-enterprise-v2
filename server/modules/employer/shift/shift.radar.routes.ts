/** Job Mitra API | Blind Local Workers Radar — count only, fail-closed. */

import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { envelope, sendJson } from "../../../utils/http.js";
import { parsePincode } from "../../location/pincode.js";
import { availabilityService } from "../../shift/availability.service.js";
import { WORKERS_RADAR_PATH } from "../../../contracts/shiftAvailabilityFavorites.contracts.js";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function handleWorkersRadarRoute(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (method !== "GET" || url.pathname !== WORKERS_RADAR_PATH) return false;

  const locationPincode = parsePincode(url.searchParams.get("locationPincode"));
  const isoRaw = url.searchParams.get("isoDate");
  const isoDate = isoRaw && ISO_RE.test(isoRaw) ? isoRaw : null;
  const isoDatesRaw = url.searchParams.get("isoDates");

  if (isoDatesRaw) {
    const isoDates = isoDatesRaw
      .split(",")
      .map((day) => day.trim())
      .filter((day) => ISO_RE.test(day))
      .slice(0, 90);
    const result = await availabilityService.countWorkersRadarByDates(locationPincode, isoDates);
    sendJson(res, 200, envelope({ counts: result.counts }, req.requestId));
    return true;
  }

  const result = await availabilityService.countWorkersRadar(locationPincode, isoDate);
  sendJson(res, 200, envelope({ count: result.count }, req.requestId));
  return true;
}
