import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/types.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";
import { parseWithSchema, sendValidationError } from "../../../validation/zodParse.js";
import {
  patchShiftApplicationStatusBodySchema,
  shiftConfirmParamsSchema,
  shiftPostIdParamsSchema,
} from "../../../validation/schemas/shift.schemas.js";
import {
  listApplicationsForOwnedPost,
  patchOwnedApplicationStatus,
} from "./shift.applications.service.js";

const SHIFT_PREFIX = "/v1/jobmitra/employer/shift";

export async function tryHandleEmployerShiftApplicationList(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const subpath = url.pathname.slice(SHIFT_PREFIX.length) || "/";
  const requestId = req.requestId;

  if (method === "GET") {
    const match = subpath.match(/^\/posts\/([^/]+)\/applications$/);
    if (!match) return false;
    const params = parseWithSchema(shiftPostIdParamsSchema, { postId: match[1] });
    if (!params.ok) {
      return sendValidationError(res, requestId, "postId must be a valid UUID");
    }
    const result = await listApplicationsForOwnedPost(params.data.postId, req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ applications: result.applications }, requestId));
    return true;
  }

  if (method === "POST") {
    const match = subpath.match(/^\/posts\/([^/]+)\/applications\/([^/]+)\/status$/);
    if (!match) return false;
    const params = parseWithSchema(shiftConfirmParamsSchema, {
      postId: match[1],
      appId: match[2],
    });
    if (!params.ok) {
      return sendValidationError(res, requestId, "postId and appId must be valid UUIDs");
    }
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const parsed = parseWithSchema(patchShiftApplicationStatusBodySchema, body);
    if (!parsed.ok) {
      return sendValidationError(res, requestId, "Invalid application status");
    }
    const result = await patchOwnedApplicationStatus(
      params.data.postId,
      params.data.appId,
      parsed.data.status,
      req.authenticatedUser,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ application: result.application }, requestId));
    return true;
  }

  return false;
}
