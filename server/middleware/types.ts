import type { IncomingMessage, ServerResponse } from "node:http";
import type { AuthUser } from "../modules/auth/types.js";
import type { VaultSessionView } from "../modules/vault/vault.types.js";

/**
 * Extends IncomingMessage with the authenticated user attached by requireAuth.
 * All protected route handlers receive this type — never trust req.body for identity.
 *
 * vaultSession is optionally attached by requireVaultSession for employer vault endpoints.
 * It is NEVER populated from a client-supplied header value alone — it is always
 * resolved from the DB and validated against the authenticated employer's session user ID.
 */
export interface AuthenticatedRequest extends IncomingMessage {
  authenticatedUser: AuthUser;
  requestId: string;
  vaultSession?: VaultSessionView;
}

export type RouteHandler = (
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
) => Promise<void>;
