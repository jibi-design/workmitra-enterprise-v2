// App name: Job Mitra
// File name: index.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\notifications\guards\index.ts

export type { NotificationLike, NotificationTextLimits } from "./notificationGuardTypes";

export {
  DEFAULT_NOTIFICATION_DEDUPE_WINDOW_MS,
  DEFAULT_NOTIFICATION_MAX_ITEMS,
  DEFAULT_NOTIFICATION_TEXT_LIMITS,
} from "./notificationGuardTypes";

export { cleanNotificationText, cleanOptionalNotificationText } from "./notificationTextGuards";

export { cleanNotificationRoute } from "./notificationRouteGuards";

export {
  getSafeNotificationTimestamp,
  isInsideNotificationDedupeWindow,
} from "./notificationTimeGuards";

export {
  getNotificationSignature,
  hasRecentNotificationDuplicate,
} from "./notificationDuplicateGuards";

export {
  normalizeAnyDomainNotificationInput,
  normalizeNotificationInput,
  parseNotificationJson,
  uniqueLatestNotifications,
} from "./notificationListGuards";
