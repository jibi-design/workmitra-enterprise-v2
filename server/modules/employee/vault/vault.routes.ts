// server/modules/employee/vault/vault.routes.ts
//
// Employee Work Vault endpoints.
// All handlers are behind requireAuth + requireEmployeeRole (enforced by the
// employee domain router — not re-applied here).
//
// Endpoints:
//   POST   /v1/jobmitra/employee/vault/otp/generate      — generate a new OTP
//   GET    /v1/jobmitra/employee/vault/sessions           — access log
//   DELETE /v1/jobmitra/employee/vault/sessions/:id      — revoke a session

import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/types.js";
import {
  generateVaultOtp,
  listEmployeeVaultSessions,
  revokeVaultSession,
} from "../../vault/vault.service.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";

const EMPLOYEE_VAULT_PREFIX = "/v1/jobmitra/employee/vault";

export async function handleEmployeeVaultRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(EMPLOYEE_VAULT_PREFIX)) return false;

  const requestId = req.requestId;
  const employeeId = req.authenticatedUser.id;
  const path = url.pathname;

  /* ── POST /employee/vault/otp/generate ─────────────────────────────────── */
  if (method === "POST" && path === `${EMPLOYEE_VAULT_PREFIX}/otp/generate`) {
    const body = await readJsonBody(req);

    if (!body) {
      sendJson(res, 400, {
        error: { code: "INVALID_BODY", message: "Request body must be valid JSON", requestId },
      });
      return true;
    }

    const result = await generateVaultOtp(employeeId, body.visibleFolderIds ?? []);

    if (!result.ok) {
      sendJson(res, 500, {
        error: { code: "OTP_GENERATE_FAILED", message: "Failed to generate OTP", requestId },
      });
      return true;
    }

    sendJson(
      res,
      201,
      envelope(
        {
          otpId: result.otpId,
          code: result.code,
          expiresAt: result.expiresAt,
          expiresInSeconds: Math.floor((result.expiresAt - Date.now()) / 1000),
        },
        requestId,
      ),
    );
    return true;
  }

  /* ── GET /employee/vault/sessions ──────────────────────────────────────── */
  if (method === "GET" && path === `${EMPLOYEE_VAULT_PREFIX}/sessions`) {
    const result = await listEmployeeVaultSessions(employeeId);

    if (!result.ok) {
      sendJson(res, 500, {
        error: { code: "SESSION_LIST_FAILED", message: "Failed to retrieve sessions", requestId },
      });
      return true;
    }

    sendJson(res, 200, envelope({ sessions: result.sessions }, requestId));
    return true;
  }

  /* ── DELETE /employee/vault/sessions/:sessionId ─────────────────────────── */
  const revokeMatch = path.match(/^\/v1\/jobmitra\/employee\/vault\/sessions\/([a-f0-9-]{36})$/);
  if (method === "DELETE" && revokeMatch) {
    const sessionId = revokeMatch[1];
    const result = await revokeVaultSession(sessionId, employeeId);

    if (!result.ok) {
      const statusMap: Record<string, number> = {
        not_found: 404,
        already_closed: 409,
        forbidden: 403,
        db_error: 500,
      };
      const status = statusMap[result.reason] ?? 500;
      sendJson(res, status, {
        error: {
          code: `VAULT_REVOKE_${result.reason.toUpperCase()}`,
          message: result.reason,
          requestId,
        },
      });
      return true;
    }

    sendJson(res, 200, envelope({ revoked: true }, requestId));
    return true;
  }

  return false;
}
