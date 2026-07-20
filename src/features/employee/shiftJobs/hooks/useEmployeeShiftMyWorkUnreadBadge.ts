// App name: Job Mitra
// My Work tab unread badge when direct invites are pending.

import { useCallback, useSyncExternalStore } from "react";
import { shiftDirectInviteStorage } from "../../../employer/shiftJobs/storage/shiftDirectInvite.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { countEmployeePendingDirectInvites } from "../helpers/shiftDirectInvite.helpers";

function readPendingCount(): number {
  const workerWmId = employeeProfileStorage.get().uniqueId?.trim().toUpperCase() ?? "";
  if (!workerWmId) return 0;
  return countEmployeePendingDirectInvites(workerWmId);
}

export function useEmployeeShiftMyWorkUnreadBadge(): boolean {
  const subscribe = useCallback((callback: () => void) => {
    const unsubscribeInvites = shiftDirectInviteStorage.subscribe(callback);
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.includes("profile")) callback();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", callback);
    return () => {
      unsubscribeInvites();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", callback);
    };
  }, []);

  const pendingCount = useSyncExternalStore(subscribe, readPendingCount, () => 0);
  return pendingCount > 0;
}
