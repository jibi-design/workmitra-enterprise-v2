import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";
import { careerSavedJobsService } from "./savedJobs.service.js";

const CAREER_PREFIX = "/v1/jobmitra/employee/career";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function handleCareerSavedJobsRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const pathname = url.pathname;
  if (!pathname.startsWith(CAREER_PREFIX)) return false;

  const { requestId } = req;
  const subpath = pathname.slice(CAREER_PREFIX.length) || "/";

  if (method === "GET" && subpath === "/saved-jobs") {
    const result = await careerSavedJobsService.listMine(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ items: result.items }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/saved-jobs") {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const postId = isRecord(body)
      ? typeof body.postId === "string"
        ? body.postId
        : typeof body.post_id === "string"
          ? body.post_id
          : ""
      : "";
    const result = await careerSavedJobsService.save(req.authenticatedUser, postId);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 201, envelope({ item: result.item }, requestId));
    return true;
  }

  const deleteMatch = subpath.match(/^\/saved-jobs\/([^/]+)$/);
  if (method === "DELETE" && deleteMatch) {
    const result = await careerSavedJobsService.unsave(
      req.authenticatedUser,
      decodeURIComponent(deleteMatch[1] ?? ""),
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ deleted: result.deleted }, requestId));
    return true;
  }

  return false;
}
