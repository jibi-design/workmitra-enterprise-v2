/**
 * Employer Doc Access routes — P1 STEP 2 server ACL.
 *
 * POST /v1/jobmitra/employer/doc-access/documents/access
 *   Headers: X-Doc-Access-Session (base64url JSON session + HMAC sig)
 *   Body: { documentId, workerMlId, folderId? }
 *   Rejects any byte payload fields (base64Data, etc.).
 *   Never returns document bytes — only ACL allow/deny.
 */

import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/types.js";
import { authorizeDocAccess } from "../../docAccess/docAccess.service.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";

const DOC_ACCESS_PREFIX = "/v1/jobmitra/employer/doc-access";
const SESSION_HEADER = "x-doc-access-session";

function readSessionHeader(req: AuthenticatedRequest): string | null {
  const raw = req.headers[SESSION_HEADER];
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0].trim()) return raw[0].trim();
  return null;
}

export async function handleEmployerDocAccessRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(DOC_ACCESS_PREFIX)) return false;

  const requestId = req.requestId;
  const employerId = req.authenticatedUser.id;
  // AuthUser has no ML uniqueId today — ACL prefers session.authUserId HMAC bind.
  const employerWmId: string | undefined = undefined;

  /* ── POST /employer/doc-access/documents/access ───────────────────────── */
  if (method === "POST" && url.pathname === `${DOC_ACCESS_PREFIX}/documents/access`) {
    const body = await readJsonBody(req);
    if (!body || typeof body !== "object") {
      sendJson(res, 400, {
        error: { code: "INVALID_BODY", message: "Request body must be valid JSON", requestId },
      });
      return true;
    }

    const result = authorizeDocAccess({
      authenticatedEmployerId: employerId,
      authenticatedEmployerWmId: employerWmId,
      sessionToken: readSessionHeader(req),
      body: body as {
        documentId: string;
        workerMlId: string;
        folderId?: string;
        base64Data?: unknown;
        thumbnailBase64?: unknown;
        payload?: unknown;
        bytes?: unknown;
        dataUrl?: unknown;
      },
    });

    if (!result.ok) {
      const statusMap: Record<string, number> = {
        missing_session: 401,
        invalid_session: 401,
        expired: 401,
        revoked: 401,
        employer_mismatch: 401,
        worker_mismatch: 403,
        missing_document_id: 400,
        byte_payload_forbidden: 400,
      };
      const codeMap: Record<string, string> = {
        missing_session: "DOC_ACCESS_SESSION_REQUIRED",
        invalid_session: "DOC_ACCESS_SESSION_INVALID",
        expired: "DOC_ACCESS_SESSION_EXPIRED",
        revoked: "DOC_ACCESS_SESSION_REVOKED",
        employer_mismatch: "DOC_ACCESS_EMPLOYER_MISMATCH",
        worker_mismatch: "DOC_ACCESS_WORKER_MISMATCH",
        missing_document_id: "DOC_ACCESS_DOCUMENT_REQUIRED",
        byte_payload_forbidden: "DOC_ACCESS_BYTES_FORBIDDEN",
      };
      sendJson(res, statusMap[result.reason] ?? 403, {
        error: {
          code: codeMap[result.reason] ?? "DOC_ACCESS_DENIED",
          message: result.reason,
          requestId,
        },
      });
      return true;
    }

    sendJson(
      res,
      200,
      envelope(
        {
          allowed: true,
          documentId: result.documentId,
          workerMlId: result.session.workerMlId,
          employerScopeId: result.session.employerScopeId,
          domain: result.session.domain,
          expiresAt: result.session.expiresAt,
          // Explicit: server never returns document bytes.
          bytes: null,
        },
        requestId,
      ),
    );
    return true;
  }

  return false;
}
