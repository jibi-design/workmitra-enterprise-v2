import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { requireAuth, requireEmployeeRole } from "../../middleware/index.js";
import { handleEmployeeCareerRoutes } from "./career/career.routes.js";
import { handleEmployeeVaultRoutes } from "./vault/vault.routes.js";
import { sendNotFound } from "../../utils/http.js";

const EMPLOYEE_PREFIX = "/v1/jobmitra/employee";

/**
 * Employee domain router.
 *
 * All requests entering this handler are gated by:
 *   1. requireAuth      — valid session cookie, user exists in store
 *   2. requireEmployeeRole — session role must be 'employee'
 *
 * An Employer or Admin session hitting any /employee/* endpoint will receive 403.
 * Role is never read from the request body or query string.
 *
 * Sub-domain route handlers (career, shift, profile) are mounted below.
 * Add new sub-domains here as separate route handlers.
 */
export async function handleEmployeeRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(EMPLOYEE_PREFIX)) return false;

  const requestId = randomUUID();

  await requireAuth(
    req,
    res,
    requestId,
    async (authedReq) => {
      await requireEmployeeRole(
        authedReq,
        res,
        requestId,
        async (authedReq) => {
          // Career sub-domain
          const handledCareer = await handleEmployeeCareerRoutes(authedReq, res, url, method);
          if (handledCareer) return;

          // Work Vault sub-domain
          const handledVault = await handleEmployeeVaultRoutes(authedReq, res, url, method);
          if (handledVault) return;

          // Future sub-domains: shift, profile, workspace, ratings
          sendNotFound(res, requestId, "Employee");
        },
        url,
      );
    },
    url,
  );

  return true;
}
