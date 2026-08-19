/** Job Mitra | Fetch nearby shift posts when AUTH backend is on. */

import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { apiService } from "../../../../shared/services/apiService";
import { AVAILABILITY_PATHS } from "../../../../shared/shift/availabilityFavorites.contracts";
import { isShiftApiSyncEnabled } from "../../../shift/services/shiftGateApi.service";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { mapNearbyServerPost } from "../helpers/nearbyJobs.map";
import { availabilityStorage } from "../storage/availabilityStorage";
import { replaceShiftSearchPosts } from "../storage/shiftSearch.nearbyWrite";
import { syncAvailabilityBroadcastToServerAsync } from "./availabilityServerSync";

type ApiEnvelope = { data?: { posts?: unknown } };

let hydrateInFlight: Promise<void> | null = null;
let lastHydrate = 0;
const COOLDOWN = 3_000;

export async function hydrateNearbyShiftPostsFromServer(): Promise<boolean> {
  if (!AUTH_BACKEND_ENABLED || !isShiftApiSyncEnabled()) return true;
  const now = Date.now();
  if (hydrateInFlight) {
    await hydrateInFlight;
    return true;
  }
  if (now - lastHydrate < COOLDOWN) return true;

  let ok = true;
  hydrateInFlight = (async () => {
    try {
      const profile = employeeProfileStorage.get();
      const pin = profile.basePincode.trim();
      if (pin) {
        await syncAvailabilityBroadcastToServerAsync({
          selectedDates: availabilityStorage.getMySelectedDates(),
          city: profile.city.trim() || undefined,
          basePincode: pin,
          commuteRadius: profile.commuteRadius,
        });
      }
      const res = await apiService.get<ApiEnvelope>(AVAILABILITY_PATHS.nearbyPosts);
      const raw = Array.isArray(res.data?.posts) ? res.data.posts : [];
      const posts = raw.map(mapNearbyServerPost).filter((row) => row !== null);
      replaceShiftSearchPosts(posts);
      lastHydrate = Date.now();
    } catch {
      ok = false;
    } finally {
      hydrateInFlight = null;
    }
  })();
  await hydrateInFlight;
  return ok;
}

export function invalidateNearbyShiftHydrateCooldown(): void {
  lastHydrate = 0;
}
