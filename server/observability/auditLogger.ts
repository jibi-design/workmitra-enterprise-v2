/**
 * WAVE-5.1 Layer 4 — Structured audit logger (JSON lines).
 *
 * No Winston dependency: same security posture (sanitize + no secrets) with
 * structured console sink + optional DB persistence via auth auditService.
 * Never log passwords, raw tokens, or stack traces into audit metadata.
 */

import { sanitizeForLog } from "./sanitize.js";
import { captureMessage } from "./monitor.js";

export type AuditAction =
  | "login_success"
  | "login_failed"
  | "logout"
  | "password_changed"
  | "password_change_failed"
  | "context_switched"
  | "rbac_denied"
  | "session_revoked_others"
  | "data_mutation"
  | "internal_error";

export type AuditLogEntry = {
  readonly ts: string;
  readonly layer: "WAVE-5.1-L4";
  readonly action: AuditAction | string;
  readonly requestId?: string;
  readonly userId?: string | null;
  readonly path?: string;
  readonly method?: string;
  readonly httpStatus?: number;
  readonly metadata?: Record<string, unknown>;
};

/**
 * Emit a sanitized structured audit line (stdout) + monitor sink.
 */
export function writeAuditLog(entry: Omit<AuditLogEntry, "ts" | "layer">): void {
  const payload: AuditLogEntry = {
    ts: new Date().toISOString(),
    layer: "WAVE-5.1-L4",
    action: entry.action,
    requestId: entry.requestId,
    userId: entry.userId ?? null,
    path: entry.path,
    method: entry.method,
    httpStatus: entry.httpStatus,
    metadata: entry.metadata
      ? (sanitizeForLog(entry.metadata) as Record<string, unknown>)
      : undefined,
  };

  const line = JSON.stringify(sanitizeForLog(payload));
  // Structured audit — always one JSON object per line for log shippers.
  console.info(`[wm-audit] ${line}`);
  captureMessage(`audit:${entry.action}`, "info", {
    requestId: entry.requestId,
    userId: entry.userId,
    path: entry.path,
    method: entry.method,
    httpStatus: entry.httpStatus,
  });
}
