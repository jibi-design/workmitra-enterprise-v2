/** Job Mitra | shiftOps/privacy.ts | Phase 0 — platform lock (Shift domain only) */

/**
 * Product invariant: raw peer phone/email must never be revealed in Shift Ops UI.
 * Mirrors SQL: shift_ops.is_shift_contact_revealed() / platform_locks CHECK.
 */
export function isShiftContactRevealed(): boolean {
  return false;
}

export const SHIFT_OPS_CONTACT_LOCKED_MESSAGE =
  "Work contacts stay masked. Managers and workers never see each other’s raw phone or email.";
