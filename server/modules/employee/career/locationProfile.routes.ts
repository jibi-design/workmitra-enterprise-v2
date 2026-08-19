/** Job Mitra API | PUT employee Career work-area profile. No dates. */

import type { ServerResponse } from "node:http";
import { CAREER_LOCATION_PATHS } from "../../../contracts/careerLocation.contracts.js";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { envelope, readJsonBody, sendJson } from "../../../utils/http.js";
import { parseCareerCommuteRadius } from "../../location/careerCommuteRadius.js";
import { careerLocationRepository } from "../../location/careerLocation.repository.js";
import { parsePincode } from "../../location/pincode.js";

export async function handleCareerLocationProfileRoute(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (url.pathname !== CAREER_LOCATION_PATHS.locationProfile) return false;
  if (method !== "PUT") return false;

  const body = await readJsonBody(req);
  if (body === null) {
    sendJson(res, 413, {
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body too large",
        requestId: req.requestId,
      },
    });
    return true;
  }

  const basePincode = parsePincode(typeof body.basePincode === "string" ? body.basePincode : null);
  const careerCommuteRadius = parseCareerCommuteRadius(body.careerCommuteRadius);

  try {
    await careerLocationRepository.upsert(
      req.authenticatedUser.id,
      basePincode,
      careerCommuteRadius,
    );
  } catch {
    sendJson(res, 500, {
      error: { code: "DB_ERROR", message: "Could not save work area", requestId: req.requestId },
    });
    return true;
  }

  sendJson(res, 200, envelope({ basePincode, careerCommuteRadius }, req.requestId));
  return true;
}
