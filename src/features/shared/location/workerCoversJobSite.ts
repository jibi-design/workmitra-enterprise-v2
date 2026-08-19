/** Job Mitra | Worker commute radius covers job-site pincode. No live GPS. */

import { parseCommuteRadius } from "./commuteRadius";
import { parsePincode } from "./pincode";
import { getPincodeCentroid } from "./pincodeCentroidLookup";

const EARTH_KM = 6371;
const MATCH_EPSILON_KM = 0.05;

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineKm(
  a: { readonly lat: number; readonly lng: number },
  b: { readonly lat: number; readonly lng: number },
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function coversJobSiteByKm(params: {
  readonly workerPincode: string | null | undefined;
  readonly jobPincode: string | null | undefined;
  readonly radiusKm: number;
}): boolean {
  const workerPincode = parsePincode(params.workerPincode);
  const jobPincode = parsePincode(params.jobPincode);
  if (!workerPincode || !jobPincode) return false;
  if (workerPincode === jobPincode) return true;
  if (!Number.isFinite(params.radiusKm)) return true;
  if (params.radiusKm <= 0) return false;

  const workerPoint = getPincodeCentroid(workerPincode);
  const jobPoint = getPincodeCentroid(jobPincode);
  if (!workerPoint || !jobPoint) return false;

  return haversineKm(workerPoint, jobPoint) <= params.radiusKm + MATCH_EPSILON_KM;
}

export function distanceKmBetweenWorkAreas(
  workerPincode: string | null | undefined,
  jobPincode: string | null | undefined,
): number | null {
  const worker = parsePincode(workerPincode);
  const job = parsePincode(jobPincode);
  if (!worker || !job) return null;
  if (worker === job) return 0;
  const workerPoint = getPincodeCentroid(worker);
  const jobPoint = getPincodeCentroid(job);
  if (!workerPoint || !jobPoint) return null;
  return haversineKm(workerPoint, jobPoint);
}

export function workerCoversJobSite(params: {
  readonly workerPincode: string | null | undefined;
  readonly commuteRadiusKm: unknown;
  readonly jobPincode: string | null | undefined;
}): boolean {
  return coversJobSiteByKm({
    workerPincode: params.workerPincode,
    jobPincode: params.jobPincode,
    radiusKm: parseCommuteRadius(params.commuteRadiusKm),
  });
}
