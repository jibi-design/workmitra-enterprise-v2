import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, sendNotFound, envelope, readJsonBody } from "../../../utils/http.js";
import { employerCareerService } from "./career.service.js";
import { handleCareerCandidatesRadarRoute } from "./radar.routes.js";

const CAREER_PREFIX = "/v1/jobmitra/employer/career";

/**
 * Employer Career route handler.
 *
 * Receives a request that has already passed requireAuth + requireEmployerRole.
 * Never re-reads role or identity from the request body — uses authedReq.authenticatedUser only.
 *
 * Priority 3 targets (Career Employment gate):
 *   - /jobs/:jobId/applications/:applicationId/offer         → step 1: Employer issues offer
 *   - /jobs/:jobId/applications/:applicationId/confirm-hire  → step 3: Employer confirms hire
 *   Employment may only be created after steps 1 + 2 (employee accept) + 3 (this endpoint).
 *
 * All routes below are scaffolded and ready to receive business logic.
 */
export async function handleEmployerCareerRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const pathname = url.pathname;
  if (!pathname.startsWith(CAREER_PREFIX)) return false;

  const { requestId } = req;
  const subpath = pathname.slice(CAREER_PREFIX.length) || "/";

  if (await handleCareerCandidatesRadarRoute(req, res, url, method)) return true;

  // POST /v1/jobmitra/employer/career/jobs
  // Employer creates a new Career job post
  if (method === "POST" && subpath === "/jobs") {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }

    const result = await employerCareerService.createPost(req.authenticatedUser, body);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: {
          code: result.code,
          reason: "reason" in result ? result.reason : undefined,
          message: result.message,
          maturityStage: "maturityStage" in result ? result.maturityStage : undefined,
          requestId,
        },
      });
      return true;
    }

    sendJson(res, 201, envelope({ post: result.post }, requestId));
    return true;
  }

  // GET /v1/jobmitra/employer/career/jobs
  // Employer lists their own Career job posts
  if (method === "GET" && subpath === "/jobs") {
    const result = await employerCareerService.listMyPosts(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 200, envelope({ posts: result.posts }, requestId));
    return true;
  }

  // PATCH /v1/jobmitra/employer/career/jobs/:jobId
  const updateMatch = subpath.match(/^\/jobs\/([^/]+)$/);
  if (method === "PATCH" && updateMatch) {
    const jobId = updateMatch[1];
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }

    const result = await employerCareerService.updatePost(jobId, req.authenticatedUser, body);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: {
          code: result.code,
          reason: "reason" in result ? result.reason : undefined,
          message: result.message,
          maturityStage: "maturityStage" in result ? result.maturityStage : undefined,
          requestId,
        },
      });
      return true;
    }

    sendJson(res, 200, envelope({ post: result.post }, requestId));
    return true;
  }

  // DELETE /v1/jobmitra/employer/career/jobs/:jobId
  const deleteMatch = subpath.match(/^\/jobs\/([^/]+)$/);
  if (method === "DELETE" && deleteMatch) {
    const jobId = deleteMatch[1];
    const result = await employerCareerService.deletePost(jobId, req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 200, envelope({ deleted: true }, requestId));
    return true;
  }

  // GET /v1/jobmitra/employer/career/jobs/:jobId/applications
  // Employer views all applications for one of their Career job posts
  const appListMatch = subpath.match(/^\/jobs\/([^/]+)\/applications$/);
  if (method === "GET" && appListMatch) {
    const jobId = appListMatch[1];
    const result = await employerCareerService.listApplicationsForJob(jobId, req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ applications: result.applications }, requestId));
    return true;
  }

  // GET /v1/jobmitra/employer/career/jobs/:jobId/applications/:applicationId
  const appGetMatch = subpath.match(/^\/jobs\/([^/]+)\/applications\/([^/]+)$/);
  if (method === "GET" && appGetMatch) {
    const jobId = appGetMatch[1];
    const applicationId = appGetMatch[2];
    const result = await employerCareerService.getApplicationForJob(
      jobId,
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

  // PATCH /v1/jobmitra/employer/career/jobs/:jobId/applications/:applicationId/status
  const appStatusMatch = subpath.match(/^\/jobs\/([^/]+)\/applications\/([^/]+)\/status$/);
  if (method === "PATCH" && appStatusMatch) {
    const jobId = appStatusMatch[1];
    const applicationId = appStatusMatch[2];
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerCareerService.updateApplicationStatus(
      jobId,
      applicationId,
      req.authenticatedUser,
      body,
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

  // POST /v1/jobmitra/employer/career/applications/:applicationId/shortlist
  // Employer shortlists a candidate — moves application to interview stage
  const shortlistMatch = subpath.match(/^\/applications\/([^/]+)\/shortlist$/);
  if (method === "POST" && shortlistMatch) {
    const applicationId = shortlistMatch[1];
    const result = await employerCareerService.shortlistApplication(
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

  // POST /v1/jobmitra/employer/career/applications/:applicationId/offer
  // Priority 3 — Step 1 of the Career Employment gate: Employer issues an offer.
  // Gate requires: offer issued AND employee accepted AND employer confirmed → Employment created.
  const offerMatch = subpath.match(/^\/applications\/([^/]+)\/offer$/);
  if (method === "POST" && offerMatch) {
    const applicationId = offerMatch[1];

    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }

    const terms =
      body.terms !== null && typeof body.terms === "object" && !Array.isArray(body.terms)
        ? (body.terms as Record<string, unknown>)
        : {};

    let expiresAt: Date | null = null;
    if (typeof body.expires_at === "string") {
      const parsed = new Date(body.expires_at);
      if (isNaN(parsed.getTime())) {
        sendJson(res, 400, {
          error: {
            code: "VALIDATION_ERROR",
            message: "expires_at must be a valid ISO 8601 date string",
            requestId,
          },
        });
        return true;
      }
      if (parsed <= new Date()) {
        sendJson(res, 400, {
          error: {
            code: "VALIDATION_ERROR",
            message: "expires_at must be a future date",
            requestId,
          },
        });
        return true;
      }
      expiresAt = parsed;
    }

    const result = await employerCareerService.issueOffer(
      applicationId,
      req.authenticatedUser,
      terms,
      expiresAt,
    );

    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 201, envelope({ offer: result.offer }, requestId));
    return true;
  }

  // POST /v1/jobmitra/employer/career/applications/:applicationId/confirm-hire
  // Priority 3 — Step 3 of the Career Employment gate: Employer confirms the hire.
  // Employment is created ONLY when all 3 steps are complete.
  // Idempotent — calling this twice returns the same Employment record safely.
  const confirmHireMatch = subpath.match(/^\/applications\/([^/]+)\/confirm-hire$/);
  if (method === "POST" && confirmHireMatch) {
    const applicationId = confirmHireMatch[1];

    const body = (await readJsonBody(req)) ?? {};
    const details =
      body.details && typeof body.details === "object" && !Array.isArray(body.details)
        ? (body.details as Record<string, unknown>)
        : undefined;

    const result = await employerCareerService.confirmHire(
      applicationId,
      req.authenticatedUser,
      details,
    );

    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(
      res,
      200,
      envelope(
        {
          employment: result.employment,
          alreadyConfirmed: result.alreadyConfirmed,
        },
        requestId,
      ),
    );
    return true;
  }

  // GET /v1/jobmitra/employer/career/staff — employments for HR/staff views
  if (method === "GET" && subpath === "/staff") {
    const result = await employerCareerService.listMyEmployments(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ employments: result.employments }, requestId));
    return true;
  }

  // PATCH /v1/jobmitra/employer/career/employments/:employmentId
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
    const result = await employerCareerService.updateEmployment(
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

  sendNotFound(res, requestId, "Employer career");
  return true;
}
