/**
 * Job Mitra | Phase 3 Calling — initiate + answer handlers
 * Path: server/routes/calling.initiateAnswer.handlers.ts
 */

import { randomUUID } from "node:crypto";
import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../middleware/types.js";
import { generateRtcToken } from "../modules/calling/agoraToken.service.js";
import {
  createCallSession,
  getCallSession,
  updateCallSessionStatus,
} from "../modules/calling/callSession.service.js";
import { isAgoraConfigured } from "../modules/calling/calling.env.js";
import { sendIncomingCallPush } from "../modules/calling/fcmCallNotify.service.js";
import { envelope, readJsonBody, sendJson } from "../utils/http.js";
import { agoraAppIdPublic, asString, asUid, normalizeMl } from "./calling.httpHelpers.js";

export async function handleInitiate(
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

  const workspaceId = asString(body.workspaceId ?? body.workspace_id);
  const initiatorMl = normalizeMl(asString(body.initiatorMl ?? body.initiator_ml));
  const receiverMl = normalizeMl(asString(body.receiverMl ?? body.receiver_ml));
  const fcmToken = asString(body.fcmToken ?? body.fcm_token);
  const uid = asUid(body.uid);

  if (!workspaceId || !initiatorMl || !receiverMl) {
    sendJson(res, 400, {
      error: {
        code: "CALL_INVALID_INPUT",
        message: "workspaceId, initiatorMl, and receiverMl are required",
        requestId,
      },
    });
    return;
  }

  if (initiatorMl === receiverMl) {
    sendJson(res, 400, {
      error: {
        code: "CALL_SAME_PARTY",
        message: "initiatorMl and receiverMl must differ",
        requestId,
      },
    });
    return;
  }

  if (!isAgoraConfigured()) {
    sendJson(res, 503, {
      error: {
        code: "AGORA_NOT_CONFIGURED",
        message: "Set AGORA_APP_ID and AGORA_APP_CERTIFICATE on the API server.",
        requestId,
      },
    });
    return;
  }

  const channelId = `wm-call-${randomUUID()}`;
  const session = await createCallSession({
    workspaceId,
    channelId,
    initiatorMl,
    receiverMl,
  });

  let token: string;
  try {
    token = generateRtcToken(channelId, uid, "publisher");
  } catch (err) {
    sendJson(res, 503, {
      error: {
        code: err instanceof Error ? err.message : "AGORA_TOKEN_FAILED",
        message: "Failed to mint Agora RTC token",
        requestId,
      },
    });
    return;
  }

  let push: { ok: boolean; code?: string } | null = null;
  if (fcmToken) {
    const pushResult = await sendIncomingCallPush({
      fcmToken,
      callSessionId: session.id,
      channelId,
      workspaceId,
      initiatorMl,
      receiverMl,
    });
    push = pushResult.ok ? { ok: true } : { ok: false, code: pushResult.code };
  }

  sendJson(
    res,
    201,
    envelope(
      {
        session,
        agora: {
          appId: agoraAppIdPublic(),
          channelId,
          token,
          uid,
          role: "publisher",
        },
        push,
        actorUserId: req.authenticatedUser.id,
      },
      requestId,
    ),
  );
}

export async function handleAnswer(req: AuthenticatedRequest, res: ServerResponse): Promise<void> {
  const { requestId } = req;
  const body = await readJsonBody(req);
  if (body === null) {
    sendJson(res, 413, {
      error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
    });
    return;
  }

  const callSessionId = asString(body.callSessionId ?? body.call_session_id);
  const partyMl = normalizeMl(asString(body.partyMl ?? body.party_ml ?? body.receiverMl));
  const uid = asUid(body.uid);

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

  if (normalizeMl(partyMl) !== existing.receiverMl) {
    sendJson(res, 403, {
      error: {
        code: "CALL_NOT_RECEIVER",
        message: "Only the receiver may answer this call",
        requestId,
      },
    });
    return;
  }

  if (existing.status !== "ringing") {
    sendJson(res, 409, {
      error: {
        code: "CALL_NOT_RINGING",
        message: `Call status is ${existing.status}`,
        requestId,
      },
    });
    return;
  }

  if (!isAgoraConfigured()) {
    sendJson(res, 503, {
      error: {
        code: "AGORA_NOT_CONFIGURED",
        message: "Set AGORA_APP_ID and AGORA_APP_CERTIFICATE on the API server.",
        requestId,
      },
    });
    return;
  }

  const session = await updateCallSessionStatus(callSessionId, "answered");
  if (!session) {
    sendJson(res, 404, {
      error: { code: "CALL_NOT_FOUND", message: "Call session not found", requestId },
    });
    return;
  }

  let token: string;
  try {
    token = generateRtcToken(session.channelId, uid, "publisher");
  } catch (err) {
    sendJson(res, 503, {
      error: {
        code: err instanceof Error ? err.message : "AGORA_TOKEN_FAILED",
        message: "Failed to mint Agora RTC token",
        requestId,
      },
    });
    return;
  }

  sendJson(
    res,
    200,
    envelope(
      {
        session,
        agora: {
          appId: agoraAppIdPublic(),
          channelId: session.channelId,
          token,
          uid,
          role: "publisher",
        },
        actorUserId: req.authenticatedUser.id,
      },
      requestId,
    ),
  );
}
