import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/types.js";
import { handleNotificationInboxRoutes } from "../../notifications/inbox.routes.js";

const EMPLOYER_NOTIF_PREFIX = "/v1/jobmitra/employer/notifications";

export async function handleEmployerNotificationRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  return handleNotificationInboxRoutes(req, res, url, method, EMPLOYER_NOTIF_PREFIX);
}
