/** Job Mitra | Blind worker count — job-site work area + date. No names. */

import { useSyncExternalStore } from "react";
import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { availabilityStorage } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { usePlannerWorkersRadarCount } from "../hooks/usePlannerWorkersRadarCount";

type Props = {
  dateKey: string;
  locationPincode: string;
};

function readLocalCount(dateKey: string, locationPincode: string): number {
  if (!dateKey) return 0;
  return availabilityStorage.countWorkersFreeOnIsoDateNear(dateKey, locationPincode);
}

export function PlannerBlindDemandCard({ dateKey, locationPincode }: Props) {
  const localCount = useSyncExternalStore(
    availabilityStorage.subscribe,
    () => readLocalCount(dateKey, locationPincode),
    () => 0,
  );
  const serverCount = usePlannerWorkersRadarCount({
    locationPincode,
    isoDate: dateKey,
  });
  const count = AUTH_BACKEND_ENABLED ? serverCount : localCount;

  if (!dateKey) return null;

  const workerLabel = count === 1 ? "available worker" : "available workers";

  return (
    <div
      className={`wm-planner-blindDemand${count > 0 ? " wm-planner-blindDemand--active" : ""}`}
      role="status"
      aria-live="polite"
    >
      {count > 0 ? (
        <p className="wm-planner-blindDemandCopy">
          <strong>{count}</strong> {workerLabel} in range for this date.
        </p>
      ) : (
        <p className="wm-planner-blindDemandCopy wm-planner-blindDemandCopy--muted">
          Matching workers show as a number only. No names.
        </p>
      )}
    </div>
  );
}
