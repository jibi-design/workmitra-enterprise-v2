import { authRepository } from "./auth.repository.js";
import { hashIp } from "./crypto.js";
import type { RequestMeta } from "./request-meta.js";

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
