/**
 * Job Mitra | Phase 3 Calling — end + fallback + status handlers
 * Path: server/routes/calling.endFallback.handlers.ts
 */

import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../middleware/types.js";
import { getCallSession, updateCallSessionStatus } from "../modules/calling/callSession.service.js";
import { getCallingConfigStatus } from "../modules/calling/calling.env.js";
import { initiatePhoneCallFallback } from "../modules/calling/twilioFallback.service.js";
import type { CallSessionStatus } from "../modules/calling/calling.types.js";
import { envelope, readJsonBody, sendJson } from "../utils/http.js";
import { asString, isParty, normalizeMl } from "./calling.httpHelpers.js";
import { parseWithSchema } from "../validation/zodParse.js";
import {
  callEndBodySchema,
  callFallbackBodySchema,
} from "../validation/schemas/calling.schemas.js";

export async function handleEnd(req: AuthenticatedRequest, res: ServerResponse): Promise<void> {
  const { requestId } = req;
  const body = await readJsonBody(req);
  if (body === null) {
    sendJson(res, 413, {
      error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
    });
    return;
  }

  const parsed = parseWithSchema(callEndBodySchema, body);
  if (!parsed.ok) {
    sendJson(res, 400, {
      error: { code: "VALIDATION_ERROR", message: "Invalid call end body", requestId },
    });
    return;
  }

  const callSessionId = asString(parsed.data.callSessionId ?? parsed.data.call_session_id);
  const partyMl = normalizeMl(asString(parsed.data.partyMl ?? parsed.data.party_ml));
  const rawStatus = asString(parsed.data.status).toLowerCase();
  const nextStatus: CallSessionStatus =
    rawStatus === "declined" || rawStatus === "failed" ? rawStatus : "ended";

  if (!callSessionId || !partyMl) {
    sendJson(res, 400, {
      error: {
        code: "CALL_INVALID_INPUT",
        message: "callSessionId and partyMl are required",
        requestId,
      },
    });
    return;
  }

  const existing = await getCallSession(callSessionId);
  if (!existing) {
    sendJson(res, 404, {
      error: { code: "CALL_NOT_FOUND", message: "Call session not found", requestId },
    });
    return;
  }

  if (!isParty(existing, partyMl)) {
    sendJson(res, 403, {
      error: {
        code: "CALL_NOT_PARTY",
        message: "Only call parties may end this call",
        requestId,
      },
    });
    return;
  }

  if (
    existing.status === "ended" ||
    existing.status === "declined" ||
    existing.status === "failed"
  ) {
    sendJson(res, 200, envelope({ session: existing }, requestId));
    return;
  }

  const session = await updateCallSessionStatus(callSessionId, nextStatus);
  sendJson(res, 200, envelope({ session }, requestId));
}

export async function handleFallback(
  req: AuthenticatedRequest,
  res: ServerResponse,
): Promise<void> {
  const { requestId } = req;
  const body = await readJsonBody(req);
  if (body === null) {
    sendJson(res, 413, {
      error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
    });
    return;
  }

  const parsed = parseWithSchema(callFallbackBodySchema, body);
  if (!parsed.ok) {
    sendJson(res, 400, {
      error: { code: "VALIDATION_ERROR", message: "Invalid call fallback body", requestId },
    });
    return;
  }

  const callSessionId = asString(parsed.data.callSessionId ?? parsed.data.call_session_id);
  const partyMl = normalizeMl(
    asString(parsed.data.partyMl ?? parsed.data.party_ml ?? parsed.data.initiatorMl),
  );
  const toE164 = asString(parsed.data.toE164 ?? parsed.data.to_e164 ?? parsed.data.to);

  if (!callSessionId || !partyMl || !toE164) {
    sendJson(res, 400, {
      error: {
        code: "CALL_INVALID_INPUT",
        message: "callSessionId, partyMl, and toE164 are required",
        requestId,
      },
    });
    return;
  }

  const existing = await getCallSession(callSessionId);
  if (!existing) {
    sendJson(res, 404, {
      error: { code: "CALL_NOT_FOUND", message: "Call session not found", requestId },
    });
    return;
  }

  if (normalizeMl(partyMl) !== existing.initiatorMl) {
    sendJson(res, 403, {
      error: {
        code: "CALL_NOT_INITIATOR",
        message: "Only the initiator may trigger PSTN fallback",
        requestId,
      },
    });
    return;
  }

  if (existing.status !== "ringing" && existing.status !== "answered") {
    sendJson(res, 409, {
      error: {
        code: "CALL_FALLBACK_NOT_ALLOWED",
        message: `Cannot fallback from status ${existing.status}`,
        requestId,
      },
    });
    return;
  }

  const result = await initiatePhoneCallFallback({
    toE164,
    callSessionId,
    workspaceId: existing.workspaceId,
  });

  if (!result.ok) {
    const status = result.code === "TWILIO_NOT_CONFIGURED" ? 503 : 502;
    sendJson(res, status, {
      error: { code: result.code, message: result.message, requestId },
    });
    return;
  }

  const session = await getCallSession(callSessionId);
  sendJson(res, 200, envelope({ session, twilioCallSid: result.callSid }, requestId));
}

export async function handleStatus(req: AuthenticatedRequest, res: ServerResponse): Promise<void> {
  sendJson(
    res,
    200,
    envelope(
      {
        config: getCallingConfigStatus(),
        actorUserId: req.authenticatedUser.id,
      },
      req.requestId,
    ),
  );
}
