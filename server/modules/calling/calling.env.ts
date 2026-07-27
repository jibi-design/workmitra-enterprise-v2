/** Job Mitra | Phase 3 Calling — env readiness (secrets never logged). */

import type { CallingConfigStatus } from "./calling.types.js";

export function isAgoraConfigured(): boolean {
  return Boolean(process.env.AGORA_APP_ID?.trim() && process.env.AGORA_APP_CERTIFICATE?.trim());
}

export function isFcmConfigured(): boolean {
  return Boolean(process.env.FCM_SERVER_KEY?.trim());
}

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
    process.env.TWILIO_AUTH_TOKEN?.trim() &&
    process.env.TWILIO_PROXY_NUMBER?.trim(),
  );
}

export function isCallingDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getCallingConfigStatus(): CallingConfigStatus {
  return {
    agora: isAgoraConfigured(),
    fcm: isFcmConfigured(),
    twilio: isTwilioConfigured(),
    database: isCallingDatabaseConfigured(),
  };
}

export function requireAgoraEnv(): { appId: string; appCertificate: string } {
  const appId = process.env.AGORA_APP_ID?.trim() ?? "";
  const appCertificate = process.env.AGORA_APP_CERTIFICATE?.trim() ?? "";
  if (!appId || !appCertificate) {
    throw new Error("AGORA_NOT_CONFIGURED");
  }
  return { appId, appCertificate };
}

export function requireFcmEnv(): { serverKey: string } {
  const serverKey = process.env.FCM_SERVER_KEY?.trim() ?? "";
  if (!serverKey) throw new Error("FCM_NOT_CONFIGURED");
  return { serverKey };
}

export function requireTwilioEnv(): {
  accountSid: string;
  authToken: string;
  proxyNumber: string;
} {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim() ?? "";
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim() ?? "";
  const proxyNumber = process.env.TWILIO_PROXY_NUMBER?.trim() ?? "";
  if (!accountSid || !authToken || !proxyNumber) {
    throw new Error("TWILIO_NOT_CONFIGURED");
  }
  return { accountSid, authToken, proxyNumber };
}
