import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { requireAuth, roleGateEmployer } from "../../middleware/index.js";
import { handleEmployerCareerRoutes } from "./career/career.routes.js";
import { handleEmployerShiftRoutes } from "./shift/shift.routes.js";
import { handleEmployerVaultRoutes } from "./vault/vault.routes.js";
import { handleEmployerDocAccessRoutes } from "./docAccess/docAccess.routes.js";
import { handleEmployerHrRoutes } from "./hr/hr.routes.js";
import { handleEmployerWorkforceRoutes } from "./workforce/workforce.routes.js";
import { handleEmployerVerificationRoutes } from "./verification/verification.routes.js";
import { handleEmployerPlannerRoutes } from "./planner/planner.routes.js";
import { handleEmployerNotificationRoutes } from "./notifications/notifications.routes.js";
import { handleEmployerCareerExitRoutes } from "../career/career.exit.routes.js";
import { sendNotFound } from "../../utils/http.js";

const EMPLOYER_PREFIX = "/v1/jobmitra/employer";

/**
 * Employer domain router.
 *
 * All requests entering this handler are gated by:
 *   1. requireAuth       — valid session cookie, user exists in store
 *   2. roleGateEmployer (WAVE-5.1 Layer 2) — session role must be 'employer'
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
      await roleGateEmployer(
        authedReq,
        res,
        requestId,
        async (authedReq) => {
          const handledNotifications = await handleEmployerNotificationRoutes(
            authedReq,
            res,
            url,
            method,
          );
          if (handledNotifications) return;

          const handledVerification = await handleEmployerVerificationRoutes(
            authedReq,
            res,
            url,
            method,
          );
          if (handledVerification) return;

          const handledExit = await handleEmployerCareerExitRoutes(authedReq, res, url, method);
          if (handledExit) return;

          const handledCareer = await handleEmployerCareerRoutes(authedReq, res, url, method);
          if (handledCareer) return;

          const handledShift = await handleEmployerShiftRoutes(authedReq, res, url, method);
          if (handledShift) return;

          const handledPlanner = await handleEmployerPlannerRoutes(authedReq, res, url, method);
          if (handledPlanner) return;

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
