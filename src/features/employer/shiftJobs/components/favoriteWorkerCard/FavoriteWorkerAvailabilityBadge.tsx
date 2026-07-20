// App name: Job Mitra
// Way 2 — availability badge for favorite workers (trusted exception path).

import { useSyncExternalStore } from "react";
import { availabilityStorage } from "../../../../employee/shiftJobs/storage/availabilityStorage";

function readAvailabilityLabel(workerWmId: string): string | null {
  return availabilityStorage.getAvailabilityDaysLabel(workerWmId);
}

type Props = {
  workerWmId: string;
};

export function FavoriteWorkerAvailabilityBadge({ workerWmId }: Props) {
  const label = useSyncExternalStore(
    availabilityStorage.subscribe,
    () => readAvailabilityLabel(workerWmId),
    () => null,
  );

  if (!label) return null;

  return (
    <div
      data-testid="favorite-worker-availability-badge"
      style={{
        marginTop: 10,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 12px",
        borderRadius: 999,
        background: "rgba(16,185,129,0.10)",
        border: "1px solid rgba(16,185,129,0.28)",
        fontSize: 12,
        fontWeight: 850,
        color: "#059669",
        lineHeight: 1.35,
      }}
    >
      <span aria-hidden="true">🟢</span>
      Free on: {label}
    </div>
  );
}
