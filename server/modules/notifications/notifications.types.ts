// server/modules/notifications/notifications.types.ts

export type NotificationDomain = "shift" | "career" | "workforce" | "employment" | "system";

export type UserNotificationRow = {
  id: string;
  recipient_user_id: string | null;
  recipient_ml_id: string;
  domain: NotificationDomain;
  event_type: string;
  title: string;
  body: string;
  route: string | null;
  is_read: boolean;
  meta: Record<string, unknown>;
  created_at: Date;
  read_at: Date | null;
};

export type UserNotificationView = {
  id: string;
  domain: NotificationDomain;
  eventType: string;
  title: string;
  body: string;
  route: string | null;
  isRead: boolean;
  createdAt: number;
  readAt: number | null;
  meta: Record<string, unknown>;
};

export type EmitNotificationParams = {
  recipientUserId?: string | null;
  recipientMlId?: string;
  domain: NotificationDomain;
  eventType: string;
  title: string;
  body?: string;
  route?: string | null;
  meta?: Record<string, unknown>;
};
