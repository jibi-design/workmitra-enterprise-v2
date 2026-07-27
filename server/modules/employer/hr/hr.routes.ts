import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/types.js";
import { envelope, readJsonBody, sendJson, sendNotFound } from "../../../utils/http.js";
import { employerHrService } from "./hr.service.js";

const HR_PREFIX = "/v1/jobmitra/employer/hr";

export async function handleEmployerHrRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(HR_PREFIX)) return false;

  const requestId = req.requestId;
  const subpath = url.pathname.slice(HR_PREFIX.length) || "/";

  if (method === "GET" && subpath === "/leave-requests") {
    const result = await employerHrService.listLeaveRequests(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ leaveRequests: result.leaveRequests }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/leave-requests") {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerHrService.createLeaveRequest(req.authenticatedUser, body);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 201, envelope({ leaveRequest: result.leaveRequest }, requestId));
    return true;
  }

  const leavePatch = subpath.match(/^\/leave-requests\/([^/]+)$/);
  if (method === "PATCH" && leavePatch) {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerHrService.updateLeaveRequest(
      leavePatch[1],
      req.authenticatedUser,
      body,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ leaveRequest: result.leaveRequest }, requestId));
    return true;
  }

  if (method === "GET" && subpath === "/attendance-logs") {
    const result = await employerHrService.listAttendanceLogs(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ attendanceLogs: result.attendanceLogs }, requestId));
    return true;
  }

  if (method === "GET" && subpath === "/performance-reviews") {
    const result = await employerHrService.listPerformanceReviews(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ performanceReviews: result.performanceReviews }, requestId));
    return true;
  }

  if (method === "GET" && subpath === "/incident-reports") {
    const result = await employerHrService.listIncidentReports(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ incidentReports: result.incidentReports }, requestId));
    return true;
  }

  if (method === "GET" && subpath === "/company-notices") {
    const result = await employerHrService.listCompanyNotices(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ companyNotices: result.companyNotices }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/company-notices") {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerHrService.createCompanyNotice(req.authenticatedUser, body);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 201, envelope({ companyNotice: result.companyNotice }, requestId));
    return true;
  }

  const noticePatch = subpath.match(/^\/company-notices\/([^/]+)$/);
  if (method === "PATCH" && noticePatch) {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerHrService.updateCompanyNotice(
      noticePatch[1],
      req.authenticatedUser,
      body,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ companyNotice: result.companyNotice }, requestId));
    return true;
  }

  sendNotFound(res, requestId, "Employer HR");
  return true;
}
