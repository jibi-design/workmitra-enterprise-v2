import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/types.js";
import { envelope, readJsonBody, sendJson, sendNotFound } from "../../../utils/http.js";
import { employerWorkforceService } from "./workforce.service.js";

const WF_PREFIX = "/v1/jobmitra/employer/workforce";

export async function handleEmployerWorkforceRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (!url.pathname.startsWith(WF_PREFIX)) return false;

  const requestId = req.requestId;
  const subpath = url.pathname.slice(WF_PREFIX.length) || "/";

  if (method === "GET" && subpath === "/groups") {
    const result = await employerWorkforceService.listGroups(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ groups: result.groups }, requestId));
    return true;
  }

  if (method === "POST" && subpath === "/groups") {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerWorkforceService.createGroup(req.authenticatedUser, body);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 201, envelope({ group: result.group }, requestId));
    return true;
  }

  const groupPatch = subpath.match(/^\/groups\/([^/]+)$/);
  if (method === "PATCH" && groupPatch) {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerWorkforceService.updateGroup(
      groupPatch[1],
      req.authenticatedUser,
      body,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ group: result.group }, requestId));
    return true;
  }

  const membersGet = subpath.match(/^\/groups\/([^/]+)\/members$/);
  if (method === "GET" && membersGet) {
    const result = await employerWorkforceService.listMembers(membersGet[1], req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ members: result.members }, requestId));
    return true;
  }

  if (method === "POST" && membersGet) {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerWorkforceService.addMember(
      membersGet[1],
      req.authenticatedUser,
      body,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 201, envelope({ member: result.member }, requestId));
    return true;
  }

  const memberDelete = subpath.match(/^\/groups\/([^/]+)\/members\/([^/]+)$/);
  if (method === "DELETE" && memberDelete) {
    const result = await employerWorkforceService.removeMember(
      memberDelete[1],
      memberDelete[2],
      req.authenticatedUser,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ member: result.member }, requestId));
    return true;
  }

  sendNotFound(res, requestId, "Employer Workforce");
  return true;
}
