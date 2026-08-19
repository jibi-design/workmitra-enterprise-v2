import { emitUserNotification } from "./notifications.service.js";
import type { UserNotificationView } from "./notifications.types.js";

type CareerNotifEvent =
  | "CAREER_APPLICATION_SUBMITTED"
  | "CAREER_EMPLOYEE_SHORTLISTED"
  | "CAREER_APPLICATION_REJECTED";

export async function emitCareerInboxNotification(params: {
  recipientUserId: string;
  eventType: CareerNotifEvent;
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
      domain: "career",
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
