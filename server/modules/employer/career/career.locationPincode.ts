/** Job Mitra API | Require work area code on Career posts. No dates. */

import { parsePincode } from "../../location/pincode.js";

export function readCareerLocationPincode(
  details: Record<string, unknown>,
  body?: Record<string, unknown>,
): string | null {
  const fromBody = parsePincode(
    typeof body?.locationPincode === "string" ? body.locationPincode : null,
  );
  if (fromBody) return fromBody;
  const fromDetails = parsePincode(
    typeof details.locationPincode === "string" ? details.locationPincode : null,
  );
  if (fromDetails) return fromDetails;
  return parsePincode(
    typeof details.location_pincode === "string" ? details.location_pincode : null,
  );
}

export function withCareerLocationPincode(
  details: Record<string, unknown>,
  locationPincode: string,
): Record<string, unknown> {
  return { ...details, locationPincode };
}

export function resolveCareerPostLocation(
  body: Record<string, unknown>,
  details: Record<string, unknown>,
):
  | { ok: true; locationPincode: string; details: Record<string, unknown> }
  | { ok: false; code: "VALIDATION_ERROR"; message: string; httpStatus: 400 } {
  const locationPincode = readCareerLocationPincode(details, body);
  if (!locationPincode) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Work area code is required.",
      httpStatus: 400,
    };
  }
  return {
    ok: true,
    locationPincode,
    details: withCareerLocationPincode(details, locationPincode),
  };
}
