// Job Mitra | PlannerBlindDemandCard.tsx | Blind worker count — no names/avatars

import { useSyncExternalStore } from "react";
import { availabilityStorage } from "../../../employee/shiftJobs/storage/availabilityStorage";

type Props = {
  dateKey: string;
};

function readCount(dateKey: string): number {
  if (!dateKey) return 0;
  return availabilityStorage.countWorkersFreeOnIsoDate(dateKey);
}

export function PlannerBlindDemandCard({ dateKey }: Props) {
  const count = useSyncExternalStore(
    availabilityStorage.subscribe,
    () => readCount(dateKey),
    () => 0,
  );

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
          🔥 <strong>{count}</strong> {workerLabel} found nearby. Publish your shift to reach them!
        </p>
      ) : (
        <p className="wm-planner-blindDemandCopy wm-planner-blindDemandCopy--muted">
          Publish this plan to notify matching workers in your area.
        </p>
      )}
    </div>
  );
}
