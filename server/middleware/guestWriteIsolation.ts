/** Reject unauthenticated mutating API calls except auth + pass-based public event-day. */

import type { IncomingMessage, ServerResponse } from "node:http";
import { parseCookies, isMutatingMethod } from "./csrf.js";
import { getRateLimitStore } from "../adapters/rateLimitStore.js";

function hasSessionCookie(req: IncomingMessage): boolean {
  const raw = parseCookies(req.headers.cookie)["wm_session"]?.trim();
  return Boolean(raw && raw.length >= 8);
}

function isAllowlistedGuestWrite(pathname: string): boolean {
  if (pathname.startsWith("/v1/jobmitra/auth/")) return true;
  if (pathname.startsWith("/v1/jobmitra/public/event-day/")) return true;
  if (pathname.startsWith("/v1/jobmitra/ops/")) return true;
  return false;
}

export function enforceGuestWriteIsolation(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  method: string,
): boolean {
  if (!isMutatingMethod(method)) return true;
  if (hasSessionCookie(req)) return true;
  if (isAllowlistedGuestWrite(pathname)) return true;

  res.statusCode = 401;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: {
        code: "GUEST_WRITE_FORBIDDEN",
        message: "Sign in required to write to the live database.",
      },
    }),
  );
  return false;
}

export function readGuestDeviceHash(req: IncomingMessage): string | null {
  const raw = String(req.headers["x-wm-guest-device"] ?? "")
    .trim()
    .toLowerCase();
  if (!/^[a-f0-9]{16,64}$/.test(raw)) return null;
  return raw;
}

/** Extra 30/min bucket per guest device hash (no Postgres write). */
export async function applyGuestDeviceBucket(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  if (hasSessionCookie(req)) return true;
  const hash = readGuestDeviceHash(req);
  if (!hash) return true;
  try {
    const result = await getRateLimitStore().consume(`guest-dev:${hash}`, 60_000, 30);
    if (!result.blocked) return true;
    res.statusCode = 429;
    res.setHeader("Retry-After", String(result.retryAfterSec));
    res.setHeader("X-RateLimit-Class", "guest-device");
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Too Many Requests",
          retryAfterSec: result.retryAfterSec,
        },
      }),
    );
    return false;
  } catch {
    return true;
  }
}
