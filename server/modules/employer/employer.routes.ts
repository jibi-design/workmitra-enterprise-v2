import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { requireAuth, requireEmployerRole } from "../../middleware/index.js";
import { handleEmployerCareerRoutes } from "./career/career.routes.js";
import { handleEmployerShiftRoutes } from "./shift/shift.routes.js";
import { handleEmployerVaultRoutes } from "./vault/vault.routes.js";
import { handleEmployerDocAccessRoutes } from "./docAccess/docAccess.routes.js";
import { handleEmployerHrRoutes } from "./hr/hr.routes.js";
import { handleEmployerWorkforceRoutes } from "./workforce/workforce.routes.js";
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
 * Sub-domain route handlers (career, shift, vault, hr, workforce) are mounted below.
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
          const handledCareer = await handleEmployerCareerRoutes(authedReq, res, url, method);
          if (handledCareer) return;

          const handledShift = await handleEmployerShiftRoutes(authedReq, res, url, method);
          if (handledShift) return;

          const handledVault = await handleEmployerVaultRoutes(authedReq, res, url, method);
          if (handledVault) return;

          const handledDocAccess = await handleEmployerDocAccessRoutes(authedReq, res, url, method);
          if (handledDocAccess) return;

          const handledHr = await handleEmployerHrRoutes(authedReq, res, url, method);
          if (handledHr) return;

          const handledWorkforce = await handleEmployerWorkforceRoutes(authedReq, res, url, method);
          if (handledWorkforce) return;

          sendNotFound(res, requestId, "Employer");
        },
        url,
      );
    },
    url,
  );

  return true;
}
