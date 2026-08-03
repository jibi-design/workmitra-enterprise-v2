// App name: Job Mitra
// Recessed glass "Nearby Worker Availability" card — Step 2 (blind count only).

import { useRef, useSyncExternalStore } from "react";
import { availabilityStorage } from "../../../shared/shift/availability.reader";
import { toDateStr } from "../helpers/shiftCreateHelpers";
import { AvailabilitySyncDebugChip } from "./AvailabilitySyncDebugChip";

type Props = {
  startAt: number;
};

const ALL_KEY = "wm_all_availability_broadcasts_v1";

function RadarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Zm0-14a6 6 0 1 0 6 6 6.006 6.006 0 0 0-6-6Zm0 10a4 4 0 1 1 4-4 4.004 4.004 0 0 1-4 4Zm0-6a2 2 0 1 0 2 2 2.002 2.002 0 0 0-2-2Z"
      />
    </svg>
  );
}

export function ShiftCreateNearbyAvailabilityCard({ startAt }: Props) {
  const cacheRef = useRef<{ key: string; count: number }>({ key: "", count: 0 });

  const count = useSyncExternalStore(
    availabilityStorage.subscribe,
    () => {
      const iso = toDateStr(startAt);
      const availRaw = localStorage.getItem(ALL_KEY) ?? "";
      const key = `${iso}|${availRaw}`;
      if (cacheRef.current.key === key) return cacheRef.current.count;
      const next = availabilityStorage.countWorkersFreeOnIsoDate(iso);
      cacheRef.current = { key, count: next };
      return next;
    },
    () => 0,
  );

  const hasMatches = count > 0;
  const workerLabel = count === 1 ? "available worker" : "available workers";
  const iso = toDateStr(startAt);

  return (
    <div
      className={`wm-shiftNearbyAvailability${hasMatches ? " wm-shiftNearbyAvailability--active" : ""}`}
      role="status"
      aria-live="polite"
      data-testid="shift-create-nearby-availability-card"
      style={{
        display: "block",
        visibility: "visible",
      }}
    >
      {hasMatches && <span className="wm-shiftNearbyAvailability__neonEdge" aria-hidden="true" />}

      <div className="wm-shiftNearbyAvailability__inner">
        <div className="wm-shiftNearbyAvailability__icon" aria-hidden="true">
          <RadarIcon />
        </div>

        <div className="wm-shiftNearbyAvailability__copy">
          <div className="wm-shiftNearbyAvailability__title">Nearby Worker Availability</div>

          {hasMatches ? (
            <p className="wm-shiftNearbyAvailability__desc wm-shiftNearbyAvailability__desc--active">
              🔥 <strong>{count}</strong> {workerLabel} found nearby for this date. Publish your
              shift to reach them!
            </p>
          ) : (
            <p className="wm-shiftNearbyAvailability__desc">
              Publish this shift to notify matching workers in your area. Available candidates will
              be alerted instantly to apply.
            </p>
          )}
        </div>
      </div>

      <AvailabilitySyncDebugChip
        label="Create Nearby card"
        lines={[`iso=${iso}`, `count=${count}`, `subscribes=${availabilityStorage.CHANGED_EVENT}`]}
      />
    </div>
  );
}
