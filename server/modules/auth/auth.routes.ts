import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { authService } from "./auth.service.js";
import { secureCookiesEnabled, isDbAuthEnabled } from "./env.js";
import { sessionStore } from "./session.store.js";
import { extractRequestMeta } from "./request-meta.js";
import { SESSION_ABSOLUTE_TTL_SEC } from "./constants.js";
import type { AuthUser } from "./types.js";
import { issueCsrfForSession, revokeCsrfForSession, parseCookies } from "../../middleware/csrf.js";
import { mintSupabaseSessionForJobMitraUser } from "./supabaseBridge.service.js";

const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_LOCKOUT_MS = 60_000;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

function isRateLimited(ip: string): { blocked: boolean; retryAfterSec: number } {
  const entry = loginAttempts.get(ip);
  if (!entry) {
    return { blocked: false, retryAfterSec: 0 };
  }

  const now = Date.now();
  if (now >= entry.resetAt) {
    loginAttempts.delete(ip);
    return { blocked: false, retryAfterSec: 0 };
  }

  if (entry.count >= LOGIN_ATTEMPT_LIMIT) {
    return {
      blocked: true,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return { blocked: false, retryAfterSec: 0 };
}

function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now >= entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_LOCKOUT_MS });
    return;
  }

  entry.count += 1;
  if (entry.count >= LOGIN_ATTEMPT_LIMIT) {
    entry.resetAt = now + LOGIN_LOCKOUT_MS;
  }
}

function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

