import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";
import { employerPlannerService } from "./planner.service.js";

const PLANNER_PREFIX = "/v1/jobmitra/employer/planner";

function sendMutationError(
  res: ServerResponse,
  requestId: string,
  result: {
    httpStatus: number;
    code: string;
    message: string;
    reason?: string;
    maturityStage?: string;
  },
): void {
  sendJson(res, result.httpStatus, {
    error: {
      code: result.code,
      reason: result.reason,
      message: result.message,
      maturityStage: result.maturityStage,
      requestId,
    },
  });
}

export async function handleEmployerPlannerRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const pathname = url.pathname;
  if (!pathname.startsWith(PLANNER_PREFIX)) return false;

  const { requestId } = req;
  const subpath = pathname.slice(PLANNER_PREFIX.length) || "/";

  // GET /v1/jobmitra/employer/planner/plans
  if (method === "GET" && subpath === "/plans") {
    const result = await employerPlannerService.listMyPlans(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ plans: result.plans }, requestId));
    return true;
  }

  // POST /v1/jobmitra/employer/planner/plans
  if (method === "POST" && subpath === "/plans") {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerPlannerService.createPlan(
      req.authenticatedUser,
      body as Record<string, unknown>,
    );
    if (!result.ok) {
      sendMutationError(res, requestId, result);
      return true;
    }
    sendJson(res, 201, envelope({ plan: result.plan }, requestId));
    return true;
  }

  // PATCH /v1/jobmitra/employer/planner/plans/:planId
  const updateMatch = subpath.match(/^\/plans\/([^/]+)$/);
  if (method === "PATCH" && updateMatch) {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerPlannerService.updatePlan(
      updateMatch[1],
      req.authenticatedUser,
      body as Record<string, unknown>,
    );
    if (!result.ok) {
      sendMutationError(res, requestId, result);
      return true;
    }
    sendJson(res, 200, envelope({ plan: result.plan }, requestId));
    return true;
  }

  sendJson(res, 404, {
    error: { code: "NOT_FOUND", message: "Planner route not found", requestId },
  });
  return true;
}
