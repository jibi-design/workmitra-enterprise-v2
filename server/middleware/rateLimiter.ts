/**
 * WAVE-5.1 Layer 3 — Rate limiter facade (raw Node HTTP — not express-rate-limit).
 *
 * SoT store remains adapters/rateLimitStore (memory | Redis).
 * Auth routes use a stricter class than general API traffic.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import {
  applyApiRateLimit,
  classifyRateLimitPath,
  type RateLimitClass,
  type RateLimitResult,
  __resetRateLimitBucketsForTests,
} from "./rateLimitChaos.js";

/** Auth-class IP budget (per minute) — brute-force / credential stuffing. */
export const AUTH_IP_MAX_PER_MINUTE = 5;
/** Auth-class session budget (per minute) when cookie present. */
export const AUTH_SESSION_MAX_PER_MINUTE = 4;

/**
 * True when the path+method should use the strict auth rate class.
 * Covers login, register, password flows, and session revoke.
 */
export function isAuthSensitiveRoute(pathname: string, method: string): boolean {
  const m = method.toUpperCase();
  if (m !== "POST") return false;
  const p = pathname;
  return (
    p === "/v1/jobmitra/auth/login" ||
    p === "/v1/jobmitra/auth/register" ||
    p === "/v1/jobmitra/auth/forgot-password" ||
    p === "/v1/jobmitra/auth/reset-password" ||
    p === "/v1/jobmitra/auth/change-password" ||
    p === "/v1/jobmitra/auth/logout" ||
    p === "/v1/jobmitra/auth/supabase-bridge" ||
    p === "/v1/jobmitra/auth/sessions/revoke-others" ||
    p === "/v1/jobmitra/auth/switch-context" ||
    p === "/v1/jobmitra/public/event-day/check-in"
  );
}

/**
 * WAVE-5.1 entry — apply dual IP/session rate limits before route dispatch.
 * Prefer this name in new call sites; delegates to applyApiRateLimit.
 */
export async function applyRateLimiter(
  req: IncomingMessage,
  res: ServerResponse,
  pathname?: string,
  method?: string,
): Promise<RateLimitResult> {
  return applyApiRateLimit(req, res, pathname, method);
}

export {
  applyApiRateLimit,
  classifyRateLimitPath,
  __resetRateLimitBucketsForTests,
};
export type { RateLimitClass, RateLimitResult };
