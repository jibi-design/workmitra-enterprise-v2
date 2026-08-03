/**
 * Session store — DB-backed (Phase 2) or in-memory (Phase 1 dev demo).
 * Interface is identical; auth.routes.ts calls this without knowing which backend.
 */
import { isDbAuthEnabled } from "./env.js";
import { authRepository } from "./auth.repository.js";
import { auditService } from "./audit.service.js";
import { generateSessionToken, hashSessionToken, hashIp } from "./crypto.js";
import { SESSION_ABSOLUTE_TTL_SEC, SESSION_IDLE_TTL_SEC } from "./constants.js";
import type { SessionRecord } from "./types.js";
import type { RequestMeta } from "./request-meta.js";

// ─── In-memory store (Phase 1 / dev demo) ─────────────────────────────────────
// MED-2: map keys are HMAC-SHA256(token) — raw cookie token never stored as key.

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const GC_INTERVAL_MS = 60 * 60 * 1000;

const memorySessions = new Map<string, SessionRecord>();

function sweepExpiredSessions(): void {
  const now = Date.now();
  for (const [id, record] of memorySessions) {
    if (record.expiresAt < now) memorySessions.delete(id);
  }
}

const gcTimer = setInterval(sweepExpiredSessions, GC_INTERVAL_MS);
if (typeof gcTimer.unref === "function") gcTimer.unref();

const memoryStore = {
  create(userId: string): string {
    const rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);
    const now = Date.now();
    memorySessions.set(tokenHash, {
      userId,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });
    return rawToken;
  },
  get(rawToken: string): SessionRecord | null {
    const tokenHash = hashSessionToken(rawToken);
    const record = memorySessions.get(tokenHash);
    if (!record) return null;
    if (record.expiresAt < Date.now()) {
      memorySessions.delete(tokenHash);
      return null;
    }
    return record;
  },
  delete(rawToken: string): void {
    memorySessions.delete(hashSessionToken(rawToken));
  },
  deleteAllForUser(userId: string): void {
    for (const [tokenHash, record] of memorySessions) {
      if (record.userId === userId) memorySessions.delete(tokenHash);
    }
  },
};

// ─── DB store (Phase 2) ────────────────────────────────────────────────────────

const dbStore = {
  /**
   * Creates a DB session.
   * Returns the raw opaque token (goes into cookie); hash is stored in DB.
   */
  async createDb(userId: string, meta: RequestMeta): Promise<string> {
    const rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_ABSOLUTE_TTL_SEC * 1000);
    const idleExpiresAt = new Date(now.getTime() + SESSION_IDLE_TTL_SEC * 1000);
    const ipHash = meta.ip ? hashIp(meta.ip) : null;

    await authRepository.createSession({
      userId,
      sessionTokenHash: tokenHash,
      expiresAt,
      idleExpiresAt,
      ipHash,
      userAgent: meta.userAgent,
    });
    await auditService.log("session_created", meta, { userId });
    return rawToken;
  },

  async getDb(rawToken: string): Promise<{ userId: string; sessionId: string } | null> {
    const tokenHash = hashSessionToken(rawToken);
    const row = await authRepository.findSessionByTokenHash(tokenHash);
    if (!row) return null;
    if (row.revoked_at) return null;

    const now = new Date();
    if (row.expires_at < now) {
      await auditService.log(
        "session_expired",
        { requestId: "gc", ip: null, userAgent: null },
        {
          sessionId: row.id,
          userId: row.user_id,
        },
      );
      return null;
    }
    if (row.idle_expires_at < now) {
      await auditService.log(
        "session_expired",
        { requestId: "gc", ip: null, userAgent: null },
        {
          sessionId: row.id,
          userId: row.user_id,
          metadata: { reason: "idle" },
        },
      );
      return null;
    }

    // Rolling renewal
    const newIdleExpiry = new Date(now.getTime() + SESSION_IDLE_TTL_SEC * 1000);
    await authRepository.renewSessionIdle(row.id, newIdleExpiry);

    return { userId: row.user_id, sessionId: row.id };
  },

  async deleteDb(rawToken: string, meta: RequestMeta): Promise<void> {
    const tokenHash = hashSessionToken(rawToken);
    const sessionId = await authRepository.revokeSessionByTokenHash(tokenHash);
    if (sessionId) {
      await auditService.log("logout", meta, { sessionId });
    }
  },

  async deleteAllForUserDb(userId: string): Promise<void> {
    await authRepository.revokeAllSessionsForUser(userId);
  },
};

// ─── Unified export ────────────────────────────────────────────────────────────

export const sessionStore = {
  /** Memory path only — used by memory (Phase 1) flow. */
  create(userId: string): string {
    return memoryStore.create(userId);
  },

  /** Async DB path — used by DB (Phase 2) flow. */
  createDb(userId: string, meta: RequestMeta): Promise<string> {
    return dbStore.createDb(userId, meta);
  },

  get(sessionId: string): SessionRecord | null {
    return memoryStore.get(sessionId);
  },

  getDb(rawToken: string): Promise<{ userId: string; sessionId: string } | null> {
    return dbStore.getDb(rawToken);
  },

  delete(sessionId: string): void {
    memoryStore.delete(sessionId);
  },

  deleteDb(rawToken: string, meta: RequestMeta): Promise<void> {
    return dbStore.deleteDb(rawToken, meta);
  },

  deleteAllForUser(userId: string): void {
    if (isDbAuthEnabled()) {
      void dbStore.deleteAllForUserDb(userId);
    } else {
      memoryStore.deleteAllForUser(userId);
    }
  },
};
