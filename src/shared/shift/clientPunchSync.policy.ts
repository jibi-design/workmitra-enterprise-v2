/**
 * Wave-2 attendance / punch integrity policy.
 *
 * Client check-in / clock surfaces (planner daily ledger, workforce attendance,
 * work diary punches) use device `Date.now()` and localStorage only.
 * They are NOT server-authoritative and MUST NOT be synced upstream as SoT
 * until a dedicated server punch API with trusted time (and optional geo) exists.
 *
 * Live QR clock-in is descopeed to v2.1 — do not invent a client→server LWW path here.
 */

export const CLIENT_PUNCH_AUTHORITATIVE = false as const;

export type ClientPunchSyncRejection = {
  ok: false;
  code: "CLIENT_PUNCH_NOT_AUTHORITATIVE";
  message: string;
};

/**
 * Call before any future client→server attendance sync.
 * Always rejects so naive LWW overwrite of server clock-in records cannot ship by accident.
 */
export function rejectClientPunchServerSync(source: string): ClientPunchSyncRejection {
  return {
    ok: false,
    code: "CLIENT_PUNCH_NOT_AUTHORITATIVE",
    message:
      `[WorkMitra] Refusing client punch sync from "${source}". ` +
      "Local checkedInAt/signInAt are device-trusted only until server-authoritative attendance lands.",
  };
}

/** Narrow helper for feature flags / UI copy. */
export function isClientPunchAuthoritative(): false {
  return CLIENT_PUNCH_AUTHORITATIVE;
}
