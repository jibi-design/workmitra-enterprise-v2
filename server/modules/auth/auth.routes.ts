import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { authService } from "./auth.service.js";
import { secureCookiesEnabled, isDbAuthEnabled } from "./env.js";
import { sessionStore } from "./session.store.js";
import { extractRequestMeta } from "./request-meta.js";
import { SESSION_ABSOLUTE_TTL_SEC } from "./constants.js";
import type { AuthUser } from "./types.js";
import {
  issueCsrfForSession,
  revokeCsrfForSession,
  parseCookies,
  issueAnonymousCsrf,
} from "../../middleware/csrf.js";
import {
  mintSupabaseSessionForJobMitraUser,
  revokeSupabaseSessionForUser,
} from "./supabaseBridge.service.js";
import { resolveClientIp } from "../../middleware/clientIp.js";
import { logSecurityEvent } from "../../observability/securityEvents.js";
import { writeAuditLog } from "../../observability/auditLogger.js";
import { recordAuthFailureSignal } from "../../observability/anomalyDetector.js";
import { issueStepUpToken } from "./stepUp.service.js";
import { auditService } from "./audit.service.js";
import { parseWithSchema } from "../../validation/zodParse.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  loginBodySchema,
  registerBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
  changePasswordBodySchema,
  deleteAccountBodySchema,
  switchContextBodySchema,
  supabaseBridgeBodySchema,
} from "../../validation/schemas/auth.schemas.js";
import {
  applySessionContext,
  hasVerifiedEntitlement,
  initialActiveMode,
  isActiveMode,
} from "./activeContext.helpers.js";
import type { ActiveMode } from "./types.js";

