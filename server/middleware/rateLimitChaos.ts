/**
 * Defense Layer 3 — IP + session dual rate limiting on sensitive routes.
 * Pluggable store: memory (default) or Upstash Redis (multi-node).
 */

import { createHash } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { getRateLimitStore, MemoryRateLimitStore } from "../adapters/rateLimitStore.js";
import { isProduction } from "../modules/auth/env.js";
import { resolveClientIp } from "./clientIp.js";
import { parseCookies } from "./csrf.js";

export type RateLimitClass =
  | "auth"
  | "invite"
  | "shift_confirm"
  | "shift_apply"
  | "shift"
  | "call_initiate"
  | "call"
  | "global";

type LimitConfig = { windowMs: number; maxHits: number };

const IP_LIMITS: Record<RateLimitClass, LimitConfig> = {
  auth: { windowMs: 60_000, maxHits: 10 },
  invite: { windowMs: 60_000, maxHits: 15 },
  shift_confirm: { windowMs: 60_000, maxHits: 20 },
  shift_apply: { windowMs: 60_000, maxHits: 20 },
  shift: { windowMs: 60_000, maxHits: 40 },
  call_initiate: { windowMs: 60_000, maxHits: 12 },
  call: { windowMs: 60_000, maxHits: 20 },
  global: { windowMs: 60_000, maxHits: 120 },
};

const SESSION_LIMITS: Partial<Record<RateLimitClass, LimitConfig>> = {
  auth: { windowMs: 60_000, maxHits: 8 },
  invite: { windowMs: 60_000, maxHits: 10 },
  shift_confirm: { windowMs: 60_000, maxHits: 12 },
  shift_apply: { windowMs: 60_000, maxHits: 12 },
  call_initiate: { windowMs: 60_000, maxHits: 8 },
  call: { windowMs: 60_000, maxHits: 15 },
};

const SESSION_COOKIE = "wm_session";

