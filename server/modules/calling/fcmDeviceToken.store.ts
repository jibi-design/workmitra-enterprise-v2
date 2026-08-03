/**
 * Wave-5.1 R3: FCM device tokens bound to authenticated user identity.
 * Never trust arbitrary client fcmToken for a different receiver.
 */

import { getPool } from "../../db/pool.js";
import { isDbAuthEnabled } from "../auth/env.js";

type DeviceRow = {
  userId: string;
  fcmToken: string;
  updatedAt: number;
};

/** userId (upper) → token */
const memoryByUser = new Map<string, DeviceRow>();

function normalizeUserId(id: string): string {
  return id.trim().toUpperCase();
}

export const fcmDeviceTokenStore = {
  async register(
    userId: string,
    fcmToken: string,
  ): Promise<{ ok: true } | { ok: false; code: string }> {
    const uid = normalizeUserId(userId);
    const token = fcmToken.trim();
    if (!uid || !token || token.length < 20 || token.length > 4096) {
      return { ok: false, code: "FCM_TOKEN_INVALID" };
    }
    const row: DeviceRow = { userId: uid, fcmToken: token, updatedAt: Date.now() };
    memoryByUser.set(uid, row);

    if (isDbAuthEnabled()) {
      try {
        await getPool().query(
          `INSERT INTO user_fcm_tokens (user_id, fcm_token, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_id) DO UPDATE
             SET fcm_token = EXCLUDED.fcm_token, updated_at = NOW()`,
          [uid, token],
        );
      } catch (err) {
        console.warn(
          "[fcm.device] DB register skipped:",
          err instanceof Error ? err.message : "unknown",
        );
      }
    }
    return { ok: true };
  },

  async resolveForUser(userId: string): Promise<string | null> {
    const uid = normalizeUserId(userId);
    if (!uid) return null;

    const mem = memoryByUser.get(uid);
    if (mem?.fcmToken) return mem.fcmToken;

    if (!isDbAuthEnabled()) return null;
    try {
      const result = await getPool().query<{ fcm_token: string }>(
        `SELECT fcm_token FROM user_fcm_tokens WHERE upper(user_id) = upper($1) LIMIT 1`,
        [uid],
      );
      const token = result.rows[0]?.fcm_token?.trim();
      if (token) {
        memoryByUser.set(uid, { userId: uid, fcmToken: token, updatedAt: Date.now() });
        return token;
      }
    } catch {
      /* ignore */
    }
    return null;
  },

  /**
   * Allow client-supplied token only when it matches the registered token for receiver.
   * Otherwise use registry token, or null (skip push).
   */
  async resolvePushToken(receiverUserId: string, clientHint?: string): Promise<string | null> {
    const registered = await this.resolveForUser(receiverUserId);
    if (!registered) return null;
    const hint = clientHint?.trim();
    if (hint && hint !== registered) {
      // Wave-5.1: reject mismatched client token (prevents FCM spam to arbitrary devices)
      return null;
    }
    return registered;
  },
};