const SESSION_COOKIE = "wm_session";
const AUTH_PREFIX = "/v1/jobmitra/auth";

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function buildSessionCookie(token: string, maxAgeSec: number): string {
  const secure = secureCookiesEnabled() ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${maxAgeSec}; SameSite=Strict${secure}`;
}

function appendSetCookie(res: ServerResponse, value: string): void {
  const existing = res.getHeader("Set-Cookie");
  if (!existing) {
    res.setHeader("Set-Cookie", value);
    return;
  }
  if (Array.isArray(existing)) {
    res.setHeader("Set-Cookie", [...existing, value]);
    return;
  }
  res.setHeader("Set-Cookie", [String(existing), value]);
}

function setSessionCookie(res: ServerResponse, token: string): void {
  appendSetCookie(res, buildSessionCookie(token, SESSION_ABSOLUTE_TTL_SEC));
}

function clearSessionCookie(res: ServerResponse): void {
  appendSetCookie(res, buildSessionCookie("", 0));
}

async function readSessionUser(
  req: IncomingMessage,
): Promise<{ user: AuthUser; sessionId: string | null } | null> {
  const cookies = parseCookies(req.headers.cookie);
  const rawToken = cookies[SESSION_COOKIE];
  if (!rawToken) return null;

  if (isDbAuthEnabled()) {
    const session = await sessionStore.getDb(rawToken);
    if (!session) return null;
    const user = await authService.getUserById(session.userId);
    if (!user) return null;
    return { user, sessionId: session.sessionId };
  }

  const session = sessionStore.get(rawToken);
  if (!session) return null;
  const user = await authService.getUserById(session.userId);
  if (!user) return null;
  return { user, sessionId: null };
}

const MAX_BODY_BYTES = 8 * 1024;

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown> | null> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.byteLength;
    if (total > MAX_BODY_BYTES) return null;
    chunks.push(buf);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function envelope<T>(data: T, requestId: string) {
  return { data, meta: { requestId } };
}

function errorEnvelope(code: string, message: string, requestId: string, status: number) {
  return { status, body: { error: { code, message, details: [], requestId } } };
}

export async function handleAuthRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  method: string,
): Promise<boolean> {
  if (!pathname.startsWith(AUTH_PREFIX)) return false;

  const requestId = randomUUID();
  const meta = extractRequestMeta(req, requestId);
  const subpath = pathname.slice(AUTH_PREFIX.length) || "/";

  if (method === "POST" && subpath === "/login") {
    const body = await readJsonBody(req);
    if (body === null) {
      const err = errorEnvelope("PAYLOAD_TOO_LARGE", "Request body too large", requestId, 413);
      sendJson(res, err.status, err.body);
      return true;
    }

    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      const err = errorEnvelope(
        "VALIDATION_ERROR",
        "Email and password are required",
        requestId,
        400,
      );
      sendJson(res, err.status, err.body);
      return true;
    }

    const ip = getClientIp(req);
    const rateLimit = isRateLimited(ip);
    if (rateLimit.blocked) {
      res.setHeader("Retry-After", String(rateLimit.retryAfterSec));
      const err = errorEnvelope(
        "TOO_MANY_REQUESTS",
        "Too many login attempts. Please try again later.",
        requestId,
        429,
      );
      sendJson(res, err.status, err.body);
      return true;
    }

    const loginResult = await authService.login(email, password, meta);
    if (!loginResult.ok) {
      recordFailedLogin(ip);
      const status =
        loginResult.httpStatus ?? (loginResult.code === "DEMO_AUTH_DISABLED" ? 403 : 401);
      const err = errorEnvelope(loginResult.code, loginResult.message, requestId, status);
      sendJson(res, err.status, err.body);
      return true;
    }

    clearLoginAttempts(ip);

    let rawToken: string;
    if (isDbAuthEnabled()) {
      rawToken = await sessionStore.createDb(loginResult.user.id, meta);
    } else {
      rawToken = sessionStore.create(loginResult.user.id);
    }
    setSessionCookie(res, rawToken);
    const csrfToken = issueCsrfForSession(res, rawToken, SESSION_ABSOLUTE_TTL_SEC);
    sendJson(res, 200, envelope({ user: loginResult.user, csrfToken }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/logout") {
    const cookies = parseCookies(req.headers.cookie);
    const rawToken = cookies[SESSION_COOKIE];
    if (rawToken) {
      if (isDbAuthEnabled()) {
        await sessionStore.deleteDb(rawToken, meta);
      } else {
        sessionStore.delete(rawToken);
      }
    }
    revokeCsrfForSession(res, rawToken);
    clearSessionCookie(res);
    sendJson(res, 200, envelope({ ok: true }, requestId));
    return true;
  }

  if (method === "GET" && subpath === "/me") {
    const result = await readSessionUser(req);
    if (!result) {
      const err = errorEnvelope("UNAUTHENTICATED", "Not authenticated", requestId, 401);
      sendJson(res, err.status, err.body);
      return true;
    }
    sendJson(res, 200, envelope({ user: result.user }, requestId));
    return true;
  }

  // GJ-3 — Job Mitra cookie session → Supabase Auth JWT (for shift_ops auth.uid())
  if (method === "POST" && subpath === "/supabase-bridge") {
    const result = await readSessionUser(req);
    if (!result) {
      const err = errorEnvelope("UNAUTHENTICATED", "Not authenticated", requestId, 401);
      sendJson(res, err.status, err.body);
      return true;
    }
    const body = (await readJsonBody(req)) ?? {};
    const mitraLabId =
      typeof body.mitraLabId === "string"
        ? body.mitraLabId
        : typeof body.jobmitra_ml_id === "string"
          ? body.jobmitra_ml_id
          : undefined;
    const minted = await mintSupabaseSessionForJobMitraUser(result.user, { mitraLabId });
    if (!minted.ok) {
      const status = minted.code === "BRIDGE_NOT_CONFIGURED" ? 503 : 502;
      const err = errorEnvelope(minted.code, minted.message, requestId, status);
      sendJson(res, err.status, err.body);
      return true;
    }
    sendJson(res, 200, envelope({ session: minted.session }, requestId));
    return true;
  }

  const err = errorEnvelope("NOT_FOUND", "Auth route not found", requestId, 404);
  sendJson(res, err.status, err.body);
  return true;
}
