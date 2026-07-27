/** Job Mitra | csrf.ts | CSRF validation helpers for mutating API requests */

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

function buildCsrfCookie(token: string, maxAgeSec: number): string {
  const secure = secureCookiesEnabled() ? "; Secure" : "";
  // Readable by JS (double-submit) — not HttpOnly
  return `${CSRF_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSec}; SameSite=Strict${secure}`;
}

export function setCsrfCookie(res: ServerResponse, token: string, maxAgeSec: number): void {
  const existing = res.getHeader("Set-Cookie");
  const next = buildCsrfCookie(token, maxAgeSec);
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

export function clearCsrfCookie(res: ServerResponse): void {
  const existing = res.getHeader("Set-Cookie");
  const next = buildCsrfCookie("", 0);
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

export function issueCsrfForSession(
  res: ServerResponse,
  sessionToken: string,
  maxAgeSec: number,
): string {
  const token = issueCsrfToken(sessionToken);
  setCsrfCookie(res, token, maxAgeSec);
  res.setHeader("X-CSRF-Token", token);
  return token;
}

export function revokeCsrfForSession(res: ServerResponse, sessionToken: string | undefined): void {
  if (sessionToken) clearCsrfToken(sessionToken);
  clearCsrfCookie(res);
}

/**
 * Validate CSRF for POST/PATCH/PUT/DELETE.
 * Login is exempt (caller skips). Logout still requires token when session exists.
 */
export function enforceCsrf(req: IncomingMessage, res: ServerResponse): boolean {
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
  if (sessionToken && validateCsrfToken(sessionToken, candidate)) {
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
