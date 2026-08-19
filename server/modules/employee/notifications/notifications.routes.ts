import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/types.js";
import { handleNotificationInboxRoutes } from "../../notifications/inbox.routes.js";

const EMPLOYEE_NOTIF_PREFIX = "/v1/jobmitra/employee/notifications";

export async function handleEmployeeNotificationRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  return handleNotificationInboxRoutes(req, res, url, method, EMPLOYEE_NOTIF_PREFIX);
}
