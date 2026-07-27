/** Batch favorite availability labels — one subscription for the whole list */

import { useRef, useSyncExternalStore, type ReactNode } from "react";
import { availabilityStorage } from "../../../../shared/shift/availability.reader";
import { FavoriteAvailabilityContext } from "./useFavoriteAvailabilityLabel";

const ALL_KEY = "wm_all_availability_broadcasts_v1";

function buildLabelMap(workerMlIds: readonly string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const workerMlId of workerMlIds) {
    const label = availabilityStorage.getAvailabilityDaysLabel(workerMlId);
    if (label) map.set(workerMlId, label);
  }
  return map;
}

type ProviderProps = {
  readonly workerMlIds: readonly string[];
  readonly children: ReactNode;
};

export function FavoriteAvailabilityProvider({ workerMlIds, children }: ProviderProps) {
  const cacheRef = useRef<{ key: string; map: Map<string, string> }>({
    key: "",
    map: new Map(),
  });

  const getSnapshot = () => {
    const availRaw = localStorage.getItem(ALL_KEY) ?? "";
    const key = `${workerMlIds.join("|")}::${availRaw}`;
    if (cacheRef.current.key === key) return cacheRef.current.map;
    const map = buildLabelMap(workerMlIds);
    cacheRef.current = { key, map };
    return map;
  };

  const labels = useSyncExternalStore(
    availabilityStorage.subscribe,
    getSnapshot,
    () => cacheRef.current.map,
  );

  return (
    <FavoriteAvailabilityContext.Provider value={labels}>
      {children}
    </FavoriteAvailabilityContext.Provider>
  );
}
