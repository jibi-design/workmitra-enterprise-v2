/**
 * Defense Layer 4 — Calling domain Zod schemas.
 */

import { z } from "zod";

const mlId = z.string().min(1).max(128);

export const callInitiateBodySchema = z.object({
  workspaceId: z.string().min(1).max(128).optional(),
  workspace_id: z.string().min(1).max(128).optional(),
  receiverMl: mlId.optional(),
  receiver_ml: mlId.optional(),
  fcmToken: z.string().min(1).max(4096).optional(),
  fcm_token: z.string().min(1).max(4096).optional(),
  uid: z.union([z.number(), z.string()]).optional(),
});

export const callAnswerBodySchema = z.object({
  callSessionId: z.string().min(1).max(128).optional(),
  call_session_id: z.string().min(1).max(128).optional(),
  partyMl: mlId.optional(),
  party_ml: mlId.optional(),
  receiverMl: mlId.optional(),
  uid: z.union([z.number(), z.string()]).optional(),
});

export const callEndBodySchema = z.object({
  callSessionId: z.string().min(1).max(128).optional(),
  call_session_id: z.string().min(1).max(128).optional(),
  partyMl: mlId.optional(),
  party_ml: mlId.optional(),
  status: z.string().max(32).optional(),
});

export const callFallbackBodySchema = z.object({
  callSessionId: z.string().min(1).max(128).optional(),
  call_session_id: z.string().min(1).max(128).optional(),
  partyMl: mlId.optional(),
  party_ml: mlId.optional(),
  initiatorMl: mlId.optional(),
  toE164: z.string().min(1).max(32).optional(),
  to_e164: z.string().min(1).max(32).optional(),
  to: z.string().min(1).max(32).optional(),
});

export const callRegisterDeviceBodySchema = z.object({
  fcmToken: z.string().min(1).max(4096).optional(),
  fcm_token: z.string().min(1).max(4096).optional(),
  deviceId: z.string().min(1).max(256).optional(),
  device_id: z.string().min(1).max(256).optional(),
});

export type CallInitiateBody = z.infer<typeof callInitiateBodySchema>;
