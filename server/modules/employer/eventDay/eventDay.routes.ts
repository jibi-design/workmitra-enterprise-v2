/**
 * Employer Event Day API — /v1/jobmitra/employer/event-day/*
 * Behind requireAuth + roleGateEmployer. Draft until migration 020 is applied.
 */

import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";
import { parseWithSchema, sendValidationError } from "../../../validation/zodParse.js";
import {
  createEventDayPassBodySchema,
  eventDayFolderIdParamsSchema,
  eventDayPassIdParamsSchema,
  eventDayScanVerifyBodySchema,
  putEventDayGatePinBodySchema,
} from "../../../validation/schemas/eventDay.schemas.js";
import { idempotencyStore, readIdempotencyKey } from "../../shared/idempotency.store.js";
import { employerEventDayService } from "./eventDay.service.js";
import { handleEventDayScannerRoutes } from "./eventDay.scanner.routes.js";

export const EVENT_DAY_API_PREFIX = "/v1/jobmitra/employer/event-day";

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

export async function handleEmployerEventDayRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const pathname = url.pathname;
  if (!pathname.startsWith(EVENT_DAY_API_PREFIX)) return false;

  const { requestId } = req;
  const subpath = pathname.slice(EVENT_DAY_API_PREFIX.length) || "/";
  const user = req.authenticatedUser;

  if (await handleEventDayScannerRoutes(req, res, url, method, subpath)) return true;

  if (method === "GET" && subpath === "/passes") {
    const result = await employerEventDayService.listPasses(user);
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(res, 200, envelope({ passes: result.passes }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/passes") {
    const body = await readBodyOr413(req, res, requestId);
    if (body === null) return true;
    const parsed = parseWithSchema(createEventDayPassBodySchema, body);
    if (!parsed.ok) return sendValidationError(res, requestId, "Invalid Event Day pass body");
    const idemKey = readIdempotencyKey(req.headers);
    if (idemKey) {
      const cached = await idempotencyStore.get(user.id, idemKey);
      if (cached) {
        sendJson(res, cached.httpStatus, cached.body);
        return true;
      }
    }
    const result = await employerEventDayService.createPass(user, parsed.data);
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    const okBody = envelope({ pass: result.pass, passToken: result.passToken }, requestId);
    if (idemKey) await idempotencyStore.put(user.id, idemKey, 201, okBody);
    sendJson(res, 201, okBody);
    return true;
  }

  const revokeMatch = subpath.match(/^\/passes\/([^/]+)\/revoke$/);
  if (method === "POST" && revokeMatch) {
    const params = parseWithSchema(eventDayPassIdParamsSchema, { passId: revokeMatch[1] });
    if (!params.ok) return sendValidationError(res, requestId, "passId must be a valid UUID");
    const result = await employerEventDayService.revokePass(user, params.data.passId);
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(res, 200, envelope({ pass: result.pass }, requestId));
    return true;
  }

  if (method === "GET" && subpath === "/gate-pin") {
    const folderId = url.searchParams.get("folderId") ?? undefined;
    const result = await employerEventDayService.getGatePin(user, folderId || undefined);
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(res, 200, envelope({ pinSet: result.pinSet, updatedAt: result.updatedAt }, requestId));
    return true;
  }

  if (method === "PUT" && subpath === "/gate-pin") {
    const body = await readBodyOr413(req, res, requestId);
    if (body === null) return true;
    const parsed = parseWithSchema(putEventDayGatePinBodySchema, body);
    if (!parsed.ok) return sendValidationError(res, requestId, "Invalid gate PIN body");
    const result = await employerEventDayService.putGatePin(user, parsed.data.pin, parsed.data.folderId);
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(res, 200, envelope({ pinSet: result.pinSet, updatedAt: result.updatedAt }, requestId));
    return true;
  }

  if (method === "GET" && subpath === "/report/folders") {
    const result = await employerEventDayService.listFolders(user);
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(res, 200, envelope({ folders: result.folders }, requestId));
    return true;
  }

  const folderMatch = subpath.match(/^\/report\/folders\/([^/]+)$/);
  if (folderMatch) {
    const params = parseWithSchema(eventDayFolderIdParamsSchema, {
      folderId: decodeURIComponent(folderMatch[1] ?? ""),
    });
    if (!params.ok) return sendValidationError(res, requestId, "Invalid folderId");
    if (method === "GET") {
      const result = await employerEventDayService.getFolder(user, params.data.folderId);
      if (!result.ok) {
        sendFail(res, requestId, result);
        return true;
      }
      sendJson(res, 200, envelope({ folder: result.folder, rows: result.rows }, requestId));
      return true;
    }
    if (method === "DELETE") {
      const result = await employerEventDayService.deleteFolder(user, params.data.folderId);
      if (!result.ok) {
        sendFail(res, requestId, result);
        return true;
      }
      sendJson(res, 200, envelope({ deletedPassCount: result.deletedPassCount }, requestId));
      return true;
    }
  }

  if (method === "GET" && subpath === "/check-ins") {
    const result = await employerEventDayService.listCheckIns(user);
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(res, 200, envelope({ checkIns: result.checkIns }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/scan-verify") {
    const body = await readBodyOr413(req, res, requestId);
    if (body === null) return true;
    const parsed = parseWithSchema(eventDayScanVerifyBodySchema, body);
    if (!parsed.ok) return sendValidationError(res, requestId, "Invalid scan-verify body");
    const result = await employerEventDayService.scanVerify(
      user,
      parsed.data.passId,
      parsed.data.deviceId,
    );
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(res, 201, envelope({ checkIn: result.checkIn }, requestId));
    return true;
  }

  sendJson(res, 404, {
    error: { code: "NOT_FOUND", message: "Event Day route not found", requestId },
  });
  return true;
}
