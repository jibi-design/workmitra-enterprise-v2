/**
 * Job Mitra | Phase 3 Calling — FCM incoming-call push
 * Path: server/modules/calling/fcmCallNotify.service.ts
 *
 * Uses legacy FCM HTTP API (FCM_SERVER_KEY). No phone numbers in payload.
 */

import { requireFcmEnv } from "./calling.env.js";
import type { IncomingCallPushInput } from "./calling.types.js";

export type FcmPushResult =
  { ok: true; messageId: string | null } | { ok: false; code: string; message: string };

const FCM_ENDPOINT = "https://fcm.googleapis.com/fcm/send";

/**
 * Send a high-priority data+notification push for an incoming in-app call.
 */
export async function sendIncomingCallPush(input: IncomingCallPushInput): Promise<FcmPushResult> {
  const fcmToken = input.fcmToken.trim();
  if (!fcmToken) {
    return { ok: false, code: "FCM_TOKEN_REQUIRED", message: "Receiver FCM token missing." };
  }

  let serverKey: string;
  try {
    serverKey = requireFcmEnv().serverKey;
  } catch {
    return {
      ok: false,
      code: "FCM_NOT_CONFIGURED",
      message: "Set FCM_SERVER_KEY on the API server.",
    };
  }

  const payload = {
    to: fcmToken,
    priority: "high",
    content_available: true,
    notification: {
      title: "Incoming call",
      body: "Open Job Mitra to answer",
      sound: "default",
    },
    data: {
      type: "incoming_call",
      callSessionId: input.callSessionId,
      channelId: input.channelId,
      workspaceId: input.workspaceId,
      initiatorMl: input.initiatorMl.trim().toUpperCase(),
      receiverMl: input.receiverMl.trim().toUpperCase(),
    },
  };

  try {
    const res = await fetch(FCM_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `key=${serverKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false,
        code: "FCM_HTTP_ERROR",
        message: `FCM responded ${res.status}`,
      };
    }

    let messageId: string | null = null;
    try {
      const parsed = JSON.parse(text) as { message_id?: string | number; multicast_id?: number };
      if (parsed.message_id != null) messageId = String(parsed.message_id);
    } catch {
      // non-JSON success body — still ok
    }

    return { ok: true, messageId };
  } catch (err) {
    return {
      ok: false,
      code: "FCM_NETWORK_ERROR",
      message: err instanceof Error ? err.message : "FCM request failed",
    };
  }
}
