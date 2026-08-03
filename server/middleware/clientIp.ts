/**
 * Trusted client IP resolution — Defense Layer 3 residual fix.
 *
 * X-Forwarded-For is ONLY honored when WM_TRUST_PROXY / TRUST_PROXY is explicitly true.
 * Otherwise (or when the header is malformed), fall back to the direct socket address.
 */

import type { IncomingMessage } from "node:http";
import net from "node:net";

function trustProxyEnabled(): boolean {
  const raw = (process.env.WM_TRUST_PROXY ?? process.env.TRUST_PROXY ?? "").trim().toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

/** Normalize IPv4-mapped IPv6 (::ffff:a.b.c.d) to IPv4 when possible. */
export function normalizeIp(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let ip = raw.trim().replace(/^\[|\]$/g, "");
  if (!ip || ip.length > 64) return null;
  if (ip.toLowerCase().startsWith("::ffff:")) {
    ip = ip.slice(7);
  }
  if (!net.isIP(ip)) return null;
  return ip;
}

/**
 * Parse and sanitize X-Forwarded-For.
 * Returns the left-most (original client) hop only when it is a valid IP.
 */
export function sanitizeForwardedFor(header: string | string[] | undefined): string | null {
  if (header == null) return null;
  const raw = Array.isArray(header) ? header[0] : header;
  if (typeof raw !== "string" || !raw.trim()) return null;
  // Take first hop; reject if any hop is empty / non-IP (spoof noise)
  const hops = raw
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  if (hops.length === 0 || hops.length > 20) return null;
  for (const hop of hops) {
    if (!normalizeIp(hop)) return null;
  }
  return normalizeIp(hops[0] ?? null);
}

/**
 * Resolve client IP for rate limiting / audit.
 * Prefer socket unless trust-proxy is enabled AND XFF sanitizes cleanly.
 */
export function resolveClientIp(req: IncomingMessage): string {
  const socketIp = normalizeIp(req.socket.remoteAddress) ?? req.socket.remoteAddress ?? "unknown";

  if (!trustProxyEnabled()) {
    return socketIp;
  }

  const forwarded = sanitizeForwardedFor(req.headers["x-forwarded-for"]);
  if (forwarded) return forwarded;

  // Unverified / missing / malformed XFF → socket fallback
  return socketIp;
}

export function isTrustProxyEnabled(): boolean {
  return trustProxyEnabled();
}
