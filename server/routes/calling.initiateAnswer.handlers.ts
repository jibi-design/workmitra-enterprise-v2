/**
 * Job Mitra | Phase 3 Calling — initiate + answer handlers
 * Path: server/routes/calling.initiateAnswer.handlers.ts
 * Wave-5: session-bound ML + workspace membership before Agora/FCM
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
import {
  assertAnswerParty,
  resolveAuthorizedCallParties,
} from "../modules/calling/calling.membership.js";
import { sendIncomingCallPush } from "../modules/calling/fcmCallNotify.service.js";
import { envelope, readJsonBody, sendJson } from "../utils/http.js";
import { agoraAppIdPublic, asString, asUid, normalizeMl } from "./calling.httpHelpers.js";
import { fcmDeviceTokenStore } from "../modules/calling/fcmDeviceToken.store.js";
import { parseWithSchema } from "../validation/zodParse.js";
import {
  callAnswerBodySchema,
  callInitiateBodySchema,
  callRegisterDeviceBodySchema,
} from "../validation/schemas/calling.schemas.js";

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

  const parsed = parseWithSchema(callInitiateBodySchema, body);
  if (!parsed.ok) {
    sendJson(res, 400, {
      error: { code: "VALIDATION_ERROR", message: "Invalid call initiate body", requestId },
    });
    return;
  }

  const workspaceId = asString(parsed.data.workspaceId ?? parsed.data.workspace_id);
  const requestedReceiverMl = normalizeMl(
    asString(parsed.data.receiverMl ?? parsed.data.receiver_ml),
  );
  const clientFcmHint = asString(parsed.data.fcmToken ?? parsed.data.fcm_token);
  const uid = asUid(parsed.data.uid);

  if (!workspaceId || !requestedReceiverMl) {
    sendJson(res, 400, {
      error: {
        code: "CALL_INVALID_INPUT",
        message: "workspaceId and receiverMl are required",
        requestId,
      },
    });
    return;
  }

  const membership = await resolveAuthorizedCallParties({
    workspaceId,
    sessionUser: req.authenticatedUser,
    requestedReceiverMl,
  });
  if (!membership.ok) {
    sendJson(res, membership.httpStatus, {
      error: { code: membership.code, message: membership.message, requestId },
    });
    return;
  }

  const { initiatorMl, receiverMl, workspaceId: verifiedWorkspaceId } = membership;

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
    workspaceId: verifiedWorkspaceId,
    channelId,
    initiatorMl,
    receiverMl,
  });

  let token: string;
  try {
    token = generateRtcToken(channelId, uid, "publisher");
  } catch (err) {
    console.error("[Agora] RTC token mint failed:", err);
    sendJson(res, 503, {
      error: {
        code: "AGORA_TOKEN_FAILED",
        message: "Failed to mint Agora RTC token",
        requestId,
      },
    });
    return;
  }

  // Wave-5.1 R3: only push to server-registered FCM for the verified receiver
  let push: { ok: boolean; code?: string } | null = null;
  const registeredFcm = await fcmDeviceTokenStore.resolvePushToken(
    receiverMl,
    clientFcmHint || undefined,
  );
  if (registeredFcm) {
    const pushResult = await sendIncomingCallPush({
      fcmToken: registeredFcm,
      callSessionId: session.id,
      channelId,
      workspaceId: verifiedWorkspaceId,
      initiatorMl,
      receiverMl,
    });
    push = pushResult.ok ? { ok: true } : { ok: false, code: pushResult.code };
  } else if (clientFcmHint) {
    push = { ok: false, code: "FCM_TOKEN_NOT_REGISTERED" };
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

  const parsed = parseWithSchema(callAnswerBodySchema, body);
  if (!parsed.ok) {
    sendJson(res, 400, {
      error: { code: "VALIDATION_ERROR", message: "Invalid call answer body", requestId },
    });
    return;
  }

  const callSessionId = asString(parsed.data.callSessionId ?? parsed.data.call_session_id);
  const claimedPartyMl = normalizeMl(
    asString(parsed.data.partyMl ?? parsed.data.party_ml ?? parsed.data.receiverMl),
  );
  const uid = asUid(parsed.data.uid);

  if (!callSessionId) {
    sendJson(res, 400, {
      error: {
        code: "CALL_INVALID_INPUT",
        message: "callSessionId is required",
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

  const answerAuth = await assertAnswerParty({
    sessionUser: req.authenticatedUser,
    callReceiverMl: existing.receiverMl,
    claimedPartyMl: claimedPartyMl || req.authenticatedUser.id,
  });
  if (!answerAuth.ok) {
    sendJson(res, answerAuth.httpStatus, {
      error: { code: answerAuth.code, message: answerAuth.message, requestId },
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
    console.error("[Agora] RTC token mint failed (answer):", err);
    sendJson(res, 503, {
      error: {
        code: "AGORA_TOKEN_FAILED",
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

/** Wave-5.1 R3: bind FCM device token to authenticated session user */
export async function handleRegisterDevice(
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

  const parsed = parseWithSchema(callRegisterDeviceBodySchema, body);
  if (!parsed.ok) {
    sendJson(res, 400, {
      error: { code: "VALIDATION_ERROR", message: "Invalid register-device body", requestId },
    });
    return;
  }

  const fcmToken = asString(parsed.data.fcmToken ?? parsed.data.fcm_token);
  if (!fcmToken) {
    sendJson(res, 400, {
      error: { code: "FCM_TOKEN_REQUIRED", message: "fcmToken is required", requestId },
    });
    return;
  }

  const registered = await fcmDeviceTokenStore.register(req.authenticatedUser.id, fcmToken);
  if (!registered.ok) {
    sendJson(res, 400, {
      error: { code: registered.code, message: "Invalid FCM token", requestId },
    });
    return;
  }

  sendJson(res, 200, envelope({ registered: true, userId: req.authenticatedUser.id }, requestId));
}
