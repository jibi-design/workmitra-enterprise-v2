/** Job Mitra API | Availability broadcast row (no phone / names in public payloads). */

import type { CommuteRadiusKm } from "../location/commuteRadius.js";

export type AvailabilityBroadcastRecord = {
  workerUserId: string;
  workerMlId: string;
  selectedDates: string[];
  basePincode: string | null;
  commuteRadiusKm: CommuteRadiusKm;
  city?: string;
  expiresAt: number;
  updatedAt: number;
};

export type AvailabilityMineDto = {
  workerMlId: string;
  selectedDates: string[];
  city?: string;
  basePincode: string | null;
  commuteRadius: CommuteRadiusKm;
  updatedAt: number;
};

export type AvailabilityPublicItem = {
  workerMlId: string;
  freeDayCount: number;
  cityHash?: string;
};
