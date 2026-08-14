/** Job Mitra | useEmployerPendingBannerQueue.ts | Employer compact pending banner queue */

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { PendingActionItem } from "../../../../shared/pendingActions/pendingActions.types";
import type { PendingBannerQueueView } from "../../../employee/home/helpers/pendingBannerQueue.types";
import { buildEmployerPendingBannerQueue } from "../helpers/buildEmployerPendingBannerQueue";
import { employerPendingBannerDismissStorage } from "../helpers/employerPendingBannerDismiss.storage";

export function useEmployerPendingBannerQueue(
  pendingActions: readonly PendingActionItem[],
): PendingBannerQueueView & { dismissCurrent: () => void; dismissItem: (fp: string) => void } {
  const liveQueue = useMemo(
    () => buildEmployerPendingBannerQueue(pendingActions),
    [pendingActions],
  );

  const dismissRev = useSyncExternalStore(
    employerPendingBannerDismissStorage.subscribe,
    employerPendingBannerDismissStorage.getSnapshot,
    employerPendingBannerDismissStorage.getSnapshot,
  );

  useEffect(() => {
    employerPendingBannerDismissStorage.pruneToLive(liveQueue.map((item) => item.fingerprint));
  }, [liveQueue]);

  const visible = useMemo(() => {
    void dismissRev;
    return liveQueue.filter(
      (item) => !employerPendingBannerDismissStorage.isDismissed(item.fingerprint),
    );
  }, [liveQueue, dismissRev]);

  const current = visible[0] ?? null;

  const dismissCurrent = useCallback(() => {
    if (!current) return;
    employerPendingBannerDismissStorage.dismiss(current.fingerprint);
  }, [current]);

  const dismissItem = useCallback((fingerprint: string) => {
    employerPendingBannerDismissStorage.dismiss(fingerprint);
  }, []);

  return {
    visible,
    current,
    liveCount: liveQueue.length,
    queueIndex: 0,
    queueTotal: visible.length,
    dismissCurrent,
    dismissItem,
  };
}