const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_LOCKOUT_MS = 60_000;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: IncomingMessage): string {
  return resolveClientIp(req);
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

/**
 * Sprint 2 — Capacitor WebView (https://localhost) is cross-site vs API host.
 * SameSite=Strict would drop wm_session; use None+Secure on HTTPS / when opted in.
 */
function resolveSessionSameSite(req?: IncomingMessage): "Strict" | "None" | "Lax" {
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

function buildSessionCookie(token: string, maxAgeSec: number, req?: IncomingMessage): string {
  const sameSite = resolveSessionSameSite(req);
  const secure = secureCookiesEnabled() || sameSite === "None" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${maxAgeSec}; SameSite=${sameSite}${secure}`;
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

function setSessionCookie(res: ServerResponse, token: string, req?: IncomingMessage): void {
  appendSetCookie(res, buildSessionCookie(token, SESSION_ABSOLUTE_TTL_SEC, req));
}

function clearSessionCookie(res: ServerResponse, req?: IncomingMessage): void {
  appendSetCookie(res, buildSessionCookie("", 0, req));
}

async function readSessionUser(req: IncomingMessage): Promise<{
  user: AuthUser;
  sessionId: string | null;
  rawToken: string;
  activeMode: ActiveMode | null;
  activeOrgId: string | null;
} | null> {
  const cookies = parseCookies(req.headers.cookie);
  const rawToken = cookies[SESSION_COOKIE];
  if (!rawToken) return null;

  if (isDbAuthEnabled()) {
    const session = await sessionStore.getDb(rawToken);
    if (!session) return null;
    const base = await authService.getUserById(session.userId);
    if (!base) return null;
    const activeMode = session.activeMode ?? initialActiveMode(base.role);
    const activeOrgId = session.activeOrgId;
    // Seed overlay on first read after login if empty
    if (session.activeMode === null && activeMode) {
      sessionStore.updateDbContext(session.sessionId, { activeMode, activeOrgId: null });
    }
    const user = applySessionContext(base, { activeMode, activeOrgId });
    return {
      user,
      sessionId: session.sessionId,
      rawToken,
      activeMode,
      activeOrgId,
    };
  }

  const session = sessionStore.get(rawToken);
  if (!session) return null;
  const base = await authService.getUserById(session.userId);
  if (!base) return null;
  const activeMode = session.activeMode ?? initialActiveMode(base.role);
  const activeOrgId = session.activeOrgId;
  if (session.activeMode === null && activeMode) {
    sessionStore.updateContext(rawToken, { activeMode, activeOrgId: null });
  }
  const user = applySessionContext(base, { activeMode, activeOrgId });
  return { user, sessionId: null, rawToken, activeMode, activeOrgId };
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

  // Pre-auth CSRF bootstrap (double-submit cookie + header) for register / password flows.
  if (method === "GET" && subpath === "/csrf") {
    const csrfToken = issueAnonymousCsrf(res, SESSION_ABSOLUTE_TTL_SEC, req);
    sendJson(res, 200, envelope({ csrfToken }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/login") {
    const body = await readJsonBody(req);
    if (body === null) {
      const err = errorEnvelope("PAYLOAD_TOO_LARGE", "Request body too large", requestId, 413);
      sendJson(res, err.status, err.body);
      return true;
    }

    const validated = validateRequest(
      { bodySchema: loginBodySchema, body },
      res,
      requestId,
    );
    if (!validated.ok) {
      return true;
    }

    const email = validated.body.email;
    const password = validated.body.password;

    const ip = getClientIp(req);
    const rateLimit = isRateLimited(ip);
    if (rateLimit.blocked) {
      res.setHeader("Retry-After", String(rateLimit.retryAfterSec));
      logSecurityEvent({
        event: "RATE_LIMIT_HIT",
        path: pathname,
        method,
        httpStatus: 429,
        rateClass: "auth",
        clientKey: ip,
        meta: { source: "login_lockout", retryAfterSec: rateLimit.retryAfterSec },
      });
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
      recordAuthFailureSignal(ip, pathname);
      const status =
        loginResult.httpStatus ?? (loginResult.code === "DEMO_AUTH_DISABLED" ? 403 : 401);
      const err = errorEnvelope(loginResult.code, loginResult.message, requestId, status);
      sendJson(res, err.status, err.body);
      return true;
    }

    clearLoginAttempts(ip);

    const loginActiveMode = initialActiveMode(loginResult.user.role);
    const sessionContext = {
      activeMode: loginActiveMode,
      activeOrgId: null as string | null,
    };

    let rawToken: string;
    if (isDbAuthEnabled()) {
      rawToken = await sessionStore.createDb(loginResult.user.id, meta, sessionContext);
    } else {
      rawToken = sessionStore.create(loginResult.user.id, sessionContext);
    }
    const user = applySessionContext(loginResult.user, sessionContext);
    setSessionCookie(res, rawToken, req);
    const csrfToken = await issueCsrfForSession(res, rawToken, SESSION_ABSOLUTE_TTL_SEC, req);
    sendJson(res, 200, envelope({ user, csrfToken }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/logout") {
    const cookies = parseCookies(req.headers.cookie);
    const rawToken = cookies[SESSION_COOKIE];
    if (rawToken) {
      // CRIT-1 — revoke bridged Supabase session before destroying Node session
      const sessionUser = await readSessionUser(req);
      if (sessionUser) {
        await revokeSupabaseSessionForUser(sessionUser.user).catch((err) => {
          console.warn(
            "[Job Mitra Auth] Supabase session revoke on logout failed:",
            err instanceof Error ? err.message : "unknown",
          );
        });
      }
      if (isDbAuthEnabled()) {
        await sessionStore.deleteDb(rawToken, meta);
      } else {
        sessionStore.delete(rawToken);
      }
    }
    await revokeCsrfForSession(res, rawToken, req);
    clearSessionCookie(res, req);
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

  // Phase 2 — Dual-context switcher
  if (method === "POST" && subpath === "/switch-context") {
    const session = await readSessionUser(req);
    if (!session) {
      const err = errorEnvelope("UNAUTHENTICATED", "Not authenticated", requestId, 401);
      sendJson(res, err.status, err.body);
      return true;
    }
    if (
      session.user.role === "admin" ||
      !isActiveMode(session.user.activeMode ?? session.user.role)
    ) {
      const err = errorEnvelope(
        "FORBIDDEN",
        "Admin accounts cannot switch employee/employer workspace context.",
        requestId,
        403,
      );
      sendJson(res, err.status, err.body);
      return true;
    }

    const body = await readJsonBody(req);
    if (body === null) {
      const err = errorEnvelope("PAYLOAD_TOO_LARGE", "Request body too large", requestId, 413);
      sendJson(res, err.status, err.body);
      return true;
    }
    const parsed = parseWithSchema(switchContextBodySchema, body);
    if (!parsed.ok) {
      const err = errorEnvelope(
        "VALIDATION_ERROR",
        "mode must be employee or employer",
        requestId,
        400,
      );
      sendJson(res, err.status, err.body);
      return true;
    }

    const nextMode = parsed.data.mode;
    if (!hasVerifiedEntitlement(session.user, nextMode)) {
      const err = errorEnvelope(
        "ENTITLEMENT_REQUIRED",
        `Verified ${nextMode} workspace entitlement is required before switching.`,
        requestId,
        403,
      );
      sendJson(res, err.status, err.body);
      return true;
    }

    const nextOrgId =
      nextMode === "employer"
        ? typeof parsed.data.orgId === "string" && parsed.data.orgId.trim()
          ? parsed.data.orgId.trim()
          : session.activeOrgId
        : null;

    const patch = { activeMode: nextMode, activeOrgId: nextOrgId };
    if (isDbAuthEnabled() && session.sessionId) {
      sessionStore.updateDbContext(session.sessionId, patch);
    } else {
      const updated = sessionStore.updateContext(session.rawToken, patch);
      if (!updated) {
        const err = errorEnvelope("UNAUTHENTICATED", "Session expired", requestId, 401);
        sendJson(res, err.status, err.body);
        return true;
      }
    }

    const user = applySessionContext(session.user, patch);
    await auditService.log("context_switched", meta, {
      userId: session.user.id,
      sessionId: session.sessionId,
      metadata: { activeMode: nextMode, hasOrgId: Boolean(nextOrgId) },
    });
    sendJson(res, 200, envelope({ user }, requestId));
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
    const parsed = parseWithSchema(supabaseBridgeBodySchema, body);
    const safe = parsed.ok ? parsed.data : {};
    const mitraLabId =
      typeof safe.mitraLabId === "string"
        ? safe.mitraLabId
        : typeof safe.jobmitra_ml_id === "string"
          ? safe.jobmitra_ml_id
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

  if (method === "POST" && subpath === "/register") {
    const body = await readJsonBody(req);
    if (body === null) {
      const err = errorEnvelope("PAYLOAD_TOO_LARGE", "Request body too large", requestId, 413);
      sendJson(res, err.status, err.body);
      return true;
    }
    const parsed = parseWithSchema(registerBodySchema, body);
    if (!parsed.ok) {
      const err = errorEnvelope(
        "VALIDATION_ERROR",
        "Full name, email, password (8+), and role are required",
        requestId,
        400,
      );
      sendJson(res, err.status, err.body);
      return true;
    }
    const result = await authService.register(parsed.data);
    if (!result.ok) {
      const err = errorEnvelope(result.code, result.message, requestId, result.httpStatus ?? 400);
      sendJson(res, err.status, err.body);
      return true;
    }
    let rawToken: string;
    const registerContext = {
      activeMode: initialActiveMode(result.user.role),
      activeOrgId: null as string | null,
    };
    if (isDbAuthEnabled()) {
      rawToken = await sessionStore.createDb(result.user.id, meta, registerContext);
    } else {
      rawToken = sessionStore.create(result.user.id, registerContext);
    }
    const user = applySessionContext(result.user, registerContext);
    setSessionCookie(res, rawToken, req);
    const csrfToken = await issueCsrfForSession(res, rawToken, SESSION_ABSOLUTE_TTL_SEC, req);
    sendJson(res, 201, envelope({ user, csrfToken }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/forgot-password") {
    const body = await readJsonBody(req);
    if (body === null) {
      const err = errorEnvelope("PAYLOAD_TOO_LARGE", "Request body too large", requestId, 413);
      sendJson(res, err.status, err.body);
      return true;
    }
    const parsed = parseWithSchema(forgotPasswordBodySchema, body);
    if (!parsed.ok) {
      const err = errorEnvelope("VALIDATION_ERROR", "A valid email is required", requestId, 400);
      sendJson(res, err.status, err.body);
      return true;
    }
    const result = await authService.requestPasswordReset(parsed.data.email);
    sendJson(
      res,
      200,
      envelope(
        {
          ok: true,
          message:
            "If an account exists for that email, password reset instructions have been sent.",
          ...(result.debugToken ? { debugResetToken: result.debugToken } : {}),
        },
        requestId,
      ),
    );
    return true;
  }

  if (method === "POST" && subpath === "/reset-password") {
    const body = await readJsonBody(req);
    if (body === null) {
      const err = errorEnvelope("PAYLOAD_TOO_LARGE", "Request body too large", requestId, 413);
      sendJson(res, err.status, err.body);
      return true;
    }
    const parsed = parseWithSchema(resetPasswordBodySchema, body);
    if (!parsed.ok) {
      const err = errorEnvelope(
        "VALIDATION_ERROR",
        "Reset token and a new password (8+) are required",
        requestId,
        400,
      );
      sendJson(res, err.status, err.body);
      return true;
    }
    const result = await authService.resetPassword(parsed.data.token, parsed.data.password);
    if (!result.ok) {
      const err = errorEnvelope(result.code, result.message, requestId, result.httpStatus ?? 400);
      sendJson(res, err.status, err.body);
      return true;
    }
    sendJson(res, 200, envelope({ ok: true, user: result.user }, requestId));
    return true;
  }

  // WAVE-5.1 bound — authenticated password update (keeps current session).
  if (method === "POST" && subpath === "/change-password") {
    const session = await readSessionUser(req);
    if (!session) {
      const err = errorEnvelope("UNAUTHENTICATED", "Not authenticated", requestId, 401);
      sendJson(res, err.status, err.body);
      return true;
    }
    const body = await readJsonBody(req);
    if (body === null) {
      const err = errorEnvelope("PAYLOAD_TOO_LARGE", "Request body too large", requestId, 413);
      sendJson(res, err.status, err.body);
      return true;
    }
    const validated = validateRequest(
      { bodySchema: changePasswordBodySchema, body },
      res,
      requestId,
    );
    if (!validated.ok) {
      return true;
    }
    const result = await authService.changePassword(
      session.user.id,
      validated.body.currentPassword,
      validated.body.newPassword,
      meta,
    );
    if (!result.ok) {
      const err = errorEnvelope(result.code, result.message, requestId, result.httpStatus ?? 400);
      sendJson(res, err.status, err.body);
      return true;
    }
    const revoked = await sessionStore.revokeOthers(session.user.id, session.rawToken);
    writeAuditLog({
      action: "session_revoked_others",
      requestId,
      userId: session.user.id,
      path: pathname,
      method,
      httpStatus: 200,
      metadata: { revoked },
    });
    sendJson(res, 200, envelope({ ok: true, revokedOtherSessions: revoked }, requestId));
    return true;
  }

  // Store compliance — authenticated account deletion (soft-delete + revoke all sessions).
  if (method === "POST" && subpath === "/delete-account") {
    const session = await readSessionUser(req);
    if (!session) {
      const err = errorEnvelope("UNAUTHENTICATED", "Not authenticated", requestId, 401);
      sendJson(res, err.status, err.body);
      return true;
    }
    const body = await readJsonBody(req);
    if (body === null) {
      const err = errorEnvelope("PAYLOAD_TOO_LARGE", "Request body too large", requestId, 413);
      sendJson(res, err.status, err.body);
      return true;
    }
    const validated = validateRequest(
      { bodySchema: deleteAccountBodySchema, body },
      res,
      requestId,
    );
    if (!validated.ok) {
      return true;
    }
    const result = await authService.deleteAccount(
      session.user.id,
      validated.body.password,
      meta,
    );
    if (!result.ok) {
      const err = errorEnvelope(result.code, result.message, requestId, result.httpStatus ?? 400);
      sendJson(res, err.status, err.body);
      return true;
    }

    await revokeSupabaseSessionForUser(session.user).catch((err) => {
      console.warn(
        "[Job Mitra Auth] Supabase session revoke on account delete failed:",
        err instanceof Error ? err.message : "unknown",
      );
    });

    if (isDbAuthEnabled()) {
      // Sessions already revoked in db deleteAccount; clear cookie + CSRF for this request.
    } else {
      sessionStore.deleteAllForUser(session.user.id);
    }

    const cookies = parseCookies(req.headers.cookie);
    const rawToken = cookies[SESSION_COOKIE];
    await revokeCsrfForSession(res, rawToken, req);
    clearSessionCookie(res, req);

    writeAuditLog({
      action: "account_deleted",
      requestId,
      userId: session.user.id,
      path: pathname,
      method,
      httpStatus: 200,
    });
    sendJson(res, 200, envelope({ ok: true }, requestId));
    return true;
  }

  if (method === "GET" && subpath === "/sessions") {
    const session = await readSessionUser(req);
    if (!session) {
      const err = errorEnvelope("UNAUTHENTICATED", "Not authenticated", requestId, 401);
      sendJson(res, err.status, err.body);
      return true;
    }
    const sessions = await sessionStore.listForUser(session.user.id, session.rawToken);
    sendJson(res, 200, envelope({ sessions }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/sessions/revoke-others") {
    const session = await readSessionUser(req);
    if (!session) {
      const err = errorEnvelope("UNAUTHENTICATED", "Not authenticated", requestId, 401);
      sendJson(res, err.status, err.body);
      return true;
    }
    const revoked = await sessionStore.revokeOthers(session.user.id, session.rawToken);
    writeAuditLog({
      action: "session_revoked_others",
      requestId,
      userId: session.user.id,
      path: pathname,
      method,
      httpStatus: 200,
      metadata: { revoked },
    });
    sendJson(res, 200, envelope({ ok: true, revoked }, requestId));
    return true;
  }

  /**
   * Step-up challenge — re-enter password, receive one-time X-WM-Step-Up token.
   * Required before high-risk actions (bulk delete, backup/export, privilege updates).
   */
  if (method === "POST" && subpath === "/step-up") {
    const session = await readSessionUser(req);
    if (!session) {
      const err = errorEnvelope("UNAUTHENTICATED", "Not authenticated", requestId, 401);
      sendJson(res, err.status, err.body);
      return true;
    }
    const body = await readJsonBody(req);
    if (body === null) {
      const err = errorEnvelope("PAYLOAD_TOO_LARGE", "Request body too large", requestId, 413);
      sendJson(res, err.status, err.body);
      return true;
    }
    const password = String((body as { password?: string }).password || "");
    if (password.length < 8) {
      const err = errorEnvelope(
        "VALIDATION_ERROR",
        "Password is required for step-up verification",
        requestId,
        400,
      );
      sendJson(res, err.status, err.body);
      return true;
    }
    const purposeRaw = String((body as { purpose?: string }).purpose || "privileged_admin_action");
    const purpose =
      purposeRaw === "bulk_user_delete" ||
      purposeRaw === "database_backup_export" ||
      purposeRaw === "admin_privilege_update" ||
      purposeRaw === "ops_flags_emergency"
        ? purposeRaw
        : "privileged_admin_action";

    const verify = await authService.login(session.user.email, password, meta);
    if (!verify.ok) {
      recordAuthFailureSignal(getClientIp(req), pathname);
      logSecurityEvent({
        event: "STEP_UP_DENIED",
        path: pathname,
        method,
        httpStatus: 403,
        clientKey: getClientIp(req),
        meta: { purpose },
      });
      const err = errorEnvelope(
        "STEP_UP_DENIED",
        "Step-up verification failed",
        requestId,
        403,
      );
      sendJson(res, err.status, err.body);
      return true;
    }

    const issued = issueStepUpToken({
      subject: session.user.id,
      purpose,
    });
    writeAuditLog({
      action: "step_up_issued",
      requestId,
      userId: session.user.id,
      path: pathname,
      method,
      httpStatus: 200,
      metadata: { purpose, expiresAtIso: issued.expiresAtIso },
    });
    sendJson(
      res,
      200,
      envelope(
        {
          ok: true,
          stepUpToken: issued.token,
          expiresAtIso: issued.expiresAtIso,
          purpose: issued.purpose,
          header: "X-WM-Step-Up",
        },
        requestId,
      ),
    );
    return true;
  }

  const err = errorEnvelope("NOT_FOUND", "Auth route not found", requestId, 404);
  sendJson(res, err.status, err.body);
  return true;
}
