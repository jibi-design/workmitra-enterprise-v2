import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";
import { shiftOpsService } from "../../shiftOps/shiftOps.service.js";

const PREFIX = "/v1/jobmitra/employer/shift";

export async function handleEmployerShiftOpsRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(PREFIX)) return false;
  const { requestId } = req;
  const subpath = url.pathname.slice(PREFIX.length) || "/";

  const tokenMatch = subpath.match(/^\/workspaces\/([^/]+)\/checkin-token$/);
  if (method === "POST" && tokenMatch) {
    const result = await shiftOpsService.issueCheckinToken(tokenMatch[1], req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 201, envelope(result.data, requestId));
    return true;
  }

  const att = subpath.match(/^\/workspaces\/([^/]+)\/attendance$/);
  if (method === "GET" && att) {
    const result = await shiftOpsService.listAttendance(att[1], req.authenticatedUser, "employer");
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
      "employer",
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

  const completeWs = subpath.match(/^\/workspaces\/([^/]+)\/complete$/);
  if (method === "POST" && completeWs) {
    const result = await shiftOpsService.completeWorkspace(completeWs[1], req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope(result.data, requestId));
    return true;
  }

  const archiveSite = subpath.match(/^\/sites\/([^/]+)\/archive$/);
  if (method === "POST" && archiveSite) {
    const body = (await readJsonBody(req)) ?? {};
    const extraKeys = Array.isArray(body.jobPostKeys)
      ? body.jobPostKeys.filter((key: unknown): key is string => typeof key === "string")
      : [];
    const result = await shiftOpsService.archiveSite(
      archiveSite[1],
      req.authenticatedUser,
      extraKeys,
    );
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
