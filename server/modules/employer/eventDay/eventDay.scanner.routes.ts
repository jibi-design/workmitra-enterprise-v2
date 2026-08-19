/** Employer scanner routes — unlock / lookup / consume. */

import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";
import { parseWithSchema, sendValidationError } from "../../../validation/zodParse.js";
import {
  eventDayScannerTokenBodySchema,
  eventDayScannerUnlockBodySchema,
} from "../../../validation/schemas/eventDay.schemas.js";
import { eventDayScannerService } from "./eventDay.scanner.service.js";

function sendFail(
  res: ServerResponse,
  requestId: string,
  result: { httpStatus: number; code: string; message: string },
): void {
  sendJson(res, result.httpStatus, {
    error: { code: result.code, message: result.message, requestId },
  });
}

async function readBodyOr413(
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
): Promise<unknown | null> {
  const body = await readJsonBody(req);
  if (body === null) {
    sendJson(res, 413, {
      error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
    });
    return null;
  }
  return body;
}

export async function handleEventDayScannerRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
  subpath: string,
): Promise<boolean> {
  const { requestId } = req;
  const user = req.authenticatedUser;

  if (method === "POST" && subpath === "/scanner/unlock") {
    const body = await readBodyOr413(req, res, requestId);
    if (body === null) return true;
    const parsed = parseWithSchema(eventDayScannerUnlockBodySchema, body);
    if (!parsed.ok) return sendValidationError(res, requestId, "Invalid scanner unlock body");
    const result = await eventDayScannerService.unlock(user, parsed.data.pin, parsed.data.folderId);
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(res, 200, envelope({ unlocked: true }, requestId));
    return true;
  }

  if (method === "GET" && subpath === "/scanner/lookup") {
    const token = url.searchParams.get("token") ?? "";
    const parsed = parseWithSchema(eventDayScannerTokenBodySchema, { token });
    if (!parsed.ok) return sendValidationError(res, requestId, "Invalid scanner token");
    const result = await eventDayScannerService.lookup(user, parsed.data.token);
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(res, 200, envelope({ pass: result.pass }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/scanner/consume") {
    const body = await readBodyOr413(req, res, requestId);
    if (body === null) return true;
    const parsed = parseWithSchema(eventDayScannerTokenBodySchema, body);
    if (!parsed.ok) return sendValidationError(res, requestId, "Invalid scanner consume body");
    const result = await eventDayScannerService.consume(
      user,
      parsed.data.token,
      parsed.data.folderId,
    );
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(
      res,
      201,
      envelope({ pass: result.pass, verifiedAt: result.verifiedAt }, requestId),
    );
    return true;
  }

  return false;
}
