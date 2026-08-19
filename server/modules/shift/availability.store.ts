/** Job Mitra API | In-memory availability + location profile (AUTH_USER_SOURCE=memory). */

import type { CommuteRadiusKm } from "../location/commuteRadius.js";
import type { AvailabilityBroadcastRecord } from "./availability.types.js";

const broadcasts = new Map<string, AvailabilityBroadcastRecord>();
const locations = new Map<
  string,
  { basePincode: string | null; commuteRadiusKm: CommuteRadiusKm; updatedAt: number }
>();

function keyOf(id: string): string {
  return id.trim().toLowerCase();
}

export const availabilityMemoryStore = {
  reset(): void {
    broadcasts.clear();
    locations.clear();
  },

  putBroadcast(row: AvailabilityBroadcastRecord): AvailabilityBroadcastRecord {
    broadcasts.set(keyOf(row.workerUserId), row);
    return row;
  },

  getBroadcast(workerUserId: string): AvailabilityBroadcastRecord | null {
    return broadcasts.get(keyOf(workerUserId)) ?? null;
  },

  deleteBroadcast(workerUserId: string): void {
    broadcasts.delete(keyOf(workerUserId));
  },

  listBroadcasts(): AvailabilityBroadcastRecord[] {
    return [...broadcasts.values()];
  },

  putLocation(
    userId: string,
    basePincode: string | null,
    commuteRadiusKm: CommuteRadiusKm,
  ): void {
    locations.set(keyOf(userId), {
      basePincode,
      commuteRadiusKm,
      updatedAt: Date.now(),
    });
  },

  getLocation(userId: string): {
    basePincode: string | null;
    commuteRadiusKm: CommuteRadiusKm;
    updatedAt: number;
  } | null {
    return locations.get(keyOf(userId)) ?? null;
  },
};
