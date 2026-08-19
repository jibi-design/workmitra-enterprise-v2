/**
 * Defense Layer 2 — automated security alert events (rate-limit, CORS, MUID).
 * Payloads are sanitized; never include raw tokens or MUIDs.
 */

import { captureMessage } from "./monitor.js";
import { sanitizeForLog } from "./sanitize.js";

export type SecurityEventType =
  | "RATE_LIMIT_HIT"
  | "RATE_LIMIT_STORE_ERROR"
  | "CORS_DENIED"
  | "MUID_MISMATCH_ATTEMPT"
  | "RBAC_DENIED"
  | "ANOMALY_RAISED"
  | "MAINTENANCE_GATE_503"
  | "STEP_UP_DENIED"
  | "GUEST_WRITE_FORBIDDEN";

export type SecurityEventPayload = {
  event: SecurityEventType;
  path?: string;
  method?: string;
  /** Opaque client fingerprint (IP class only — already coarse). */
  clientKey?: string;
  rateClass?: string;
  httpStatus?: number;
  /** Free-form metadata — will be sanitized. */
  meta?: Record<string, unknown>;
};

/**
 * Emit a security telemetry event (console + Sentry warning).
 * Triggers solo-dev alerting without PII leakage.
 */
export function logSecurityEvent(payload: SecurityEventPayload): void {
  const safe = sanitizeForLog({
    event: payload.event,
    path: payload.path,
    method: payload.method,
    clientKey: payload.clientKey,
    rateClass: payload.rateClass,
    httpStatus: payload.httpStatus,
    meta: payload.meta,
  }) as Record<string, unknown>;

  captureMessage(`security:${payload.event}`, "warning", safe);
}
