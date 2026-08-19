/** Availability + Favorites API TypeScript contracts (production-grade) */

export type IsoDate = string; // YYYY-MM-DD

export type AvailabilityBroadcastDto = {
  workerMlId: string;
  selectedDates: IsoDate[];
  city?: string;
  basePincode?: string | null;
  commuteRadius?: 0 | 5 | 10 | 15;
  updatedAt: number;
};

export type AvailabilityUpsertRequest = {
  selectedDates: IsoDate[];
  city?: string;
  basePincode?: string | null;
  commuteRadius?: 0 | 5 | 10 | 15;
};

export type AvailabilityPublicListResponse = {
  items: Array<{
    workerMlId: string;
    /** Count only — never names/phones in public list */
    freeDayCount: number;
    cityHash?: string;
  }>;
  generatedAt: number;
};

export type FavoriteWorkerDto = {
  id: string;
  workerMlId: string;
  displayName: string;
  notes?: string;
  addedVia: "hire_again_rating" | "manual";
  createdAt: number;
};

export type FavoriteUpsertRequest = {
  workerMlId: string;
  notes?: string;
};

export type FavoriteListResponse = {
  items: FavoriteWorkerDto[];
};

export const AVAILABILITY_PATHS = {
  mine: "/v1/jobmitra/employee/shift/availability",
  publicPool: "/v1/jobmitra/employer/shift/availability-pool",
  workersRadar: "/v1/jobmitra/employer/shift/workers-radar",
  nearbyPosts: "/v1/jobmitra/employee/shift/nearby-posts",
} as const;

export const WORKERS_RADAR_PATH = AVAILABILITY_PATHS.workersRadar;

export const FAVORITES_PATHS = {
  list: "/v1/jobmitra/employer/shift/favorites",
  item: "/v1/jobmitra/employer/shift/favorites/:workerMlId",
} as const;
