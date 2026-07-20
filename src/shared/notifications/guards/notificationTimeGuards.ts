// App name: Job Mitra
// File name: notificationTimeGuards.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\notifications\guards\notificationTimeGuards.ts

const MAX_SAFE_FUTURE_DRIFT_MS = 5 * 60 * 1000;

export function getSafeNotificationTimestamp(value: unknown, fallback = Date.now()): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  if (value > fallback + MAX_SAFE_FUTURE_DRIFT_MS) {
    return fallback;
  }

  return value;
}

export function isInsideNotificationDedupeWindow(
  newerTimestamp: number,
  olderTimestamp: number,
  windowMs: number,
): boolean {
  return Math.abs(newerTimestamp - olderTimestamp) <= windowMs;
}
