import type { IncomingMessage, ServerResponse } from "node:http";
import { handleRequestError } from "../middleware/errorHandler.js";

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
 * Defense Layer 2 / WAVE-5.1 Layer 4 — never leak stack traces to clients.
 * Delegates to centralized errorHandler.
 */
export function sendInternalServerError(
  res: ServerResponse,
  requestId: string,
  error?: unknown,
  context?: Record<string, unknown>,
): void {
  handleRequestError(res, error ?? new Error("Internal server error"), {
    requestId,
    path: typeof context?.path === "string" ? context.path : undefined,
    method: typeof context?.method === "string" ? context.method : undefined,
    userId: typeof context?.userId === "string" ? context.userId : null,
  });
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
