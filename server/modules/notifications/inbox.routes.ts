import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../middleware/types.js";
import {
  listMyNotifications,
  markAllMyNotificationsRead,
  markMyNotificationRead,
} from "./notifications.service.js";
import { sendJson, envelope } from "../../utils/http.js";

export async function handleNotificationInboxRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
  prefix: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(prefix)) return false;

  const requestId = req.requestId;
  const userId = req.authenticatedUser.id;
  const path = url.pathname;

  if (method === "GET" && path === prefix) {
    const mlHint = url.searchParams.get("ml_id") ?? undefined;
    const notifications = await listMyNotifications(userId, mlHint);
    sendJson(res, 200, envelope({ notifications }, requestId));
    return true;
  }

  if (method === "POST" && path === `${prefix}/read-all`) {
    const updated = await markAllMyNotificationsRead(userId);
    sendJson(res, 200, envelope({ updated }, requestId));
    return true;
  }

  const rest = path.slice(prefix.length);
  const readMatch = rest.match(/^\/([a-f0-9-]{36})\/read$/i);
  if (method === "PATCH" && readMatch) {
    const updated = await markMyNotificationRead(userId, readMatch[1]);
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
