/**
 * Job Mitra | Phase 3 Calling — Agora RTC token mint
 * Path: server/modules/calling/agoraToken.service.ts
 */

import { RtcRole, RtcTokenBuilder } from "agora-token";
import { requireAgoraEnv } from "./calling.env.js";
import type { AgoraRtcRole } from "./calling.types.js";

const DEFAULT_TTL_SECONDS = 3600;

function mapRole(role: AgoraRtcRole): 1 | 2 {
  return role === "subscriber" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
}

/**
 * Mint an Agora RTC token for a channel.
 * @param channelId Agora channel name (usually call session / workspace scoped)
 * @param uid numeric Agora uid (0 = let Agora assign; prefer stable hash of ML id upstream)
 * @param role publisher | subscriber
 * @param ttlSeconds token lifetime (default 3600)
 */
export function generateRtcToken(
  channelId: string,
  uid: number,
  role: AgoraRtcRole = "publisher",
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const channel = channelId.trim();
  if (!channel) throw new Error("AGORA_CHANNEL_REQUIRED");
  if (!Number.isFinite(uid) || uid < 0) throw new Error("AGORA_UID_INVALID");

  const ttl = Math.max(60, Math.min(Math.floor(ttlSeconds), 86_400));
  const { appId, appCertificate } = requireAgoraEnv();
  const expireAt = Math.floor(Date.now() / 1000) + ttl;

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channel,
    Math.floor(uid),
    mapRole(role),
    expireAt,
    expireAt,
  );
}

/** Convenience: token bound to Mitra Lab account string (Agora userAccount mode). */
export function generateRtcTokenForMlAccount(
  channelId: string,
  mlAccount: string,
  role: AgoraRtcRole = "publisher",
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const channel = channelId.trim();
  const account = mlAccount.trim().toUpperCase();
  if (!channel) throw new Error("AGORA_CHANNEL_REQUIRED");
  if (!account) throw new Error("AGORA_ACCOUNT_REQUIRED");

  const ttl = Math.max(60, Math.min(Math.floor(ttlSeconds), 86_400));
  const { appId, appCertificate } = requireAgoraEnv();
  const expireAt = Math.floor(Date.now() / 1000) + ttl;

  return RtcTokenBuilder.buildTokenWithUserAccount(
    appId,
    appCertificate,
    channel,
    account,
    mapRole(role),
    expireAt,
    expireAt,
  );
}
