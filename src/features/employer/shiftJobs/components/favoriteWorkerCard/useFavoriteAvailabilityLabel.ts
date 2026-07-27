/** Favorite availability label reader — paired with FavoriteAvailabilityProvider */

import { createContext, useContext } from "react";

export type FavoriteAvailabilityLabelMap = ReadonlyMap<string, string>;

export const FavoriteAvailabilityContext = createContext<FavoriteAvailabilityLabelMap>(new Map());

export function useFavoriteAvailabilityLabel(workerMlId: string): string | null {
  return useContext(FavoriteAvailabilityContext).get(workerMlId) ?? null;
}
