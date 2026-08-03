import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";
import { parseWithSchema, sendValidationError } from "../../../validation/zodParse.js";
import {
  applyShiftBodySchema,
  directAcceptBodySchema,
  shiftPostIdParamsSchema,
} from "../../../validation/schemas/shift.schemas.js";
import { acceptDirectInviteShift } from "../../employer/shift/shift.saga.js";
import { employeeShiftService } from "./shift.service.js";

const SHIFT_PREFIX = "/v1/jobmitra/employee/shift";

/**
 * Employee Shift route handler.
 * Behind requireAuth + requireEmployeeRole.
 * Layer 4: Zod schema validation + unknown-key strip.
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
    const params = parseWithSchema(shiftPostIdParamsSchema, { postId: applyMatch[1] });
    if (!params.ok) {
      return sendValidationError(res, requestId, "postId must be a valid UUID");
    }
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const parsed = parseWithSchema(applyShiftBodySchema, body);
    if (!parsed.ok) {
      return sendValidationError(res, requestId, "Invalid apply body");
    }

    const result = await employeeShiftService.applyToPost(
      params.data.postId,
      req.authenticatedUser,
      parsed.data as Record<string, unknown>,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 201, envelope({ application: result.application }, requestId));
    return true;
  }

  // POST /v1/jobmitra/employee/shift/posts/:postId/direct-accept
  const directAcceptMatch = subpath.match(/^\/posts\/([^/]+)\/direct-accept$/);
  if (method === "POST" && directAcceptMatch) {
    const params = parseWithSchema(shiftPostIdParamsSchema, { postId: directAcceptMatch[1] });
    if (!params.ok) {
      return sendValidationError(res, requestId, "postId must be a valid UUID");
    }
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const parsed = parseWithSchema(directAcceptBodySchema, body);
    if (!parsed.ok) {
      return sendValidationError(res, requestId, "Invalid direct-accept body");
    }

    const result = await acceptDirectInviteShift(
      params.data.postId,
      req.authenticatedUser,
      parsed.data as Record<string, unknown>,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(
      res,
      200,
      envelope(
        {
          workspace: result.workspace,
          application: result.application,
          events: result.events,
        },
        requestId,
      ),
    );
    return true;
  }

  sendJson(res, 404, {
    error: { code: "NOT_FOUND", message: "Employee shift route not found", requestId },
  });
  return true;
}
