/** Job Mitra | Hydrate nearby Career ids when AUTH is on. */

import { fetchNearbyCareerJobIds } from "../../../career/services/careerLocationApi";
import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { setNearbyCareerIds } from "./careerNearby.cache";

let inFlight: Promise<void> | null = null;

export async function hydrateNearbyCareerIdsFromServer(): Promise<void> {
  if (!AUTH_BACKEND_ENABLED) return;
  if (inFlight) {
    await inFlight;
    return;
  }
  inFlight = (async () => {
    try {
      const ids = await fetchNearbyCareerJobIds();
      setNearbyCareerIds(ids);
    } catch {
      setNearbyCareerIds([]);
    } finally {
      inFlight = null;
    }
  })();
  await inFlight;
}
