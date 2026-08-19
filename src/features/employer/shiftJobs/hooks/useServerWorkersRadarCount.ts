/** Job Mitra | Server overlay for blind radar counts. AUTH-off stays local. */

import { useEffect, useState } from "react";
import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { parsePincode } from "../../../shared/location/pincode";
import { fetchWorkersRadarCount } from "../services/workersRadarApi.service";

export function useServerWorkersRadarCount(params: {
  locationPincode: string | null | undefined;
  isoDate?: string | null;
  refreshKey: string;
}): { count: number; usingServer: boolean } {
  const pincode = parsePincode(params.locationPincode);
  const enabled = AUTH_BACKEND_ENABLED && Boolean(pincode);
  const key = `${pincode ?? ""}|${params.isoDate ?? ""}|${params.refreshKey}`;
  const [fetched, setFetched] = useState<{ key: string; count: number } | null>(null);

  useEffect(() => {
    if (!enabled || !pincode) return;

    const requested = key;
    let cancelled = false;
    const load = () => {
      void fetchWorkersRadarCount({
        locationPincode: pincode,
        isoDate: params.isoDate,
      })
        .then((count) => {
          if (!cancelled) setFetched({ key: requested, count });
        })
        .catch(() => {
          if (!cancelled) setFetched({ key: requested, count: 0 });
        });
    };

    load();
    const timer = window.setInterval(load, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, pincode, params.isoDate, params.refreshKey, key]);

  return {
    usingServer: AUTH_BACKEND_ENABLED,
    count: enabled && fetched?.key === key ? fetched.count : 0,
  };
}
