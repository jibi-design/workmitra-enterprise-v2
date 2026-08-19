/** Job Mitra | csrf.ts | CSRF validation helpers for mutating API requests */

import { randomBytes } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { clearCsrfToken, issueCsrfToken, validateCsrfToken } from "../modules/auth/csrf.store.js";
import { secureCookiesEnabled } from "../modules/auth/env.js";

export const CSRF_COOKIE = "wm_csrf";
export const CSRF_HEADER = "x-csrf-token";
const SESSION_COOKIE = "wm_session";

export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, decodeURIComponent(rest.join("="))];
    }),
  );
}

/** Align CSRF cookie SameSite with session cookie (Capacitor cross-site). */
function resolveCsrfSameSite(req?: IncomingMessage): "Strict" | "None" | "Lax" {
  const forced = process.env.WM_COOKIE_SAMESITE?.trim();
  if (forced === "None" || forced === "Strict" || forced === "Lax") {
    return forced;
  }
  const origin = String(req?.headers?.origin ?? "").toLowerCase();
  if (
    origin.includes("localhost") ||
    origin.startsWith("capacitor://") ||
    origin.startsWith("ionic://") ||
    origin.includes("android_asset")
  ) {
    return secureCookiesEnabled() ? "None" : "Lax";
  }
  return "Strict";
}

function buildCsrfCookie(token: string, maxAgeSec: number, req?: IncomingMessage): string {
  const sameSite = resolveCsrfSameSite(req);
  const secure = secureCookiesEnabled() || sameSite === "None" ? "; Secure" : "";
  // Readable by JS (double-submit) — not HttpOnly
  return `${CSRF_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSec}; SameSite=${sameSite}${secure}`;
}

export function setCsrfCookie(
  res: ServerResponse,
  token: string,
  maxAgeSec: number,
  req?: IncomingMessage,
): void {
  const existing = res.getHeader("Set-Cookie");
  const next = buildCsrfCookie(token, maxAgeSec, req);
  if (!existing) {
    res.setHeader("Set-Cookie", next);
    return;
  }
  if (Array.isArray(existing)) {
    res.setHeader("Set-Cookie", [...existing, next]);
    return;
  }
  res.setHeader("Set-Cookie", [String(existing), next]);
}

export function clearCsrfCookie(res: ServerResponse, req?: IncomingMessage): void {
  const existing = res.getHeader("Set-Cookie");
  const next = buildCsrfCookie("", 0, req);
  if (!existing) {
    res.setHeader("Set-Cookie", next);
    return;
  }
  if (Array.isArray(existing)) {
    res.setHeader("Set-Cookie", [...existing, next]);
    return;
  }
  res.setHeader("Set-Cookie", [String(existing), next]);
}

export async function issueCsrfForSession(
  res: ServerResponse,
  sessionToken: string,
  maxAgeSec: number,
  req?: IncomingMessage,
): Promise<string> {
  const token = await issueCsrfToken(sessionToken);
  setCsrfCookie(res, token, maxAgeSec, req);
  res.setHeader("X-CSRF-Token", token);
  return token;
}

/**
 * Pre-auth double-submit CSRF (no session yet).
 * Used by GET /auth/csrf so register / forgot-password can send X-CSRF-Token.
 */
export function issueAnonymousCsrf(
  res: ServerResponse,
  maxAgeSec: number,
  req?: IncomingMessage,
): string {
  const token = randomBytes(32).toString("hex");
  setCsrfCookie(res, token, maxAgeSec, req);
  res.setHeader("X-CSRF-Token", token);
  return token;
}

export async function revokeCsrfForSession(
  res: ServerResponse,
  sessionToken: string | undefined,
  req?: IncomingMessage,
): Promise<void> {
  if (sessionToken) await clearCsrfToken(sessionToken);
  clearCsrfCookie(res, req);
}

/**
 * Validate CSRF for POST/PATCH/PUT/DELETE.
 * Login is exempt (caller skips). Logout still requires token when session exists.
 *
 * Session-bound store check first; double-submit cookie match is the grace path
 * after single-node memory restarts when the session KV entry is gone (HIGH-01).
 */
export async function enforceCsrf(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE];
  const headerRaw = req.headers[CSRF_HEADER];
  const headerToken = Array.isArray(headerRaw) ? headerRaw[0] : headerRaw;
  const cookieToken = cookies[CSRF_COOKIE];

  const candidate = typeof headerToken === "string" ? headerToken.trim() : "";
  if (!candidate) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: { code: "CSRF_FAILED", message: "Missing X-CSRF-Token header" },
      }),
    );
    return false;
  }

  // Prefer session-bound token; also accept double-submit cookie match
  if (sessionToken && (await validateCsrfToken(sessionToken, candidate))) {
    return true;
  }
  if (cookieToken && cookieToken === candidate) {
    return true;
  }

  res.statusCode = 403;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: { code: "CSRF_FAILED", message: "Invalid CSRF token" },
    }),
  );
  return false;
}

export function isMutatingMethod(method: string): boolean {
  return method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE";
}
