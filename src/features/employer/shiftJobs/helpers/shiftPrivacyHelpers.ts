// App name: Job Mitra
// File name: shiftPrivacyHelpers.ts
// Platform Lock — contact never shown; Workspace chat only after confirm.

/** Platform Lock: phone/email are never revealed in-app (pre or post confirm). */
export function isShiftContactRevealed(): boolean {
  return false;
}

export const SHIFT_CONTACT_MASKED_MESSAGE =
  "Phone and email stay hidden on Job Mitra. Confirm a worker, then chat inside your shift Workspace.";

export const SHIFT_CONTACT_PLATFORM_LOCK_MESSAGE =
  "Worker confirmed. Contact this worker only through your shift Workspace / Groups chat.";
