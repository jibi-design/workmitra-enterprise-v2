import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, envelope, readJsonBody } from "../../../utils/http.js";
import { employerVerificationService } from "./employerVerification.service.js";
import { companiesHouseService } from "./companiesHouse.service.js";

const VERIFICATION_PREFIX = "/v1/jobmitra/employer/verification";

export async function handleEmployerVerificationRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const pathname = url.pathname;
  if (!pathname.startsWith(VERIFICATION_PREFIX)) return false;

  const { requestId } = req;
  const subpath = pathname.slice(VERIFICATION_PREFIX.length) || "/";

  // GET /v1/jobmitra/employer/verification/companies-house/:crn
  if (method === "GET" && subpath.startsWith("/companies-house/")) {
    const crn = decodeURIComponent(subpath.slice("/companies-house/".length));
    const result = await companiesHouseService.lookupByCrn(crn);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ company: result.company }, requestId));
    return true;
  }

  // GET /v1/jobmitra/employer/verification
  if (method === "GET" && (subpath === "/" || subpath === "")) {
    const verification = employerVerificationService.getForEmployer(req.authenticatedUser);
    sendJson(res, 200, envelope({ verification }, requestId));
    return true;
  }

  // PUT /v1/jobmitra/employer/verification — sync contact/registration from client after OTP
  if (method === "PUT" && (subpath === "/" || subpath === "")) {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = employerVerificationService.upsertForEmployer(
      req.authenticatedUser,
      body as Record<string, unknown>,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ verification: result.verification }, requestId));
    return true;
  }

  // POST /v1/jobmitra/employer/verification/tracks/enterprise
  if (method === "POST" && subpath === "/tracks/enterprise") {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerVerificationService.submitEnterpriseTrack(
      req.authenticatedUser,
      body as Record<string, unknown>,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ verification: result.verification }, requestId));
    return true;
  }

  // POST /v1/jobmitra/employer/verification/tracks/micro
  if (method === "POST" && subpath === "/tracks/micro") {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = employerVerificationService.submitMicroTrack(
      req.authenticatedUser,
      body as Record<string, unknown>,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ verification: result.verification }, requestId));
    return true;
  }

  sendJson(res, 404, {
    error: { code: "NOT_FOUND", message: "Verification route not found", requestId },
  });
  return true;
}
