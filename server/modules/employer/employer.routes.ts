import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { requireAuth, requireEmployerRole } from "../../middleware/index.js";
import { handleEmployerCareerRoutes } from "./career/career.routes.js";
import { handleEmployerVaultRoutes } from "./vault/vault.routes.js";
import { sendNotFound } from "../../utils/http.js";

const EMPLOYER_PREFIX = "/v1/jobmitra/employer";

/**
 * Employer domain router.
 *
 * All requests entering this handler are gated by:
 *   1. requireAuth       — valid session cookie, user exists in store
 *   2. requireEmployerRole — session role must be 'employer'
 *
 * An Employee or Admin session hitting any /employer/* endpoint will receive 403.
 * Role is never read from the request body or query string.
 *
 * Sub-domain route handlers (career, shift, workspace) are mounted below.
 * Add new sub-domains here as separate route handlers.
 */
export async function handleEmployerRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(EMPLOYER_PREFIX)) return false;

  const requestId = randomUUID();

  await requireAuth(
    req,
    res,
    requestId,
    async (authedReq) => {
      await requireEmployerRole(
        authedReq,
        res,
        requestId,
        async (authedReq) => {
          // Career sub-domain
          const handledCareer = await handleEmployerCareerRoutes(authedReq, res, url, method);
          if (handledCareer) return;

          // Work Vault sub-domain
          const handledVault = await handleEmployerVaultRoutes(authedReq, res, url, method);
          if (handledVault) return;

          // Future sub-domains: shift, workspace, analytics
          sendNotFound(res, requestId, "Employer");
        },
        url,
      );
    },
    url,
  );

  return true;
}
