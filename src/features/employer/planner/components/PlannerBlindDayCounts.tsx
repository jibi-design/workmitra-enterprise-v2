/** Job Mitra | Per-slot-date blind worker counts. No codes shown. */

import { useRef, useSyncExternalStore } from "react";
import { availabilityStorage } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { fmtPlanDate } from "../helpers/plannerDateFormat.helpers";
import type { DaySlot } from "../storage/demandPlannerStorage";
import { usePlannerWorkersRadarByDates } from "../hooks/usePlannerWorkersRadarCount";

type Props = {
  slots: DaySlot[];
  locationPincode: string;
};

export function PlannerBlindDayCounts({ slots, locationPincode }: Props) {
  const dates = slots.map((slot) => slot.date);
  const cacheRef = useRef({ key: "", counts: {} as Record<string, number> });
  const localMap = useSyncExternalStore(
    availabilityStorage.subscribe,
    () => {
      const key = `${locationPincode}|${dates.join(",")}|${availabilityStorage.getAllActive().length}`;
      if (cacheRef.current.key === key) return cacheRef.current.counts;
      const next: Record<string, number> = {};
      for (const slot of slots) {
        next[slot.date] = availabilityStorage.countWorkersFreeOnIsoDateNear(
          slot.date,
          locationPincode,
        );
      }
      cacheRef.current = { key, counts: next };
      return next;
    },
    () => cacheRef.current.counts,
  );
  const server = usePlannerWorkersRadarByDates({
    locationPincode,
    isoDates: dates,
  });
  const counts = server.usingServer ? server.counts : localMap;

  if (slots.length === 0) return null;

  return (
    <div className="wm-planner-blindDays" role="status" aria-live="polite">
      <div className="wm-planner-blindDays__title">Workers in range by date</div>
      <ul className="wm-planner-blindDays__list">
        {slots.map((slot) => {
          const count = counts[slot.date] ?? 0;
          return (
            <li key={slot.date} className="wm-planner-blindDays__row">
              <span>{fmtPlanDate(slot.date)}</span>
              <strong>{count}</strong>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
