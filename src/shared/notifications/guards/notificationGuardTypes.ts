// App name: Job Mitra
// File name: notificationGuardTypes.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\notifications\guards\notificationGuardTypes.ts

export type NotificationLike = {
  id: string;
  domain: string;
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
  route?: string;
};

export type NotificationTextLimits = {
  title: number;
  body: number;
  route: number;
};

export const DEFAULT_NOTIFICATION_TEXT_LIMITS: NotificationTextLimits = {
  title: 120,
  body: 500,
  route: 180,
};

export const DEFAULT_NOTIFICATION_MAX_ITEMS = 200;
export const DEFAULT_NOTIFICATION_DEDUPE_WINDOW_MS = 5 * 60 * 1000;
