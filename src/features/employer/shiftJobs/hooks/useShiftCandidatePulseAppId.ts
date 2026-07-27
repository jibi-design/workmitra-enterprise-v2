/** List-level pulse target for shift application trails */

import { PulseEvent } from "../../../../features/pulse/pulseRegistry";
import { usePulseStore } from "../../../../features/pulse/pulseStore";

export function useShiftCandidatePulseAppId(): string | null {
  return usePulseStore((state) => {
    for (const trail of Object.values(state.activeTrails)) {
      if (trail.status !== "TRAIL_STARTED") continue;
      if (trail.eventId !== PulseEvent.SHIFT_APPLICATION_RECEIVED) continue;
      const targetAppId = trail.targetParams?.appId;
      return typeof targetAppId === "string" ? targetAppId : null;
    }
    return null;
  });
}
