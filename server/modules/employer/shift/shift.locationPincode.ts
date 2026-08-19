/** Job Mitra API | Require 6-digit job-site pincode on live shift posts. */

import { parsePincode } from "../../location/pincode.js";

export function readLocationPincode(details: Record<string, unknown>): string | null {
  const fromDetails = parsePincode(
    typeof details.locationPincode === "string" ? details.locationPincode : null,
  );
  if (fromDetails) return fromDetails;
  return parsePincode(
    typeof details.location_pincode === "string" ? details.location_pincode : null,
  );
}

export function withLocationPincode(
  details: Record<string, unknown>,
  pincode: string,
): Record<string, unknown> {
  return { ...details, locationPincode: pincode };
}

export function missingLocationPincodeError(): {
  ok: false;
  code: "VALIDATION_ERROR";
  message: string;
  httpStatus: 400;
} {
  return {
    ok: false,
    code: "VALIDATION_ERROR",
    message: "locationPincode is required (6-digit job-site pincode)",
    httpStatus: 400,
  };
}
