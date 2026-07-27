import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, sendNotFound, envelope, readJsonBody } from "../../../utils/http.js";
import { confirmShiftCandidate } from "./shift.saga.js";
import { employerShiftService } from "./shift.service.js";

const SHIFT_PREFIX = "/v1/jobmitra/employer/shift";

/**
 * Employer Shift route handler.
 * Already behind requireAuth + requireEmployerRole (employer.routes.ts).
 * Never trusts body role/id — uses authenticatedUser only.
 */
export async function handleEmployerShiftRoutes(
  req: AuthenticatedRequest,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const pathname = url.pathname;
  if (!pathname.startsWith(SHIFT_PREFIX)) return false;

  const { requestId } = req;
  const subpath = pathname.slice(SHIFT_PREFIX.length) || "/";

  // GET /v1/jobmitra/employer/shift/posts
  if (method === "GET" && subpath === "/posts") {
    const result = await employerShiftService.listMyPosts(req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ posts: result.posts }, requestId));
    return true;
  }

  // POST /v1/jobmitra/employer/shift/posts
  if (method === "POST" && subpath === "/posts") {
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }

    const result = await employerShiftService.createPost(req.authenticatedUser, body);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 201, envelope({ post: result.post }, requestId));
    return true;
  }

  // PATCH /v1/jobmitra/employer/shift/posts/:postId
  const updateMatch = subpath.match(/^\/posts\/([^/]+)$/);
  if (method === "PATCH" && updateMatch) {
    const postId = updateMatch[1];
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const result = await employerShiftService.updatePost(postId, req.authenticatedUser, body);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ post: result.post }, requestId));
    return true;
  }

  // DELETE /v1/jobmitra/employer/shift/posts/:postId
  const deleteMatch = subpath.match(/^\/posts\/([^/]+)$/);
  if (method === "DELETE" && deleteMatch) {
    const postId = deleteMatch[1];
    const result = await employerShiftService.deletePost(postId, req.authenticatedUser);
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(
      res,
      200,
      envelope({ deleted: result.mode === "deleted", mode: result.mode }, requestId),
    );
    return true;
  }

  // GET /v1/jobmitra/employer/shift/posts/:postId/applications/:appId/workspace
  const workspaceMatch = subpath.match(/^\/posts\/([^/]+)\/applications\/([^/]+)\/workspace$/);
  if (method === "GET" && workspaceMatch) {
    const postId = workspaceMatch[1];
    const appId = workspaceMatch[2];
    const result = await employerShiftService.getWorkspaceForApplication(
      postId,
      appId,
      req.authenticatedUser,
    );
    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }
    sendJson(res, 200, envelope({ workspace: result.workspace }, requestId));
    return true;
  }

  // POST /v1/jobmitra/employer/shift/posts/:postId/applications/:appId/confirm
  const confirmMatch = subpath.match(/^\/posts\/([^/]+)\/applications\/([^/]+)\/confirm$/);
  if (method === "POST" && confirmMatch) {
    const postId = confirmMatch[1];
    const appId = confirmMatch[2];

    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }

    const workerWmIdHint =
      typeof body.worker_wm_id === "string" ? body.worker_wm_id.trim() : undefined;

    const result = await confirmShiftCandidate(
      postId,
      appId,
      req.authenticatedUser,
      workerWmIdHint,
    );

    if (!result.ok) {
      sendJson(res, result.httpStatus, {
        error: { code: result.code, message: result.message, requestId },
      });
      return true;
    }

    sendJson(res, 200, envelope({ workspace: result.workspace, events: result.events }, requestId));
    return true;
  }

  sendNotFound(res, requestId, "Employer shift");
  return true;
}
