/** Job Mitra | Home radar: server count when AUTH on, local snapshot when AUTH off. */

import { useSyncExternalStore } from "react";
import { parsePincode } from "../../../shared/location/pincode";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import {
  readLocalWorkersRadarMetricsSnapshot,
  subscribeLocalWorkersRadarMetrics,
} from "../helpers/localWorkersRadar.helpers";
import { useServerWorkersRadarCount } from "./useServerWorkersRadarCount";

export function useLocalWorkersRadarDisplay(): {
  totalAvailableCount: number;
  favoriteAvailableCount: number;
  usingServer: boolean;
} {
  const local = useSyncExternalStore(
    subscribeLocalWorkersRadarMetrics,
    readLocalWorkersRadarMetricsSnapshot,
    readLocalWorkersRadarMetricsSnapshot,
  );
  const pincode = parsePincode(employerSettingsStorage.get().locationPincode);
  const server = useServerWorkersRadarCount({
    locationPincode: pincode,
    refreshKey: `${pincode ?? ""}|${local.totalAvailableCount}|${local.favoriteAvailableCount}`,
  });

  return {
    totalAvailableCount: server.usingServer ? server.count : local.totalAvailableCount,
    favoriteAvailableCount: local.favoriteAvailableCount,
    usingServer: server.usingServer,
  };
}
