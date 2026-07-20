// App name: Job Mitra
// File name: notificationRouteGuards.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\notifications\guards\notificationRouteGuards.ts

import { DEFAULT_NOTIFICATION_TEXT_LIMITS } from "./notificationGuardTypes";
import { cleanOptionalNotificationText } from "./notificationTextGuards";

export function cleanNotificationRoute(value: unknown): string | undefined {
  const clean = cleanOptionalNotificationText(value, DEFAULT_NOTIFICATION_TEXT_LIMITS.route);

  if (!clean) return undefined;
  if (!clean.startsWith("/")) return undefined;
  if (clean.includes("://")) return undefined;

  return clean;
}
