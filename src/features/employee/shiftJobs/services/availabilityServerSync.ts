/** Job Mitra | Dual-write availability to API when auth backend is on. Local LS stays primary for AUTH-off. */

import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { apiService } from "../../../../shared/services/apiService";
import { AVAILABILITY_PATHS } from "../../../../shared/shift/availabilityFavorites.contracts";

type AvailabilitySyncPayload = {
  selectedDates: string[];
  city?: string;
  basePincode?: string;
  commuteRadius?: number;
};

export async function syncAvailabilityBroadcastToServerAsync(
  payload: AvailabilitySyncPayload,
): Promise<boolean> {
  if (!AUTH_BACKEND_ENABLED) return true;
  try {
    await apiService.put(AVAILABILITY_PATHS.mine, {
      selectedDates: payload.selectedDates,
      ...(payload.city !== undefined ? { city: payload.city } : {}),
      ...(payload.basePincode !== undefined ? { basePincode: payload.basePincode } : {}),
      ...(payload.commuteRadius !== undefined ? { commuteRadius: payload.commuteRadius } : {}),
    });
    return true;
  } catch {
    return false;
  }
}

export function syncAvailabilityBroadcastToServer(payload: AvailabilitySyncPayload): void {
  void syncAvailabilityBroadcastToServerAsync(payload);
}
