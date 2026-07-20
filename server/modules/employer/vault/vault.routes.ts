// server/modules/employer/vault/vault.routes.ts
//
// Employer Work Vault endpoints.
// All handlers are behind requireAuth + requireEmployerRole (enforced by the
// employer domain router — not re-applied here).
//
// Endpoints:
//   POST /v1/jobmitra/employer/vault/otp/verify   — verify employee OTP, create session
//   GET  /v1/jobmitra/employer/vault/session       — get own active session + visible folder IDs
//
// Session-gated endpoints use requireVaultSession which reads X-Vault-Session-Id.
// The employer cannot access any folder not in session.visibleFolderIds.
// This is enforced server-side — the client cannot override it.

import type { ServerResponse } from "node:http";
import { requireVaultSession } from "../../../middleware/requireVaultSession.js";
import type { AuthenticatedRequest } from "../../../middleware/types.js";
import { verifyVaultOtp } from "../../vault/vault.service.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";

const EMPLOYER_VAULT_PREFIX = "/v1/jobmitra/employer/vault";

export async function handleEmployerVaultRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(EMPLOYER_VAULT_PREFIX)) return false;

  const requestId = req.requestId;
  const employerId = req.authenticatedUser.id;
  const path = url.pathname;

  /* ── POST /employer/vault/otp/verify ─────────────────────────────────── */
  if (method === "POST" && path === `${EMPLOYER_VAULT_PREFIX}/otp/verify`) {
    const body = await readJsonBody(req);

    if (!body) {
      sendJson(res, 400, {
        error: { code: "INVALID_BODY", message: "Request body must be valid JSON", requestId },
      });
      return true;
    }

    const { code, employeeUserId, employerName, employerWmId } = body;

    if (
      !employeeUserId ||
      typeof employeeUserId !== "string" ||
      employeeUserId.trim().length === 0
    ) {
      sendJson(res, 400, {
        error: { code: "MISSING_EMPLOYEE_ID", message: "employeeUserId is required", requestId },
      });
      return true;
    }

    const result = await verifyVaultOtp(
      employeeUserId.trim(),
      employerId,
      code,
      employerName,
      employerWmId,
    );

    if (!result.ok) {
      const statusMap: Record<string, number> = {
        no_active_otp: 404,
        invalid_code: 401,
        otp_locked: 429,
        employee_not_found: 404,
        db_error: 500,
      };
      const codeMap: Record<string, string> = {
        no_active_otp: "NO_ACTIVE_OTP",
        invalid_code: "INVALID_OTP_CODE",
        otp_locked: "OTP_LOCKED",
        employee_not_found: "EMPLOYEE_NOT_FOUND",
        db_error: "VAULT_ACCESS_FAILED",
      };
      const status = statusMap[result.reason] ?? 500;
      sendJson(res, status, {
        error: {
          code: codeMap[result.reason] ?? "VAULT_ACCESS_FAILED",
          message: result.reason,
          requestId,
        },
      });
      return true;
    }

    sendJson(
      res,
      201,
      envelope(
        {
          sessionId: result.session.id,
          visibleFolderIds: result.session.visibleFolderIds,
          expiresAt: result.session.expiresAt,
          expiresInSeconds: Math.floor((result.session.expiresAt - Date.now()) / 1000),
        },
        requestId,
      ),
    );
    return true;
  }

  /* ── GET /employer/vault/session ─────────────────────────────────────── */
  if (method === "GET" && path === `${EMPLOYER_VAULT_PREFIX}/session`) {
    await requireVaultSession(
      req,
      res,
      requestId,
      async (sessionReq) => {
        const session = sessionReq.vaultSession!;

        sendJson(
          res,
          200,
          envelope(
            {
              sessionId: session.id,
              employeeId: session.employeeId,
              visibleFolderIds: session.visibleFolderIds,
              status: session.status,
              expiresAt: session.expiresAt,
              expiresInSeconds: Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000)),
            },
            requestId,
          ),
        );
      },
      url,
    );
    return true;
  }

  return false;
}
