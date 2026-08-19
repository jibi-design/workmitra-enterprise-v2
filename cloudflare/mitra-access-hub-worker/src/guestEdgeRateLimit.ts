/**
 * Edge IP cap for unauthenticated API traffic (30 req / minute).
 * Complements origin middleware. Isolate-local Map — not a global CF WAF rule.
 */

const WINDOW_MS = 60_000;
const GUEST_MAX = 30;

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

function hasSessionCookie(request: Request): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  return /(?:^|;\s*)wm_session=/.test(cookie);
}

function isMutating(method: string): boolean {
  const m = method.toUpperCase();
  return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE";
}

export function guestEdgeRateLimit(request: Request, url: URL): Response | null {
  if (!url.pathname.startsWith("/v1/") && !url.pathname.startsWith("/auth/")) return null;
  if (hasSessionCookie(request)) return null;

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const now = Date.now();
  const key = `${ip}:${isMutating(request.method) ? "w" : "r"}`;
  const cur = buckets.get(key);
  if (!cur || now - cur.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return null;
  }
  cur.count += 1;
  if (cur.count <= GUEST_MAX) return null;

  return Response.json(
    { error: { code: "TOO_MANY_REQUESTS", message: "Too Many Requests", retryAfterSec: 60 } },
    { status: 429, headers: { "Retry-After": "60", "X-RateLimit-Class": "guest" } },
  );
}
