/** Favorite worker availability badge — reads batched labels from list provider */

import { useFavoriteAvailabilityLabel } from "./useFavoriteAvailabilityLabel";
import { AvailabilitySyncDebugChip } from "../AvailabilitySyncDebugChip";
import { availabilityStorage } from "../../../../shared/shift/availability.reader";

type Props = {
  workerMlId: string;
};

export function FavoriteWorkerAvailabilityBadge({ workerMlId }: Props) {
  const label = useFavoriteAvailabilityLabel(workerMlId);
  const poolLabel = availabilityStorage.getAvailabilityDaysLabel(workerMlId);

  return (
    <>
      {label ? (
        <div
          data-testid="favorite-worker-availability-badge"
          style={{
            marginTop: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 12px",
            borderRadius: "var(--wm-radius-pill)",
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
      ) : null}
      <AvailabilitySyncDebugChip
        label="Favorite availability badge"
        lines={[
          `worker=${workerMlId}`,
          `ctxLabel=${label ?? "(none)"}`,
          `poolLabel=${poolLabel ?? "(none)"}`,
        ]}
      />
    </>
  );
}
