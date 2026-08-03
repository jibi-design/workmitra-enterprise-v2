import type { IncomingMessage, ServerResponse } from "node:http";
import { isProduction } from "../modules/auth/env.js";
import { captureException } from "../observability/monitor.js";
import { sanitizeForLog } from "../observability/sanitize.js";

const MAX_BODY_BYTES = 16 * 1024;

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function envelope<T>(data: T, requestId: string): { data: T; meta: { requestId: string } } {
  return { data, meta: { requestId } };
}

/**
 * Defense Layer 2 — never leak stack traces / internal details to clients in production.
 * Always logs sanitized details internally (console + optional Sentry).
 */
export function sendInternalServerError(
  res: ServerResponse,
  requestId: string,
  error?: unknown,
  context?: Record<string, unknown>,
): void {
  if (error !== undefined) {
    captureException(error, {
      requestId,
      ...context,
      safeError: sanitizeForLog(error),
    });
  }

  if (res.headersSent) return;

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
      requestId,
    },
  };

  // Dev-only: optional non-sensitive hint (still sanitized) — never in production
  if (!isProduction() && error instanceof Error) {
    payload.error.detail = sanitizeForLog(error.message) as string;
  }

  sendJson(res, 500, payload);
}

export function sendNotImplemented(res: ServerResponse, requestId: string, endpoint: string): void {
  sendJson(res, 501, {
    error: {
      code: "NOT_IMPLEMENTED",
      message: `${endpoint} is scaffolded and ready for Career lifecycle implementation`,
      requestId,
    },
  });
}

export function sendNotFound(res: ServerResponse, requestId: string, context: string): void {
  sendJson(res, 404, {
    error: { code: "NOT_FOUND", message: `${context} route not found`, requestId },
  });
}

export async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown> | null> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    total += buf.byteLength;
    if (total > MAX_BODY_BYTES) return null;
    chunks.push(buf);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}
