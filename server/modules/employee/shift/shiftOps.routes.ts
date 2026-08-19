import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";
import { shiftOpsService } from "../../shiftOps/shiftOps.service.js";

const PREFIX = "/v1/jobmitra/employee/shift";

export async function handleEmployeeShiftOpsRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(PREFIX)) return false;
  const { requestId } = req;
  const subpath = url.pathname.slice(PREFIX.length) || "/";

  const checkIn = subpath.match(/^\/workspaces\/([^/]+)\/check-in$/);
  if (method === "POST" && checkIn) {
    const body = (await readJsonBody(req)) ?? {};
    const qrToken = typeof body.qrToken === "string" ? body.qrToken : "";
    const result = await shiftOpsService.checkIn(checkIn[1], req.authenticatedUser, qrToken);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope(result.data, requestId));
    return true;
  }

  const checkOut = subpath.match(/^\/workspaces\/([^/]+)\/check-out$/);
  if (method === "POST" && checkOut) {
    const result = await shiftOpsService.checkOut(checkOut[1], req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope(result.data, requestId));
    return true;
  }

  const att = subpath.match(/^\/workspaces\/([^/]+)\/attendance$/);
  if (method === "GET" && att) {
    const result = await shiftOpsService.listAttendance(att[1], req.authenticatedUser, "employee");
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope(result.data, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/reviews") {
    const body = (await readJsonBody(req)) ?? {};
    const result = await shiftOpsService.submitReview(
      req.authenticatedUser,
      "employee",
      body as Record<string, unknown>,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 201, envelope(result.data, requestId));
    return true;
  }

  if (method === "GET" && subpath === "/reviews") {
    const result = await shiftOpsService.listReviews(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope(result.data, requestId));
    return true;
  }

  return false;
}
