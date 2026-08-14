import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../middleware/index.js";
import { sendJson, envelope, readJsonBody } from "../../utils/http.js";
import { offboardEmployment, resignEmployment } from "./employmentExit.service.js";

export async function handleEmployeeCareerExitRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const prefix = "/v1/jobmitra/employee/career";
  if (!url.pathname.startsWith(prefix) || method !== "POST") return false;
  const match = url.pathname.slice(prefix.length).match(/^\/employments\/([^/]+)\/resign$/);
  if (!match) return false;
  const body = (await readJsonBody(req)) ?? {};
  const details =
    body.details && typeof body.details === "object" && !Array.isArray(body.details)
      ? (body.details as Record<string, unknown>)
      : {};
  const result = await resignEmployment(match[1], req.authenticatedUser, details);
  if (!result.ok) {
    sendJson(res, result.httpStatus, {
      error: { code: result.code, message: result.message, requestId: req.requestId },
    });
    return true;
  }
  sendJson(res, 200, envelope(result, req.requestId));
  return true;
}

export async function handleEmployerCareerExitRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const prefix = "/v1/jobmitra/employer/career";
  if (!url.pathname.startsWith(prefix) || method !== "POST") return false;
  const match = url.pathname.slice(prefix.length).match(/^\/employments\/([^/]+)\/offboard$/);
  if (!match) return false;
  const body = (await readJsonBody(req)) ?? {};
  const details =
    body.details && typeof body.details === "object" && !Array.isArray(body.details)
      ? (body.details as Record<string, unknown>)
      : {};
  const result = await offboardEmployment(match[1], req.authenticatedUser, details);
  if (!result.ok) {
    sendJson(res, result.httpStatus, {
      error: { code: result.code, message: result.message, requestId: req.requestId },
    });
    return true;
  }
  sendJson(res, 200, envelope(result, req.requestId));
  return true;
}
