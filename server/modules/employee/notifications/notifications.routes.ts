// server/modules/employee/notifications/notifications.routes.ts
//
// GET    /v1/jobmitra/employee/notifications
// PATCH  /v1/jobmitra/employee/notifications/:id/read
// POST   /v1/jobmitra/employee/notifications/read-all

import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/types.js";
import {
  listMyNotifications,
  markAllMyNotificationsRead,
  markMyNotificationRead,
} from "../../notifications/notifications.service.js";
import { sendJson, envelope } from "../../../utils/http.js";

const EMPLOYEE_NOTIF_PREFIX = "/v1/jobmitra/employee/notifications";

export async function handleEmployeeNotificationRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(EMPLOYEE_NOTIF_PREFIX)) return false;

  const requestId = req.requestId;
  const userId = req.authenticatedUser.id;
  const path = url.pathname;

  if (method === "GET" && path === EMPLOYEE_NOTIF_PREFIX) {
    const mlHint = url.searchParams.get("ml_id") ?? undefined;
    const notifications = await listMyNotifications(userId, mlHint ?? undefined);
    sendJson(res, 200, envelope({ notifications }, requestId));
    return true;
  }

  if (method === "POST" && path === `${EMPLOYEE_NOTIF_PREFIX}/read-all`) {
    const updated = await markAllMyNotificationsRead(userId);
    sendJson(res, 200, envelope({ updated }, requestId));
    return true;
  }

  const readMatch = path.match(/^\/v1\/jobmitra\/employee\/notifications\/([a-f0-9-]{36})\/read$/i);
  if (method === "PATCH" && readMatch) {
    const notificationId = readMatch[1];
    const updated = await markMyNotificationRead(userId, notificationId);
    if (!updated) {
      sendJson(res, 404, {
        error: {
          code: "NOTIFICATION_NOT_FOUND",
          message: "Notification not found",
          requestId,
        },
      });
      return true;
    }
    sendJson(res, 200, envelope({ notification: updated }, requestId));
    return true;
  }

  return false;
}
