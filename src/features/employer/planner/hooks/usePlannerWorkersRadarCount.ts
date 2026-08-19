/** Job Mitra | AUTH-on overlay for Planner per-day blind counts. */

import { useEffect, useState } from "react";
import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import {
  fetchWorkersRadarCount,
  fetchWorkersRadarCountsByDates,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { parsePincode } from "../../../shared/location/pincode";

export function usePlannerWorkersRadarCount(params: {
  locationPincode: string | null | undefined;
  isoDate?: string | null;
}): number {
  const pin = parsePincode(params.locationPincode);
  const enabled = AUTH_BACKEND_ENABLED && Boolean(pin);
  const key = `${pin ?? ""}|${params.isoDate ?? ""}`;
  const [fetched, setFetched] = useState<{ key: string; count: number } | null>(null);

  useEffect(() => {
    if (!enabled || !pin) return;
    const requested = key;
    let cancelled = false;
    void fetchWorkersRadarCount({ locationPincode: pin, isoDate: params.isoDate })
      .then((next) => {
        if (!cancelled) setFetched({ key: requested, count: next });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key: requested, count: 0 });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, key, pin, params.isoDate]);

  if (!enabled) return 0;
  return fetched?.key === key ? fetched.count : 0;
}

export function usePlannerWorkersRadarByDates(params: {
  locationPincode: string | null | undefined;
  isoDates: readonly string[];
}): { counts: Record<string, number>; usingServer: boolean } {
  const pin = parsePincode(params.locationPincode);
  const datesKey = params.isoDates.join(",");
  const enabled = AUTH_BACKEND_ENABLED && Boolean(pin) && Boolean(datesKey);
  const [fetched, setFetched] = useState<{
    key: string;
    counts: Record<string, number>;
  } | null>(null);
  const cacheKey = `${pin ?? ""}|${datesKey}`;

  useEffect(() => {
    if (!enabled || !pin) return;
    const requested = cacheKey;
    let cancelled = false;
    void fetchWorkersRadarCountsByDates({
      locationPincode: pin,
      isoDates: datesKey.split(","),
    })
      .then((next) => {
        if (!cancelled) setFetched({ key: requested, counts: next });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key: requested, counts: {} });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, pin, datesKey, cacheKey]);

  return {
    counts: enabled && fetched?.key === cacheKey ? fetched.counts : {},
    usingServer: AUTH_BACKEND_ENABLED,
  };
}
