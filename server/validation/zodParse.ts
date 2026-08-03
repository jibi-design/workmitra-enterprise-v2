/**
 * Defense Layer 4 — Zod parse helper (strip unknown keys = anti mass-assignment).
 */

import type { ZodType } from "zod";
import type { ServerResponse } from "node:http";
import { sendJson } from "../utils/http.js";

export type ParseOk<T> = { ok: true; data: T };
export type ParseFail = { ok: false };
export type ParseResult<T> = ParseOk<T> | ParseFail;

/**
 * Parse unknown input with a Zod schema.
 * Zod object schemas strip unrecognized keys by default (passthrough protection).
 */
export function parseWithSchema<T>(schema: ZodType<T>, input: unknown): ParseResult<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    return { ok: false };
  }
  return { ok: true, data: result.data };
}

/** Send a standard 400 VALIDATION_ERROR and return true (handled). */
export function sendValidationError(
  res: ServerResponse,
  requestId: string,
  message = "Request failed schema validation",
): true {
  sendJson(res, 400, {
    error: {
      code: "VALIDATION_ERROR",
      message,
      requestId,
    },
  });
  return true;
}
