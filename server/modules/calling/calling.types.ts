/** Job Mitra | Phase 3 Calling — shared types */

export type CallSessionStatus =
  "ringing" | "answered" | "ended" | "declined" | "failed" | "fallback";

export type AgoraRtcRole = "publisher" | "subscriber";

export type CallSession = {
  id: string;
  workspaceId: string;
  channelId: string;
  initiatorMl: string;
  receiverMl: string;
  status: CallSessionStatus;
  startedAt: string;
  answeredAt: string | null;
  endedAt: string | null;
};

export type CreateCallSessionInput = {
  workspaceId: string;
  channelId: string;
  initiatorMl: string;
  receiverMl: string;
};

export type IncomingCallPushInput = {
  /** FCM device token for the receiver. */
  fcmToken: string;
  callSessionId: string;
  channelId: string;
  workspaceId: string;
  initiatorMl: string;
  receiverMl: string;
};

export type TwilioFallbackInput = {
  /** E.164 destination — never logged in full. */
  toE164: string;
  callSessionId: string;
  workspaceId: string;
  /** Optional absolute callback URL for status webhooks. */
  statusCallbackUrl?: string;
};

export type CallingConfigStatus = {
  agora: boolean;
  fcm: boolean;
  twilio: boolean;
  database: boolean;
};
