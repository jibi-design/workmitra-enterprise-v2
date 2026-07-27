/**
 * Job Mitra | Phase 3 Calling — Twilio PSTN fallback (masked proxy number)
 * Path: server/modules/calling/twilioFallback.service.ts
 *
 * Platform lock: no tel:/wa.me from client. Server-only proxy dial when Agora unanswered.
 * Never log full E.164 numbers.
 */

import twilio from "twilio";
import { requireTwilioEnv } from "./calling.env.js";
import { updateCallSessionStatus } from "./callSession.service.js";

export type TwilioFallbackResult =
  { ok: true; callSid: string } | { ok: false; code: string; message: string };

function maskE164(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***${digits.slice(-4)}`;
}

/**
 * Place a masked PSTN call via Twilio proxy number (no direct contact unlock).
 */
export async function initiatePhoneCallFallback(input: {
  toE164: string;
  callSessionId: string;
  workspaceId: string;
  statusCallbackUrl?: string;
}): Promise<TwilioFallbackResult> {
  const to = input.toE164.trim();
  if (!to.startsWith("+") || to.length < 8) {
    return { ok: false, code: "TWILIO_INVALID_TO", message: "Destination must be E.164." };
  }

  let env: { accountSid: string; authToken: string; proxyNumber: string };
  try {
    env = requireTwilioEnv();
  } catch {
    return {
      ok: false,
      code: "TWILIO_NOT_CONFIGURED",
      message: "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PROXY_NUMBER on the API server.",
    };
  }

  const twiml =
    '<Response><Say voice="alice">Job Mitra call. Connecting you now.</Say><Pause length="2"/></Response>';

  try {
    const client = twilio(env.accountSid, env.authToken);
    const call = await client.calls.create({
      to,
      from: env.proxyNumber,
      twiml,
      ...(input.statusCallbackUrl
        ? { statusCallback: input.statusCallbackUrl, statusCallbackEvent: ["completed"] }
        : {}),
    });

    await updateCallSessionStatus(input.callSessionId, "fallback");

    console.info(
      `[calling] Twilio fallback started session=${input.callSessionId} to=${maskE164(to)} sid=${call.sid}`,
    );

    return { ok: true, callSid: call.sid };
  } catch (err) {
    console.warn(
      `[calling] Twilio fallback failed session=${input.callSessionId} to=${maskE164(to)}:`,
      err instanceof Error ? err.message : "unknown",
    );
    return {
      ok: false,
      code: "TWILIO_API_ERROR",
      message: err instanceof Error ? err.message : "Twilio call failed",
    };
  }
}
