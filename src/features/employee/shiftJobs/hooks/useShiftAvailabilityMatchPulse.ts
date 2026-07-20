// App name: Job Mitra
// Consumes queued availability-match notification when employee opens Shift home.

import { useEffect } from "react";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { handleIncomingNotification } from "../../../pulse/pulseEventBridge";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { shiftAvailabilityPulseQueueStorage } from "../storage/shiftAvailabilityPulseQueue.storage";

export function useShiftAvailabilityMatchPulse(): void {
  useEffect(() => {
    const wmId = employeeProfileStorage.get().uniqueId?.trim();
    if (!wmId) return;

    const postId = shiftAvailabilityPulseQueueStorage.consumeForWorker(wmId);
    if (!postId) return;

    handleIncomingNotification({
      type: "SHIFT_POSTS_NEARBY",
      domain: "shift",
      affectedUserRole: "employee",
      postId,
      title: "A shift matches your free days",
      body: "A new shift was posted on a day you marked available. Open Find Shifts to view it.",
      route: ROUTE_PATHS.employeeShiftSearch,
    });
  }, []);
}
