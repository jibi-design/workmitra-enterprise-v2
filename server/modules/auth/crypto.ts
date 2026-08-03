import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { resolveSessionPepper } from "./failCloseEnv.js";

function getSessionPepper(): string {
  const pepper = resolveSessionPepper();
  if (!pepper && process.env.NODE_ENV === "production") {
    throw new Error("WM_SESSION_HASH_PEPPER (or JWT_SECRET) is required in production");
  }
  return pepper ?? "wm-dev-session-pepper-not-for-production";
}

/** Hash opaque session cookie token for DB storage — never store raw token. */
export function hashSessionToken(rawToken: string): string {
  return createHmac("sha256", getSessionPepper()).update(rawToken).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** One-way hash for IP addresses in audit/rate-limit tables. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`wm-ip:${ip}`).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
