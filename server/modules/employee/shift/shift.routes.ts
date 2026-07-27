import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";
import { employeeShiftService } from "./shift.service.js";

const SHIFT_PREFIX = "/v1/jobmitra/employee/shift";

/**
 * Employee Shift route handler.
 * Behind requireAuth + requireEmployeeRole.
 */
export async function handleEmployeeShiftRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const pathname = url.pathname;
  if (!pathname.startsWith(SHIFT_PREFIX)) return false;

  const { requestId } = req;
  const subpath = pathname.slice(SHIFT_PREFIX.length) || "/";

  // GET /v1/jobmitra/employee/shift/applications
  if (method === "GET" && subpath === "/applications") {
    const hint =
      typeof url.searchParams.get("worker_wm_id") === "string"
        ? (url.searchParams.get("worker_wm_id") ?? undefined)
        : undefined;
    const result = await employeeShiftService.listMyApplications(req.authenticatedUser, hint);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ applications: result.applications }, requestId));
    return true;
  }

  // POST /v1/jobmitra/employee/shift/posts/:postId/apply
  const applyMatch = subpath.match(/^\/posts\/([^/]+)\/apply$/);
  if (method === "POST" && applyMatch) {
    const postId = applyMatch[1];
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }

    const result = await employeeShiftService.applyToPost(postId, req.authenticatedUser, body);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 201, envelope({ application: result.application }, requestId));
    return true;
  }

  sendJson(res, 404, {
    error: { code: "NOT_FOUND", message: "Employee shift route not found", requestId },
  });
  return true;
}
