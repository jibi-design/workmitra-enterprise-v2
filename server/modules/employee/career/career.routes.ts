import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, sendNotFound, envelope, readJsonBody } from "../../../utils/http.js";
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
 *   - withdraw      → employee withdraws pre-offer application
 *
 * Apply / list are implemented to populate client app-id bridges for gate calls.
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
    const result = await employeeCareerService.listPublishedPosts();
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ posts: result.posts }, requestId));
    return true;
  }

  // POST /v1/jobmitra/employee/career/jobs/:jobId/apply
  // Employee applies to a Career job post
  const applyMatch = subpath.match(/^\/jobs\/([^/]+)\/apply$/);
  if (method === "POST" && applyMatch) {
    const jobId = applyMatch[1];

    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }

    const coverNoteRaw = body.cover_note;
    const coverNote =
      typeof coverNoteRaw === "string" && coverNoteRaw.trim() ? coverNoteRaw.trim() : null;

    const result = await employeeCareerService.applyToJob(jobId, req.authenticatedUser, coverNote);

    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 201, envelope({ application: result.application }, requestId));
    return true;
  }

  // GET /v1/jobmitra/employee/career/applications
  // Employee views their own Career applications
  if (method === "GET" && subpath === "/applications") {
    const result = await employeeCareerService.listMyApplications(req.authenticatedUser);

    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 200, envelope({ applications: result.applications }, requestId));
    return true;
  }

  // GET /v1/jobmitra/employee/career/applications/:applicationId
  // Employee views a specific Career application
  const appDetailMatch = subpath.match(/^\/applications\/([^/]+)$/);
  if (method === "GET" && appDetailMatch) {
    const applicationId = appDetailMatch[1];
    const result = await employeeCareerService.getMyApplication(
      applicationId,
      req.authenticatedUser,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ application: result.application }, requestId));
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
  // Employee declines the offer — application moves to 'offer_declined', no Employment is created.
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

  // POST /v1/jobmitra/employee/career/applications/:applicationId/withdraw
  // Employee withdraws application (pending | shortlisted | interview_scheduled only).
  const withdrawMatch = subpath.match(/^\/applications\/([^/]+)\/withdraw$/);
  if (method === "POST" && withdrawMatch) {
    const applicationId = withdrawMatch[1];

    const result = await employeeCareerService.withdrawApplication(
      applicationId,
      req.authenticatedUser,
    );

    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 200, envelope({ application: result.application }, requestId));
    return true;
  }

  // GET /v1/jobmitra/employee/career/employments
  if (method === "GET" && subpath === "/employments") {
    const result = await employeeCareerService.listMyEmployments(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ employments: result.employments }, requestId));
    return true;
  }

  // PATCH /v1/jobmitra/employee/career/employments/:employmentId
  const empPatchMatch = subpath.match(/^\/employments\/([^/]+)$/);
  if (method === "PATCH" && empPatchMatch) {
    const employmentId = empPatchMatch[1];
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employeeCareerService.updateEmployment(
      employmentId,
      req.authenticatedUser,
      body,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ employment: result.employment }, requestId));
    return true;
  }

  sendNotFound(res, requestId, "Employee career");
  return true;
}
