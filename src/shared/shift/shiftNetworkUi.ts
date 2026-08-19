/** User-facing copy when Apply / Confirm fail because the device is offline. */

import { getNetworkOnline } from "../native/networkStatus";

export const SHIFT_NETWORK_APPLY_RETRY =
  "Network error. Check your connection, then retry. This will not create a duplicate application.";

export const SHIFT_NETWORK_CONFIRM_RETRY =
  "Network error. Check your connection, then retry. The Shift Ops group will not be created twice.";

export function isShiftNetworkFailure(): boolean {
  return getNetworkOnline() === false;
}

export function applyPersistFailureCopy(reason: string): string {
  if (reason === "conflict") {
    return "You have already applied or have a shift scheduled at this time.";
  }
  if (isShiftNetworkFailure()) return SHIFT_NETWORK_APPLY_RETRY;
  return "Unable to save application on this device. Please free storage and try again.";
}

export function confirmSyncFailureCopy(): string {
  if (isShiftNetworkFailure()) return SHIFT_NETWORK_CONFIRM_RETRY;
  return "Server confirm failed. Local changes were rolled back — try again.";
}
