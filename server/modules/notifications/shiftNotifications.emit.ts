import { emitUserNotification } from "./notifications.service.js";
import type { UserNotificationView } from "./notifications.types.js";

type ShiftNotifEvent =
  | "SHIFT_APPLICATION_SUBMITTED"
  | "SHIFT_APPLICATION_WITHDRAWN"
  | "SHIFT_EMPLOYEE_SHORTLISTED"
  | "SHIFT_EMPLOYEE_WAITLISTED"
  | "SHIFT_APPLICATION_REJECTED"
  | "SHIFT_EMPLOYEE_SELECTED"
  | "SHIFT_WORKER_CANCELLED";

export async function emitShiftInboxNotification(params: {
  recipientUserId: string;
  eventType: ShiftNotifEvent;
  title: string;
  body: string;
  route: string;
  postId: string;
  appId: string;
  actorRole: "employee" | "employer";
}): Promise<UserNotificationView | null> {
  const recipientUserId = params.recipientUserId.trim();
  if (!recipientUserId) return null;
  try {
    return await emitUserNotification({
      recipientUserId,
      domain: "shift",
      eventType: params.eventType,
      title: params.title,
      body: params.body,
      route: params.route,
      meta: {
        type: params.eventType,
        postId: params.postId,
        appId: params.appId,
        actorRole: params.actorRole,
      },
    });
  } catch {
    return null;
  }
}
