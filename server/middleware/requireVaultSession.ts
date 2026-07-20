// server/middleware/requireVaultSession.ts
//
// Vault session gate for employer vault endpoints.
//
// Called AFTER requireAuth + requireEmployerRole. Reads the X-Vault-Session-Id
// header, validates the session against the DB, and confirms the session's
// employer_id matches the authenticated employer's user ID.
//
// SECURITY CONTRACT:
//   - The session ID from the header is treated as an opaque token only.
//   - All trust properties (expiry, ownership, status, folder scope) come from
//     the DB row — never from the header or any client-supplied value.
//   - A mismatched employer ID returns 401 (not 403) to avoid leaking that the
//     session ID is valid but belongs to someone else.

import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest, RouteHandler } from "./types.js";
import { validateVaultSession } from "../modules/vault/vault.service.js";
import { sendJson } from "../utils/http.js";

const VAULT_SESSION_HEADER = "x-vault-session-id";

function sendVaultUnauthorized(res: ServerResponse, requestId: string, message: string): void {
  sendJson(res, 401, {
    error: { code: "VAULT_SESSION_INVALID", message, requestId },
  });
}

/**
 * requireVaultSession — vault session gate.
 *
 * Validates the vault session token from the X-Vault-Session-Id header.
 * Attaches the verified VaultSessionView to req.vaultSession on success.
 *
 * Usage (inside an employer vault route handler, after requireAuth + requireEmployerRole):
 *   await requireVaultSession(authedReq, res, requestId, async (sessionReq) => {
 *     // sessionReq.vaultSession is guaranteed to be valid, active, and owned
 *     // by the authenticated employer.
 *   });
 */
export async function requireVaultSession(
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  const rawSessionId = req.headers[VAULT_SESSION_HEADER];

  if (!rawSessionId || typeof rawSessionId !== "string" || rawSessionId.trim().length === 0) {
    sendVaultUnauthorized(res, requestId, "Vault session token is required");
    return;
  }

  const sessionId = rawSessionId.trim();
  const employerId = req.authenticatedUser.id;

  const session = await validateVaultSession(sessionId, employerId);

  if (!session) {
    sendVaultUnauthorized(res, requestId, "Vault session is invalid, expired, or not yours");
    return;
  }

  req.vaultSession = session;
  await next(req, res, url);
}
