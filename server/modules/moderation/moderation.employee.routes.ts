/** Employee report routes — Shift and Career paths stay domain-prefixed. */

import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../middleware/types.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { envelope, readJsonBody, sendJson } from "../../utils/http.js";
import { sendValidationError } from "../../validation/zodParse.js";
import {
  contentPostIdParamsSchema,
  createContentReportBodySchema,
} from "../../validation/schemas/moderation.schemas.js";
import { moderationService } from "./moderation.service.js";
import type { ContentReportDomain } from "./moderation.types.js";

const SHIFT_PREFIX = "/v1/jobmitra/employee/shift";
const CAREER_PREFIX = "/v1/jobmitra/employee/career";

function parseDomainPath(
  pathname: string,
): { domain: ContentReportDomain; subpath: string } | null {
  if (pathname.startsWith(SHIFT_PREFIX)) {
    return { domain: "shift", subpath: pathname.slice(SHIFT_PREFIX.length) || "/" };
  }
  if (pathname.startsWith(CAREER_PREFIX)) {
    return { domain: "career", subpath: pathname.slice(CAREER_PREFIX.length) || "/" };
  }
  return null;
}

export async function handleEmployeeModerationRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const parsed = parseDomainPath(url.pathname);
  if (!parsed) return false;

  const reportMatch = parsed.subpath.match(/^\/posts\/([^/]+)\/reports$/);
  const mineMatch = parsed.subpath.match(/^\/posts\/([^/]+)\/reports\/mine$/);
  if (!reportMatch && !mineMatch) return false;

  const { requestId } = req;
  const postIdRaw = decodeURIComponent((reportMatch ?? mineMatch)?.[1] ?? "");

  if (method === "GET" && mineMatch) {
    const params = contentPostIdParamsSchema.safeParse({ postId: postIdRaw });
    if (!params.success) return sendValidationError(res, requestId, "Invalid post id");
    const result = await moderationService.mine(req.authenticatedUser, parsed.domain, params.data.postId);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ reported: result.reported }, requestId));
    return true;
  }

  if (method === "POST" && reportMatch) {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const validated = validateRequest(
      {
        bodySchema: createContentReportBodySchema,
        paramsSchema: contentPostIdParamsSchema,
        body,
        params: { postId: postIdRaw },
      },
      res,
      requestId,
    );
    if (!validated.ok) return true;
    const result = await moderationService.createReport(
      req.authenticatedUser,
      parsed.domain,
      validated.params.postId,
      validated.body,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 201, envelope({ reportId: result.reportId, caseId: result.caseId }, requestId));
    return true;
  }

  return false;
}
