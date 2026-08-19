/** Job Mitra | Career nearby / radar / location-profile API. */

import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { apiService } from "../../../shared/services/apiService";
import { parsePincode } from "../../shared/location/pincode";
import { CAREER_LOCATION_PATHS } from "./careerLocation.paths";
import type { ApiEnvelope } from "./careerGateApi.types";
import { syncActorIdentityBridge } from "./careerGateApi.bridge";

export async function upsertCareerLocationProfile(params: {
  basePincode?: string;
  careerCommuteRadius: number;
}): Promise<void> {
  if (!AUTH_BACKEND_ENABLED) return;
  syncActorIdentityBridge("employee");
  await apiService.put(CAREER_LOCATION_PATHS.locationProfile, {
    basePincode: params.basePincode,
    careerCommuteRadius: params.careerCommuteRadius,
  });
}

export async function fetchCareerCandidatesRadarCount(
  locationPincode: string | null | undefined,
): Promise<number> {
  const pin = parsePincode(locationPincode);
  if (!pin || !AUTH_BACKEND_ENABLED) return 0;
  syncActorIdentityBridge("employer");
  const res = await apiService.get<ApiEnvelope<{ count?: unknown }>>(
    CAREER_LOCATION_PATHS.candidatesRadar,
    { locationPincode: pin },
  );
  const count = res.data?.count;
  if (typeof count !== "number" || !Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}

export async function fetchNearbyCareerJobIds(): Promise<string[]> {
  if (!AUTH_BACKEND_ENABLED) return [];
  syncActorIdentityBridge("employee");
  const res = await apiService.get<ApiEnvelope<{ posts?: unknown }>>(
    CAREER_LOCATION_PATHS.nearbyJobs,
  );
  const raw = res.data?.posts;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) =>
      row && typeof row === "object" && typeof (row as { id?: unknown }).id === "string"
        ? (row as { id: string }).id
        : "",
    )
    .filter(Boolean);
}
