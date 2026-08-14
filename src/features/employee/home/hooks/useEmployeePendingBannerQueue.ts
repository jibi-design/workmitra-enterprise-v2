/** Job Mitra | useEmployeePendingBannerQueue.ts | Live queue + dismiss filter */

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { NavigateFunction } from "react-router-dom";
import type { PendingActionItem } from "../../../../shared/pendingActions/pendingActions.types";
import { subscribeContactVerification } from "../../../../shared/phone";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { getProfileCompletion } from "../../profile/services/profileCompletionService";
import { buildEmployeePendingBannerQueue } from "../helpers/buildEmployeePendingBannerQueue";
import { pendingBannerDismissStorage } from "../helpers/pendingBannerDismiss.storage";
import {
  getUpcomingShiftNudgeSnapshot,
  getUnifiedBroadcastNudgeSnapshot,
  setHomeNudgeDemoForce,
  subscribeUpcomingShiftNudge,
  subscribeUnifiedBroadcastNudge,
} from "../helpers/employeeHomeDynamicNudges.helpers";
import type { PendingBannerQueueView } from "../helpers/pendingBannerQueue.types";

function subscribeProfile(onStoreChange: () => void): () => void {
  const unsubProfile = employeeProfileStorage.subscribe(onStoreChange);
  const unsubContact = subscribeContactVerification(onStoreChange);
  return () => {
    unsubProfile();
    unsubContact();
  };
}

function getProfileRevision(): string {
  const status = getProfileCompletion();
  return `${status.doneCount}|${status.totalCount}|${status.isComplete ? 1 : 0}|${status.missingLabels.join(",")}`;
}

function getUpcomingFp(): string {
  return getUpcomingShiftNudgeSnapshot().fingerprint;
}

function getBroadcastFp(): string {
  return getUnifiedBroadcastNudgeSnapshot().fingerprint;
}

export function useEmployeePendingBannerQueue(
  pendingActions: readonly PendingActionItem[],
  nav: NavigateFunction,
  forceVisible = false,
): PendingBannerQueueView & { dismissCurrent: () => void } {
  const upcomingRev = useSyncExternalStore(
    subscribeUpcomingShiftNudge,
    getUpcomingFp,
    getUpcomingFp,
  );
  const broadcastRev = useSyncExternalStore(
    subscribeUnifiedBroadcastNudge,
    getBroadcastFp,
    getBroadcastFp,
  );
  const profileRev = useSyncExternalStore(subscribeProfile, getProfileRevision, getProfileRevision);
  const dismissRev = useSyncExternalStore(
    pendingBannerDismissStorage.subscribe,
    pendingBannerDismissStorage.getSnapshot,
    pendingBannerDismissStorage.getSnapshot,
  );

  const liveQueue = useMemo(() => {
    void upcomingRev;
    void broadcastRev;
    void profileRev;
    return buildEmployeePendingBannerQueue(pendingActions, nav, forceVisible);
  }, [pendingActions, nav, forceVisible, upcomingRev, broadcastRev, profileRev]);

  useEffect(() => {
    pendingBannerDismissStorage.pruneToLive(liveQueue.map((item) => item.fingerprint));
  }, [liveQueue]);

  const visible = useMemo(() => {
    void dismissRev;
    return liveQueue.filter((item) => !pendingBannerDismissStorage.isDismissed(item.fingerprint));
  }, [liveQueue, dismissRev]);

  const current = visible[0] ?? null;

  const dismissItem = useCallback(
    (fingerprint: string) => {
      const target = liveQueue.find((item) => item.fingerprint === fingerprint);
      pendingBannerDismissStorage.dismiss(fingerprint);
      if (!target) return;
      if (target.isDemoForce && target.demoKind === "upcoming") {
        setHomeNudgeDemoForce({ upcoming: false });
      }
      if (target.isDemoForce && target.demoKind === "broadcast") {
        setHomeNudgeDemoForce({ broadcastDomain: null });
      }
    },
    [liveQueue],
  );

  const dismissCurrent = useCallback(() => {
    if (!current) return;
    dismissItem(current.fingerprint);
  }, [current, dismissItem]);

  return {
    visible,
    current,
    liveCount: liveQueue.length,
    queueIndex: current ? 0 : -1,
    queueTotal: visible.length,
    dismissCurrent,
    dismissItem,
  };
}
