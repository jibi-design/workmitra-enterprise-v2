/**
 * Session store — DB-backed or in-memory.
 * Phase 2: activeMode + activeOrgId live on memory sessions;
 * DB path uses an in-process overlay until auth_sessions.active_workspace ships.
 */
import { isDbAuthEnabled } from "./env.js";
import { authRepository } from "./auth.repository.js";
import { auditService } from "./audit.service.js";
import { generateSessionToken, hashSessionToken, hashIp } from "./crypto.js";
import { SESSION_ABSOLUTE_TTL_SEC, SESSION_IDLE_TTL_SEC } from "./constants.js";
import type { ActiveMode, SessionRecord } from "./types.js";
import type { RequestMeta } from "./request-meta.js";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const GC_INTERVAL_MS = 60 * 60 * 1000;

const memorySessions = new Map<string, SessionRecord>();

/** DB sessionId → active context (no schema migration required for Phase 2). */
const dbContextOverlay = new Map<
  string,
  { activeMode: ActiveMode | null; activeOrgId: string | null }
>();

function sweepExpiredSessions(): void {
  const now = Date.now();
  for (const [id, record] of memorySessions) {
    if (record.expiresAt < now) memorySessions.delete(id);
  }
}

const gcTimer = setInterval(sweepExpiredSessions, GC_INTERVAL_MS);
if (typeof gcTimer.unref === "function") gcTimer.unref();

export type SessionContextPatch = {
  activeMode: ActiveMode | null;
  activeOrgId: string | null;
};

const memoryStore = {
  create(userId: string, context?: SessionContextPatch): string {
    const rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);
    const now = Date.now();
    memorySessions.set(tokenHash, {
      userId,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
      activeMode: context?.activeMode ?? null,
      activeOrgId: context?.activeOrgId ?? null,
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
  updateContext(rawToken: string, patch: SessionContextPatch): SessionRecord | null {
    const tokenHash = hashSessionToken(rawToken);
    const record = memorySessions.get(tokenHash);
    if (!record) return null;
    if (record.expiresAt < Date.now()) {
      memorySessions.delete(tokenHash);
      return null;
    }
    const next: SessionRecord = {
      ...record,
      activeMode: patch.activeMode,
      activeOrgId: patch.activeOrgId,
    };
    memorySessions.set(tokenHash, next);
    return next;
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

const dbStore = {
  async createDb(
    userId: string,
    meta: RequestMeta,
    context?: SessionContextPatch,
  ): Promise<string> {
    const rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_ABSOLUTE_TTL_SEC * 1000);
    const idleExpiresAt = new Date(now.getTime() + SESSION_IDLE_TTL_SEC * 1000);
    const ipHash = meta.ip ? hashIp(meta.ip) : null;

    const sessionId = await authRepository.createSession({
      userId,
      sessionTokenHash: tokenHash,
      expiresAt,
      idleExpiresAt,
      ipHash,
      userAgent: meta.userAgent,
    });
    if (sessionId) {
      dbContextOverlay.set(sessionId, {
        activeMode: context?.activeMode ?? null,
        activeOrgId: context?.activeOrgId ?? null,
      });
    }
    await auditService.log("session_created", meta, { userId });
    return rawToken;
  },

  async getDb(rawToken: string): Promise<{
    userId: string;
    sessionId: string;
    activeMode: ActiveMode | null;
    activeOrgId: string | null;
  } | null> {
    const tokenHash = hashSessionToken(rawToken);
    const row = await authRepository.findSessionByTokenHash(tokenHash);
    if (!row) return null;
    if (row.revoked_at) return null;

    const now = new Date();
    if (row.expires_at < now) {
      await auditService.log(
        "session_expired",
        { requestId: "gc", ip: null, userAgent: null },
        { sessionId: row.id, userId: row.user_id },
      );
      dbContextOverlay.delete(row.id);
      return null;
    }
    if (row.idle_expires_at < now) {
      await auditService.log(
        "session_expired",
        { requestId: "gc", ip: null, userAgent: null },
        { sessionId: row.id, userId: row.user_id, metadata: { reason: "idle" } },
      );
      dbContextOverlay.delete(row.id);
      return null;
    }

    const newIdleExpiry = new Date(now.getTime() + SESSION_IDLE_TTL_SEC * 1000);
    await authRepository.renewSessionIdle(row.id, newIdleExpiry);

    const overlay = dbContextOverlay.get(row.id);
    return {
      userId: row.user_id,
      sessionId: row.id,
      activeMode: overlay?.activeMode ?? null,
      activeOrgId: overlay?.activeOrgId ?? null,
    };
  },

  updateDbContext(sessionId: string, patch: SessionContextPatch): void {
    dbContextOverlay.set(sessionId, {
      activeMode: patch.activeMode,
      activeOrgId: patch.activeOrgId,
    });
  },

  async deleteDb(rawToken: string, meta: RequestMeta): Promise<void> {
    const tokenHash = hashSessionToken(rawToken);
    const sessionId = await authRepository.revokeSessionByTokenHash(tokenHash);
    if (sessionId) {
      dbContextOverlay.delete(sessionId);
      await auditService.log("logout", meta, { sessionId });
    }
  },

  async deleteAllForUserDb(userId: string): Promise<void> {
    await authRepository.revokeAllSessionsForUser(userId);
  },
};

export const sessionStore = {
  create(userId: string, context?: SessionContextPatch): string {
    return memoryStore.create(userId, context);
  },

  createDb(userId: string, meta: RequestMeta, context?: SessionContextPatch): Promise<string> {
    return dbStore.createDb(userId, meta, context);
  },

  get(sessionId: string): SessionRecord | null {
    return memoryStore.get(sessionId);
  },

  updateContext(rawToken: string, patch: SessionContextPatch): SessionRecord | null {
    return memoryStore.updateContext(rawToken, patch);
  },

  getDb(rawToken: string): Promise<{
    userId: string;
    sessionId: string;
    activeMode: ActiveMode | null;
    activeOrgId: string | null;
  } | null> {
    return dbStore.getDb(rawToken);
  },

  updateDbContext(sessionId: string, patch: SessionContextPatch): void {
    dbStore.updateDbContext(sessionId, patch);
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
