/** Job Mitra API | Static pincode centroid lookup (town first, then 3-digit district). */

import { parsePincode } from "./pincode.js";
import { PINCODE_DISTRICT_CENTROIDS } from "./pincodeDistrictCentroids.js";
import { PINCODE_TOWN_CENTROIDS } from "./pincodeTownCentroids.js";

export type GeoPoint = {
  readonly lat: number;
  readonly lng: number;
};

export function getPincodeCentroid(raw: string | null | undefined): GeoPoint | null {
  const pincode = parsePincode(raw);
  if (!pincode) return null;

  const town = PINCODE_TOWN_CENTROIDS[pincode];
  if (town) return { lat: town[0], lng: town[1] };

  const district = PINCODE_DISTRICT_CENTROIDS[pincode.slice(0, 3)];
  if (district) return { lat: district[0], lng: district[1] };

  return null;
}
