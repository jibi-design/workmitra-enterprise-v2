/** Client-facing re-export of availability/favorites API contracts */

export type {
  AvailabilityBroadcastDto,
  AvailabilityPublicListResponse,
  AvailabilityUpsertRequest,
  FavoriteListResponse,
  FavoriteUpsertRequest,
  FavoriteWorkerDto,
  IsoDate,
} from "../../../server/contracts/shiftAvailabilityFavorites.contracts";

export {
  AVAILABILITY_PATHS,
  FAVORITES_PATHS,
} from "../../../server/contracts/shiftAvailabilityFavorites.contracts";
