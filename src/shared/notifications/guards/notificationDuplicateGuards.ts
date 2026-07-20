// App name: Job Mitra
// File name: notificationDuplicateGuards.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\notifications\guards\notificationDuplicateGuards.ts

import {
  DEFAULT_NOTIFICATION_DEDUPE_WINDOW_MS,
  type NotificationLike,
} from "./notificationGuardTypes";
import { isInsideNotificationDedupeWindow } from "./notificationTimeGuards";

export function getNotificationSignature(
  item: Pick<NotificationLike, "domain" | "title" | "body" | "route">,
): string {
  return `${item.domain}|${item.title}|${item.body ?? ""}|${item.route ?? ""}`.toLowerCase();
}

export function hasRecentNotificationDuplicate<T extends NotificationLike>(
  existingItems: T[],
  item: NotificationLike,
  windowMs = DEFAULT_NOTIFICATION_DEDUPE_WINDOW_MS,
): boolean {
  const signature = getNotificationSignature(item);

  return existingItems.some((existing) => {
    if (getNotificationSignature(existing) !== signature) return false;

    return isInsideNotificationDedupeWindow(item.createdAt, existing.createdAt, windowMs);
  });
}
