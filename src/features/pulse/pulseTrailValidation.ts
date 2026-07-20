/** Job Mitra | pulseTrailValidation.ts | src/features/pulse/pulseTrailValidation.ts */

/**
 * Keeps Pulse Trail input validation separate from event-specific trail starters.
 * This prevents service files from repeating the same post/app id checks.
 */
export function normalizePulseId(value: string): string {
  return value.trim();
}

export function hasValidPostAndApp(postId: string, appId: string): boolean {
  return postId.trim().length > 0 && appId.trim().length > 0;
}

export function warnInvalidPulseTrail(message: string): void {
  if (import.meta.env.DEV) {
    console.warn(message);
  }
}
