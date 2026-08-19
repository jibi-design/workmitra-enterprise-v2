/**
 * Public Event Day API — /v1/jobmitra/public/event-day/*
 * Unauthenticated gate. Draft until migration 020 is applied.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { getRequestId } from "../../../middleware/index.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";
import { parseWithSchema, sendValidationError } from "../../../validation/zodParse.js";
import {
  eventDayPublicCheckInBodySchema,
  eventDayPublicTokenParamsSchema,
} from "../../../validation/schemas/eventDay.schemas.js";
import { publicEventDayService } from "./eventDay.public.service.js";

export const PUBLIC_EVENT_DAY_API_PREFIX = "/v1/jobmitra/public/event-day";

function sendFail(
  res: ServerResponse,
  requestId: string,
  result: { httpStatus: number; code: string; message: string },
): void {
  sendJson(res, result.httpStatus, {
    error: { code: result.code, message: result.message, requestId },
  });
}

function decodePassToken(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function handlePublicEventDayRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const pathname = url.pathname;
  if (!pathname.startsWith(PUBLIC_EVENT_DAY_API_PREFIX)) return false;

  const requestId = getRequestId();
  const subpath = pathname.slice(PUBLIC_EVENT_DAY_API_PREFIX.length) || "/";

  if (method === "GET" && subpath.startsWith("/passes/")) {
    const token = decodePassToken(subpath.slice("/passes/".length));
    const parsed = parseWithSchema(eventDayPublicTokenParamsSchema, { token });
    if (!parsed.ok) return sendValidationError(res, requestId, "Invalid Event Day pass token");
    const result = await publicEventDayService.getPassByToken(parsed.data.token);
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(res, 200, envelope({ pass: result.pass }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/check-in") {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const parsed = parseWithSchema(eventDayPublicCheckInBodySchema, body);
    if (!parsed.ok) return sendValidationError(res, requestId, "Invalid Event Day check-in body");
    const result = await publicEventDayService.checkIn(parsed.data);
    if (!result.ok) {
      sendFail(res, requestId, result);
      return true;
    }
    sendJson(
      res,
      200,
      envelope(
        {
          entered: result.entered,
          verifiedAt: result.verifiedAt,
          guestName: result.guestName,
          venueName: result.venueName,
        },
        requestId,
      ),
    );
    return true;
  }

  sendJson(res, 404, {
    error: { code: "NOT_FOUND", message: "Public Event Day route not found", requestId },
  });
  return true;
}
