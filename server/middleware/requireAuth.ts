import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { sessionStore } from "../modules/auth/session.store.js";
import { authService } from "../modules/auth/auth.service.js";
import { isDbAuthEnabled } from "../modules/auth/env.js";
import { applySessionContext, initialActiveMode } from "../modules/auth/activeContext.helpers.js";
import type { ActiveMode } from "../modules/auth/types.js";
import type { AuthenticatedRequest, RouteHandler } from "./types.js";

const SESSION_COOKIE = "wm_session";

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, decodeURIComponent(rest.join("="))];
    }),
  );
}

function sendUnauthorized(res: ServerResponse, requestId: string): void {
  res.statusCode = 401;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: { code: "UNAUTHENTICATED", message: "Authentication required", requestId },
    }),
  );
}

/**
 * requireAuth — session validation gate.
 *
 * Validates the session cookie, resolves the authenticated user from the
 * session store (memory or DB), and attaches the user to the request object
 * with session activeMode / activeOrgId applied (dual-context).
 *
 * NEVER trusts any user ID or role sent by the client in the request body or headers.
 * Identity comes exclusively from the server-side session.
 */
export async function requireAuth(
  req: IncomingMessage,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<boolean> {
  const cookies = parseCookies(req.headers.cookie);
  const rawToken = cookies[SESSION_COOKIE];

  if (!rawToken) {
    sendUnauthorized(res, requestId);
    return true;
  }

  let userId: string | null = null;
  let activeMode: ActiveMode | null = null;
  let activeOrgId: string | null = null;

  if (isDbAuthEnabled()) {
    const session = await sessionStore.getDb(rawToken);
    userId = session?.userId ?? null;
    activeMode = session?.activeMode ?? null;
    activeOrgId = session?.activeOrgId ?? null;
  } else {
    const session = sessionStore.get(rawToken);
    userId = session?.userId ?? null;
    activeMode = session?.activeMode ?? null;
    activeOrgId = session?.activeOrgId ?? null;
  }

  if (!userId) {
    sendUnauthorized(res, requestId);
    return true;
  }

  const base = await authService.getUserById(userId);
  if (!base) {
    sendUnauthorized(res, requestId);
    return true;
  }

  const resolvedMode = activeMode ?? initialActiveMode(base.role);
  const user = applySessionContext(base, {
    activeMode: resolvedMode,
    activeOrgId,
  });

  const authedReq = req as AuthenticatedRequest;
  authedReq.authenticatedUser = user;
  authedReq.requestId = requestId;

  await next(authedReq, res, url);
  return true;
}

/**
 * Generates a request ID if one is not already present.
 * Used at the top of every route handler.
 */
export function getRequestId(): string {
  return randomUUID();
}
