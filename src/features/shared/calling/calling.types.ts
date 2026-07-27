/** Job Mitra | Phase 3 Calling — client types */

export type CallUiStatus =
  "idle" | "ringing" | "connecting" | "connected" | "failed" | "ended" | "declined";

export type CallSessionDto = {
  id: string;
  workspaceId: string;
  channelId: string;
  initiatorMl: string;
  receiverMl: string;
  status: string;
  startedAt: string;
  answeredAt: string | null;
  endedAt: string | null;
};

export type AgoraJoinCreds = {
  appId: string;
  channelId: string;
  token: string;
  uid: number;
};

export type InitiateCallInput = {
  workspaceId: string;
  initiatorMl: string;
  receiverMl: string;
  fcmToken?: string;
  uid?: number;
  /** Optional server-side Twilio fallback destination (E.164). Never shown in UI. */
  fallbackToE164?: string;
  /** Client no-answer timer; default 30000. */
  noAnswerMs?: number;
};

export type AnswerCallInput = {
  callSessionId: string;
  partyMl: string;
  uid?: number;
};
