/** In-memory rate limiter + chaos injection for MNC security/load probes */

import type { IncomingMessage, ServerResponse } from "node:http";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 10_000;
const MAX_HITS = 30;

export function applyApiRateLimit(
  req: IncomingMessage,
  res: ServerResponse,
): { blocked: boolean; retryAfterSec: number } {
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const key = `${ip}:${req.url ?? ""}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { blocked: false, retryAfterSec: 0 };
  }

  current.count += 1;
  if (current.count > MAX_HITS) {
    const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    res.setHeader("Retry-After", String(retryAfterSec));
    res.setHeader("X-RateLimit-Limit", String(MAX_HITS));
    return { blocked: true, retryAfterSec };
  }

  return { blocked: false, retryAfterSec: 0 };
}

/** Chaos header used by k6: X-WM-Chaos = 500|502|503|latency-3s|disconnect */
export async function applyChaosInjection(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<"handled" | "continue"> {
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
