/**
 * WAVE-5.1 Layer 4 — Centralized secure error handler (raw Node HTTP, not Express).
 *
 * Catches unexpected errors, logs sanitized internals, returns client-safe JSON
 * WITHOUT stack traces in production.
 *
 * Does not import utils/http (avoids circular dependency with sendInternalServerError).
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { isProduction } from "../modules/auth/env.js";
import { captureException } from "../observability/monitor.js";
import { sanitizeForLog } from "../observability/sanitize.js";
import { writeAuditLog } from "../observability/auditLogger.js";

/** Client-safe HTTP error — message is allowed to reach the browser. */
export class AppHttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly expose = true as const;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AppHttpError";
    this.status = status;
    this.code = code;
  }
}

export type ErrorHandlerContext = {
  readonly requestId: string;
  readonly path?: string;
  readonly method?: string;
  readonly userId?: string | null;
};

function sendClientJson(res: ServerResponse, status: number, body: unknown): void {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

/**
 * handleRequestError — WAVE-5.1 secure error boundary for a single request.
 */
export function handleRequestError(
  res: ServerResponse,
  error: unknown,
  context: ErrorHandlerContext,
): void {
  if (error instanceof AppHttpError) {
    sendClientJson(res, error.status, {
      error: {
        code: error.code,
        message: error.message,
        requestId: context.requestId,
      },
    });
    return;
  }

  captureException(error, {
    requestId: context.requestId,
    path: context.path,
    method: context.method,
    userId: context.userId,
    safeError: sanitizeForLog(error),
  });

  writeAuditLog({
    action: "internal_error",
    requestId: context.requestId,
    userId: context.userId ?? null,
    path: context.path,
    method: context.method,
    httpStatus: 500,
    metadata: {
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage:
        error instanceof Error
          ? (sanitizeForLog(error.message) as string)
          : "non_error_throw",
    },
  });

  const payload: {
    error: {
      code: "INTERNAL_SERVER_ERROR";
      message: string;
      requestId: string;
      detail?: string;
    };
  } = {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      requestId: context.requestId,
    },
  };

  if (!isProduction() && error instanceof Error) {
    payload.error.detail = sanitizeForLog(error.message) as string;
  }

  sendClientJson(res, 500, payload);
}

/**
 * Top-level server catch wrapper used by createServer.
 */
export function handleUnhandledDispatchError(
  req: IncomingMessage,
  res: ServerResponse,
  error: unknown,
  requestId: string,
): void {
  handleRequestError(res, error, {
    requestId,
    path: req.url,
    method: req.method,
  });
}
