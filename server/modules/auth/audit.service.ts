import { authRepository } from "./auth.repository.js";
import { hashIp } from "./crypto.js";
import type { RequestMeta } from "./request-meta.js";
import { writeAuditLog } from "../../observability/auditLogger.js";
import { isDbAuthEnabled } from "./env.js";

export const auditService = {
  async log(
    eventType: string,
    meta: RequestMeta,
    extra?: {
      userId?: string | null;
      sessionId?: string | null;
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    // WAVE-5.1 Layer 4 — always emit structured audit line (memory + DB paths).
    writeAuditLog({
      action: eventType,
      requestId: meta.requestId,
      userId: extra?.userId ?? null,
      metadata: {
        ...(extra?.metadata ?? {}),
        hasSessionId: Boolean(extra?.sessionId),
        hasIp: Boolean(meta.ip),
      },
    });

    if (!isDbAuthEnabled()) return;

    try {
      await authRepository.insertAuditEvent({
        eventType,
        userId: extra?.userId,
        sessionId: extra?.sessionId,
        ipHash: meta.ip ? hashIp(meta.ip) : null,
        userAgent: meta.userAgent ?? null,
        requestId: meta.requestId,
        metadata: extra?.metadata,
      });
    } catch (err) {
      console.error("[Job Mitra Auth] audit log failed:", err);
    }
  },
};
