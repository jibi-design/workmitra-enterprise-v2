// App name: Job Mitra
// Shift retry queue drain — focus / online heal path (Wave 2 P1-2)

import { drainShiftRetryQueue, type ShiftRetryQueueItem } from "./shiftRetryQueue";

let installed = false;
let draining = false;

async function handleShiftRetryItem(
  item: ShiftRetryQueueItem,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (item.op === "site_membership_provision") {
    const { drainSiteMembershipProvisionItem } =
      await import("../../features/shiftOps/services/membershipBridge.service");
    return drainSiteMembershipProvisionItem(item.context);
  }

  // Soft side-effects: drop when online so the queue cannot remain a write-only sink.
  // Full payload replay for notify/plan ops needs richer context (tracked separately).
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { ok: false, error: "offline" };
  }

  return { ok: true };
}

export async function runShiftRetryQueueDrain(): Promise<void> {
  if (draining) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  draining = true;
  try {
    await drainShiftRetryQueue(handleShiftRetryItem);
  } finally {
    draining = false;
  }
}

/** Idempotent install — call once from app bootstrap. */
export function installShiftRetryQueueDrain(): () => void {
  if (typeof window === "undefined" || installed) {
    return () => undefined;
  }
  installed = true;

  const onFocus = () => {
    void runShiftRetryQueueDrain();
  };
  const onOnline = () => {
    void runShiftRetryQueueDrain();
  };
  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      void runShiftRetryQueueDrain();
    }
  };

  window.addEventListener("focus", onFocus);
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisibility);
  void runShiftRetryQueueDrain();

  return () => {
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVisibility);
    installed = false;
  };
}
