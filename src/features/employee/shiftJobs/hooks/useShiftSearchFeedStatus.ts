/**
 * Job Mitra | useShiftSearchFeedStatus.ts
 * Loading / Error / Ready feed phase for Shift Search 4-state UI.
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import {
  refreshShiftSearchFeed,
  type ShiftSearchFeedStatus,
} from "../services/shiftSearchFeed.service";
import { invalidateNearbyShiftHydrateCooldown } from "../services/nearbyJobs.hydrate";
import { getShiftSearchPostsSnapshot } from "../storage/shiftSearch.storage";

export function useShiftSearchFeedStatus() {
  const [feedStatus, setFeedStatus] = useState<ShiftSearchFeedStatus>("loading");
  const [feedErrorMessage, setFeedErrorMessage] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const locationKey = useSyncExternalStore(
    employeeProfileStorage.subscribe,
    () => {
      const profile = employeeProfileStorage.get();
      return `${profile.basePincode}|${profile.commuteRadius}`;
    },
    () => "",
  );

  useEffect(() => {
    let cancelled = false;
    invalidateNearbyShiftHydrateCooldown();

    void (async () => {
      const result = await refreshShiftSearchFeed();
      if (cancelled) return;

      if (result.ok) {
        setFeedStatus("ready");
        setFeedErrorMessage("");
        return;
      }

      // Stale LS cache can still serve Active/Empty when refresh fails.
      if (getShiftSearchPostsSnapshot().length > 0) {
        setFeedStatus("ready");
        setFeedErrorMessage("");
        return;
      }

      setFeedErrorMessage(result.message);
      setFeedStatus("error");
    })();

    return () => {
      cancelled = true;
    };
  }, [retryToken, locationKey]);

  const retryFeed = useCallback(() => {
    setFeedErrorMessage("");
    setFeedStatus("loading");
    setRetryToken((value) => value + 1);
  }, []);

  return {
    feedStatus,
    feedErrorMessage,
    retryFeed,
  };
}
