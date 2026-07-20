import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, sendNotImplemented, sendNotFound, envelope } from "../../../utils/http.js";
import { employeeCareerService } from "./career.service.js";

const CAREER_PREFIX = "/v1/jobmitra/employee/career";

/**
 * Employee Career route handler.
 *
 * Receives a request that has already passed requireAuth + requireEmployeeRole.
 * Never re-reads role or identity from the request body — uses authedReq.authenticatedUser only.
 *
 * Priority 3 targets (Career Employment gate):
 *   - offer/accept  → step 2 of gate (employee accepts)
 *   - offer/decline → employee rejects offer
 *
 * All routes below are scaffolded and ready to receive business logic.
 */
export async function handleEmployeeCareerRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const pathname = url.pathname;
  if (!pathname.startsWith(CAREER_PREFIX)) return false;

  const { requestId } = req;
  const subpath = pathname.slice(CAREER_PREFIX.length) || "/";

  // GET /v1/jobmitra/employee/career/jobs
  // Browse available Career job posts
  if (method === "GET" && subpath === "/jobs") {
    sendNotImplemented(res, requestId, "GET /employee/career/jobs");
    return true;
  }

  // POST /v1/jobmitra/employee/career/jobs/:jobId/apply
  // Employee applies to a Career job post
  const applyMatch = subpath.match(/^\/jobs\/([^/]+)\/apply$/);
  if (method === "POST" && applyMatch) {
    sendNotImplemented(res, requestId, "POST /employee/career/jobs/:jobId/apply");
    return true;
  }

  // GET /v1/jobmitra/employee/career/applications
  // Employee views their own Career applications
  if (method === "GET" && subpath === "/applications") {
    sendNotImplemented(res, requestId, "GET /employee/career/applications");
    return true;
  }

  // GET /v1/jobmitra/employee/career/applications/:applicationId
  // Employee views a specific Career application
  const appDetailMatch = subpath.match(/^\/applications\/([^/]+)$/);
  if (method === "GET" && appDetailMatch) {
    sendNotImplemented(res, requestId, "GET /employee/career/applications/:applicationId");
    return true;
  }

  // POST /v1/jobmitra/employee/career/applications/:applicationId/offer/accept
  // Priority 3 — Step 2 of the Career Employment gate: Employee accepts the offer.
  // Gate requires: offer issued AND employee accepted AND employer confirmed → Employment created.
  // Employment is NOT created here — it is created only after employer confirms (Step 3).
  const offerAcceptMatch = subpath.match(/^\/applications\/([^/]+)\/offer\/accept$/);
  if (method === "POST" && offerAcceptMatch) {
    const applicationId = offerAcceptMatch[1];

    const result = await employeeCareerService.acceptOffer(applicationId, req.authenticatedUser);

    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 200, envelope({ application: result.application }, requestId));
    return true;
  }

  // POST /v1/jobmitra/employee/career/applications/:applicationId/offer/decline
  // Employee declines the offer — application moves to 'offer_declined', no Employment created.
  const offerDeclineMatch = subpath.match(/^\/applications\/([^/]+)\/offer\/decline$/);
  if (method === "POST" && offerDeclineMatch) {
    const applicationId = offerDeclineMatch[1];

    const result = await employeeCareerService.declineOffer(applicationId, req.authenticatedUser);

    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 200, envelope({ application: result.application }, requestId));
    return true;
  }

  sendNotFound(res, requestId, "Employee career");
  return true;
}
