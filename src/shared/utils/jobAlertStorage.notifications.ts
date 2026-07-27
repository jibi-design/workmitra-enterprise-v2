import {
  cleanNotificationRoute,
  cleanNotificationText,
  DEFAULT_NOTIFICATION_MAX_ITEMS,
  DEFAULT_NOTIFICATION_TEXT_LIMITS,
  hasRecentNotificationDuplicate,
  normalizeAnyDomainNotificationInput,
  parseNotificationJson,
  uniqueLatestNotifications,
  type NotificationLike,
} from "../notifications/guards";
import type { AlertDomain } from "./jobAlertTypes";
import { newNotificationId, safeDispatch } from "./jobAlertStorage.utils";

export const EE_NOTIF_KEY = "wm_employee_notifications_v1";
export const EE_NOTIF_EVENT = "wm:employee-notifications-changed";

function readExistingEmployeeNotifications(): NotificationLike[] {
  try {
    return parseNotificationJson(localStorage.getItem(EE_NOTIF_KEY))
      .map((item) => normalizeAnyDomainNotificationInput(item))
      .filter((item): item is NotificationLike => item !== null);
  } catch {
    return [];
  }
}

export function pushJobAlertNotification(
  title: string,
  body: string,
  route: string,
  domain: AlertDomain,
): void {
  const cleanTitle = cleanNotificationText(title, DEFAULT_NOTIFICATION_TEXT_LIMITS.title);
  const cleanBody = cleanNotificationText(body, DEFAULT_NOTIFICATION_TEXT_LIMITS.body);
  const safeRoute = cleanNotificationRoute(route);

  if (!cleanTitle || !cleanBody || !safeRoute) return;

  try {
    const existing = readExistingEmployeeNotifications();

    const item: NotificationLike = {
      id: newNotificationId(),
      domain,
      title: cleanTitle,
      body: cleanBody,
      route: safeRoute,
      isRead: false,
      createdAt: Date.now(),
    };

    if (hasRecentNotificationDuplicate(existing, item)) return;

    localStorage.setItem(
      EE_NOTIF_KEY,
      JSON.stringify(
        uniqueLatestNotifications([item, ...existing], DEFAULT_NOTIFICATION_MAX_ITEMS),
      ),
    );
    safeDispatch(EE_NOTIF_EVENT);
  } catch {
    // demo-safe
  }
}
