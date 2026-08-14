// server/modules/notifications/notifications.service.ts

import {
  insertNotification,
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications.repository.js";
import type { EmitNotificationParams, UserNotificationView } from "./notifications.types.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isAuthUserUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export async function emitUserNotification(
  params: EmitNotificationParams,
): Promise<UserNotificationView | null> {
  const title = params.title?.trim() ?? "";
  if (!title) return null;
  const row = await insertNotification({
    ...params,
    title,
    body: params.body?.trim() ?? "",
  });
  if (row && params.recipientUserId) {
    const { emitPulseToUser } = await import("../realtime/pulseHub.js");
    emitPulseToUser(params.recipientUserId, {
      type: "inbox",
      notificationId: row.id,
      eventType: row.eventType,
      ts: Date.now(),
    });
  }
  return row;
}

/**
 * Emit shift_confirmed for the worker after employer confirm saga succeeds.
 * Resolves recipient from auth UUID (when worker_wm_id is UUID) + ML id fallback.
 */
export async function emitShiftConfirmedNotification(params: {
  workerWmId: string;
  applicantUserId?: string | null;
  postId: string;
  appId: string;
  workspaceId: string;
  jobName?: string;
}): Promise<UserNotificationView | null> {
  const workerWmId = params.workerWmId.trim().toUpperCase();
  const applicant = typeof params.applicantUserId === "string" ? params.applicantUserId.trim() : "";

  let recipientUserId: string | null = null;
  if (applicant && isAuthUserUuid(applicant)) {
    recipientUserId = applicant;
  } else if (isAuthUserUuid(workerWmId)) {
    recipientUserId = workerWmId.toLowerCase();
  }

  const jobLabel = params.jobName?.trim() || "your shift";

  return emitUserNotification({
    recipientUserId,
    recipientMlId: workerWmId,
    domain: "shift",
    eventType: "SHIFT_EMPLOYEE_SELECTED",
    title: "Shift confirmed",
    body: `You were confirmed for ${jobLabel}. Open My Work to continue.`,
    route: "/employee/shift/my-work",
    meta: {
      type: "SHIFT_EMPLOYEE_SELECTED",
      postId: params.postId,
      appId: params.appId,
      workspaceId: params.workspaceId,
      actorRole: "employer",
    },
  });
}

export async function listMyNotifications(
  userId: string,
  mlIdHint?: string,
): Promise<UserNotificationView[]> {
  return listNotificationsForUser(userId, mlIdHint);
}

export async function markMyNotificationRead(
  userId: string,
  notificationId: string,
): Promise<UserNotificationView | null> {
  if (!isAuthUserUuid(notificationId)) return null;
  return markNotificationRead(notificationId, userId);
}

export async function markAllMyNotificationsRead(userId: string): Promise<number> {
  return markAllNotificationsRead(userId);
}
