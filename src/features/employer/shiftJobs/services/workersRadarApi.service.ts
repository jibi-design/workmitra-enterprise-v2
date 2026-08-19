/** Job Mitra | Blind workers-radar API. Count only. AUTH on. */

import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { apiService } from "../../../../shared/services/apiService";
import { AVAILABILITY_PATHS } from "../../../../shared/shift/availabilityFavorites.contracts";
import { parsePincode } from "../../../shared/location/pincode";

type ApiEnvelope = { data?: { count?: unknown } };

export function parseWorkersRadarCount(payload: unknown): number {
  if (typeof payload !== "object" || payload === null) return 0;
  const data = (payload as ApiEnvelope).data;
  const count = data && typeof data === "object" ? (data as { count?: unknown }).count : undefined;
  if (typeof count !== "number" || !Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}

export async function fetchWorkersRadarCount(params: {
  locationPincode: string | null | undefined;
  isoDate?: string | null;
}): Promise<number> {
  const locationPincode = parsePincode(params.locationPincode);
  if (!locationPincode) return 0;
  if (!AUTH_BACKEND_ENABLED) return 0;

  const query: Record<string, string> = { locationPincode };
  if (params.isoDate && /^\d{4}-\d{2}-\d{2}$/.test(params.isoDate)) {
    query.isoDate = params.isoDate;
  }

  const res = await apiService.get<ApiEnvelope>(AVAILABILITY_PATHS.workersRadar, query);
  return parseWorkersRadarCount(res);
}

export async function fetchWorkersRadarCountsByDates(params: {
  locationPincode: string | null | undefined;
  isoDates: readonly string[];
}): Promise<Record<string, number>> {
  const locationPincode = parsePincode(params.locationPincode);
  if (!locationPincode || !AUTH_BACKEND_ENABLED) return {};
  const isoDates = params.isoDates.filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)).slice(0, 90);
  if (isoDates.length === 0) return {};

  const res = await apiService.get<{ data?: { counts?: unknown } }>(AVAILABILITY_PATHS.workersRadar, {
    locationPincode,
    isoDates: isoDates.join(","),
  });
  const counts = res.data?.counts;
  if (!counts || typeof counts !== "object" || Array.isArray(counts)) return {};
  const out: Record<string, number> = {};
  for (const [day, value] of Object.entries(counts as Record<string, unknown>)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      out[day] = Math.max(0, Math.floor(value));
    }
  }
  return out;
}
