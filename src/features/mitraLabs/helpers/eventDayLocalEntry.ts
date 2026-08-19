/** Local (cloud-off) single-consume for staff scanner. Isolated from Shift/Career. */

import type { PassVerifyBadge } from "./mitraLabs.helpers";
import { resolvePassVerifyBadge } from "./mitraLabs.helpers";
import type { DigitalPassRecord } from "../storage/mitraLabs.storage";
import { useMitraLabsStore } from "../storage/mitraLabs.storage";

export function isLocalPassEntered(passId: string): boolean {
  return useMitraLabsStore
    .getState()
    .checkInEvents.some((event) => event.passId === passId && event.action === "check_in");
}

export function lookupLocalStaffScan(token: string): {
  readonly badge: PassVerifyBadge;
  readonly pass: DigitalPassRecord | undefined;
} {
  const pass = useMitraLabsStore.getState().getPassByToken(token);
  const entered = pass ? isLocalPassEntered(pass.passId) : false;
  return { pass, badge: resolvePassVerifyBadge(pass, entered) };
}

export function consumeLocalStaffScan(
  pass: DigitalPassRecord,
  staffName: string,
): { ok: true } | { ok: false; badge: PassVerifyBadge } {
  if (isLocalPassEntered(pass.passId)) {
    return { ok: false, badge: "USED" };
  }
  if (resolvePassVerifyBadge(pass) !== "VALID") {
    return { ok: false, badge: resolvePassVerifyBadge(pass) };
  }
  useMitraLabsStore.getState().recordCheckIn({
    passId: pass.passId,
    passToken: pass.passToken,
    staffName,
    issuerId: pass.issuerId,
    action: "check_in",
  });
  return { ok: true };
}