function sessionFingerprint(req: IncomingMessage): string | null {
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[SESSION_COOKIE]?.trim();
  if (!raw || raw.length < 8) return null;
  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

export function classifyRateLimitPath(pathname: string, method: string): RateLimitClass {
  const m = method.toUpperCase();
  const p = pathname;

  if (
    (m === "POST" && p === "/v1/jobmitra/auth/login") ||
    (m === "POST" && p === "/v1/jobmitra/auth/supabase-bridge") ||
    (m === "POST" && p === "/v1/jobmitra/auth/logout")
  ) {
    return "auth";
  }

  if (
    (m === "POST" && /\/employer\/shift\/posts\/[^/]+\/direct-invites$/.test(p)) ||
    (m === "POST" && /\/employee\/shift\/posts\/[^/]+\/direct-accept$/.test(p))
  ) {
    return "invite";
  }

  if (m === "POST" && /\/employer\/shift\/posts\/[^/]+\/applications\/[^/]+\/confirm$/.test(p)) {
    return "shift_confirm";
  }

  if (m === "POST" && /\/employee\/shift\/posts\/[^/]+\/apply$/.test(p)) {
    return "shift_apply";
  }

  if (
    (m === "PATCH" && /\/employer\/shift\/posts\/[^/]+$/.test(p)) ||
    (m === "DELETE" && /\/employer\/shift\/posts\/[^/]+$/.test(p))
  ) {
    return "shift";
  }

  if (m === "POST" && (p === "/v1/jobmitra/call/initiate" || p === "/api/call/initiate")) {
    return "call_initiate";
  }

  if (p.startsWith("/v1/jobmitra/call/") || p.startsWith("/api/call/")) {
    return "call";
  }

  return "global";
}

export type RateLimitResult = {
  blocked: boolean;
  retryAfterSec: number;
  rateClass: RateLimitClass;
  dimension: "ip" | "session" | "none";
};

/**
 * Apply IP + optional session dual rate limit (async for shared Redis store).
 */
export async function applyApiRateLimit(
  req: IncomingMessage,
  res: ServerResponse,
  pathname?: string,
  method?: string,
): Promise<RateLimitResult> {
  const path =
    pathname ??
    (() => {
      try {
        return new URL(req.url ?? "/", "http://localhost").pathname;
      } catch {
        return "/";
      }
    })();
  const verb = method ?? req.method ?? "GET";
  const rateClass = classifyRateLimitPath(path, verb);
  const ipConfig = IP_LIMITS[rateClass];
  const ip = resolveClientIp(req);
  const store = getRateLimitStore();

  let ipResult;
  try {
    ipResult = await store.consume(`ip:${rateClass}:${ip}`, ipConfig.windowMs, ipConfig.maxHits);
  } catch (err) {
    console.error(
      "[Job Mitra API] rate-limit store error:",
      err instanceof Error ? err.message : "unknown",
    );
    // HIGH-2 — fail CLOSED for auth / call initiate; fail-open elsewhere with warning
    if (rateClass === "auth" || rateClass === "call_initiate") {
      res.setHeader("Retry-After", "30");
      res.setHeader("X-RateLimit-Class", rateClass);
      res.setHeader("X-RateLimit-Dimension", "store_error");
      return { blocked: true, retryAfterSec: 30, rateClass, dimension: "none" };
    }
    console.warn(
      "[Job Mitra API] rate-limit store error — fail-open for non-sensitive class:",
      rateClass,
    );
    return { blocked: false, retryAfterSec: 0, rateClass, dimension: "none" };
  }

  if (ipResult.blocked) {
    res.setHeader("X-RateLimit-Limit", String(ipResult.limit));
    res.setHeader("X-RateLimit-Remaining", "0");
    res.setHeader("X-RateLimit-Class", rateClass);
    res.setHeader("X-RateLimit-Dimension", "ip");
    res.setHeader("X-RateLimit-Store", store.name);
    res.setHeader("Retry-After", String(ipResult.retryAfterSec));
    return {
      blocked: true,
      retryAfterSec: ipResult.retryAfterSec,
      rateClass,
      dimension: "ip",
    };
  }

  const sessionCfg = SESSION_LIMITS[rateClass];
  const sessionFp = sessionFingerprint(req);
  if (sessionCfg && sessionFp) {
    let sessResult;
    try {
      sessResult = await store.consume(
        `sess:${rateClass}:${sessionFp}`,
        sessionCfg.windowMs,
        sessionCfg.maxHits,
      );
    } catch (err) {
      console.error(
        "[Job Mitra API] rate-limit session store error:",
        err instanceof Error ? err.message : "unknown",
      );
      if (rateClass === "auth" || rateClass === "call_initiate") {
        res.setHeader("Retry-After", "30");
        res.setHeader("X-RateLimit-Class", rateClass);
        res.setHeader("X-RateLimit-Dimension", "store_error");
        return { blocked: true, retryAfterSec: 30, rateClass, dimension: "none" };
      }
      sessResult = {
        blocked: false,
        retryAfterSec: 0,
        remaining: sessionCfg.maxHits,
        limit: sessionCfg.maxHits,
      };
    }
    if (sessResult.blocked) {
      res.setHeader("X-RateLimit-Limit", String(sessResult.limit));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.setHeader("X-RateLimit-Class", rateClass);
      res.setHeader("X-RateLimit-Dimension", "session");
      res.setHeader("X-RateLimit-Store", store.name);
      res.setHeader("Retry-After", String(sessResult.retryAfterSec));
      return {
        blocked: true,
        retryAfterSec: sessResult.retryAfterSec,
        rateClass,
        dimension: "session",
      };
    }
    const remaining = Math.min(ipResult.remaining, sessResult.remaining);
    const limit = Math.min(ipResult.limit, sessResult.limit);
    res.setHeader("X-RateLimit-Limit", String(limit));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Class", rateClass);
    res.setHeader("X-RateLimit-Dimension", "ip+session");
    res.setHeader("X-RateLimit-Store", store.name);
    return { blocked: false, retryAfterSec: 0, rateClass, dimension: "none" };
  }

  res.setHeader("X-RateLimit-Limit", String(ipResult.limit));
  res.setHeader("X-RateLimit-Remaining", String(ipResult.remaining));
  res.setHeader("X-RateLimit-Class", rateClass);
  res.setHeader("X-RateLimit-Dimension", "ip");
  res.setHeader("X-RateLimit-Store", store.name);
  return { blocked: false, retryAfterSec: 0, rateClass, dimension: "none" };
}

export async function applyChaosInjection(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<"handled" | "continue"> {
  if (isProduction()) return "continue";

  const chaos = String(req.headers["x-wm-chaos"] ?? "");
  if (!chaos) return "continue";

  if (chaos === "disconnect") {
    res.destroy();
    return "handled";
  }
  if (chaos === "latency-3s") {
    await new Promise((r) => setTimeout(r, 3000));
    return "continue";
  }
  if (chaos === "500" || chaos === "502" || chaos === "503") {
    const code = Number(chaos);
    res.statusCode = code;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "chaos_injected", code }));
    return "handled";
  }
  return "continue";
}

export async function __resetRateLimitBucketsForTests(): Promise<void> {
  const store = getRateLimitStore();
  if (store.reset) await store.reset();
  else if (store instanceof MemoryRateLimitStore) await store.reset();
}
