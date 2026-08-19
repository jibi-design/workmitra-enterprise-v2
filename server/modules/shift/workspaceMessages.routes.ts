/** Job Mitra API | GET/POST /posts/:postId/workspace-messages */

import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../middleware/index.js";
import { envelope, readJsonBody, sendJson } from "../../utils/http.js";
import { parseWithSchema, sendValidationError } from "../../validation/zodParse.js";
import {
  shiftPostIdParamsSchema,
  workspaceMessageBodySchema,
} from "../../validation/schemas/shift.schemas.js";
import {
  listAllShiftWorkspaceMessages,
  listShiftWorkspaceMessages,
  postShiftWorkspaceMessage,
} from "./workspaceMessages.service.js";

export async function tryHandleWorkspaceMessageRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
  prefix: string,
  role: "employee" | "employer",
): Promise<boolean> {
  const pathname = url.pathname;
  if (!pathname.startsWith(prefix)) return false;
  const subpath = pathname.slice(prefix.length) || "/";
  const { requestId } = req;

  if (method === "GET" && subpath === "/workspace-messages") {
    const result = await listAllShiftWorkspaceMessages(req.authenticatedUser, role);
    sendJson(res, 200, envelope({ messages: result.messages }, requestId));
    return true;
  }

  const match = subpath.match(/^\/posts\/([^/]+)\/workspace-messages$/);
  if (!match) return false;
  const params = parseWithSchema(shiftPostIdParamsSchema, { postId: match[1] });
  if (!params.ok) {
    return sendValidationError(res, requestId, "postId must be a valid UUID");
  }

  if (method === "GET") {
    const result = await listShiftWorkspaceMessages(
      req.authenticatedUser,
      role,
      params.data.postId,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ messages: result.messages }, requestId));
    return true;
  }

  if (method === "POST") {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const parsed = parseWithSchema(workspaceMessageBodySchema, body);
    if (!parsed.ok) {
      return sendValidationError(res, requestId, "Invalid workspace message");
    }
    const result = await postShiftWorkspaceMessage(
      req.authenticatedUser,
      role,
      params.data.postId,
      {
        kind: parsed.data.kind,
        title: parsed.data.title ?? "",
        body: parsed.data.body ?? "",
      },
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 201, envelope({ message: result.message }, requestId));
    return true;
  }

  return false;
}
