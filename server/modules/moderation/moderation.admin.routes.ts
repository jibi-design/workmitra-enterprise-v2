/** Admin moderation queue — requireAuth + admin role. */

import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { requireAuth } from "../../middleware/index.js";
import { requireAdminRole } from "../../middleware/requireRole.js";
import type { AuthenticatedRequest } from "../../middleware/types.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { envelope, readJsonBody, sendJson } from "../../utils/http.js";
import {
  moderationActionBodySchema,
  moderationCaseIdParamsSchema,
} from "../../validation/schemas/moderation.schemas.js";
import { moderationService } from "./moderation.service.js";
import type { ContentCaseStatus } from "./moderation.types.js";

const PREFIX = "/v1/jobmitra/admin/moderation";

const QUEUE_STATUSES = new Set<ContentCaseStatus>([
  "open",
  "triage",
  "held",
  "cleared",
  "removed",
]);

export async function handleAdminModerationRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(PREFIX)) return false;
  const requestId = randomUUID();
  await requireAuth(req, res, requestId, async (authedReq) => {
    await requireAdminRole(
      authedReq,
      res,
      requestId,
      async (adminReq) => {
        await dispatchAdminModeration(adminReq, res, url, method);
      },
      url,
    );
  }, url);
  return true;
}

async function dispatchAdminModeration(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<void> {
  const { requestId } = req;
  const subpath = url.pathname.slice(PREFIX.length) || "/";

  if (method === "GET" && (subpath === "/" || subpath === "/cases")) {
    const raw = url.searchParams.get("status");
    const status =
      raw === "all"
        ? "all"
        : raw && QUEUE_STATUSES.has(raw as ContentCaseStatus)
          ? (raw as ContentCaseStatus)
          : undefined;
    const result = await moderationService.listCases(status);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return;
    }
    sendJson(res, 200, envelope({ cases: result.cases }, requestId));
    return;
  }

  const actionMatch = subpath.match(/^\/cases\/([^/]+)\/actions$/);
  if (method === "POST" && actionMatch) {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return;
    }
    const validated = validateRequest(
      {
        bodySchema: moderationActionBodySchema,
        paramsSchema: moderationCaseIdParamsSchema,
        body,
        params: { caseId: actionMatch[1] },
      },
      res,
      requestId,
    );
    if (!validated.ok) return;
    const result = await moderationService.act(
      req.authenticatedUser,
      validated.params.caseId,
      validated.body.action,
      validated.body.note,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return;
    }
    sendJson(res, 200, envelope({ ok: true }, requestId));
    return;
  }

  sendJson(res, 404, {
    error: { code: "NOT_FOUND", message: "Moderation route not found", requestId },
  });
}
