/** Job Mitra | shiftOpsAuthNoise.helpers.ts | Soft-filter repeated auth-bridge noise */

export function isShiftOpsAuthConfigNoise(message: string): boolean {
  return /anonymous|sign-ins? are disabled|auth bridge|not authenticated|jwt|bridge_not_configured|supabase-bridge/i.test(
    message,
  );
}

/** Prefer a single short note instead of raw Supabase bridge dumps. */
export function shiftOpsAuthNoiseCopy(): string {
  return "Shift Ops auth bridge is not ready in this environment.";
}
