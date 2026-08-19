import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "../../../middleware/index.js";
import { sendJson, sendNotFound, envelope, readJsonBody } from "../../../utils/http.js";
import { parseWithSchema, sendValidationError } from "../../../validation/zodParse.js";
import {
  confirmShiftBodySchema,
  createShiftPostBodySchema,
  directInviteCreateBodySchema,
  shiftConfirmParamsSchema,
  shiftPostIdParamsSchema,
  updateShiftPostBodySchema,
} from "../../../validation/schemas/shift.schemas.js";
import { confirmShiftCandidate } from "./shift.saga.js";
import { employerShiftService } from "./shift.service.js";
import { handleWorkersRadarRoute } from "./shift.radar.routes.js";
import { tryHandleEmployerShiftApplicationList } from "./shift.applications.routes.js";
import { shiftDirectInviteStore } from "./shiftDirectInvite.store.js";
import { idempotencyStore, readIdempotencyKey } from "../../shared/idempotency.store.js";
import { handleEmployerShiftOpsRoutes } from "./shiftOps.routes.js";
import { tryHandleWorkspaceMessageRoutes } from "../../shift/workspaceMessages.routes.js";

const SHIFT_PREFIX = "/v1/jobmitra/employer/shift";

/**
 * Employer Shift route handler.
 * Already behind requireAuth + requireEmployerRole (employer.routes.ts).
 * Layer 4: Zod schema validation + unknown-key strip on bodies/params.
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

  if (await handleEmployerShiftOpsRoutes(req, res, url, method)) return true;
  if (
    await tryHandleWorkspaceMessageRoutes(
      req,
      res,
      url,
      method,
      SHIFT_PREFIX,
      "employer",
    )
  ) {
    return true;
  }
  if (await handleWorkersRadarRoute(req, res, url, method)) return true;
  if (await tryHandleEmployerShiftApplicationList(req, res, url, method)) return true;

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
    const parsed = parseWithSchema(createShiftPostBodySchema, body);
    if (!parsed.ok) {
      return sendValidationError(res, requestId, "Invalid shift post body");
    }

    const result = await employerShiftService.createPost(
      req.authenticatedUser,
      parsed.data as Record<string, unknown>,
    );
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

  // PATCH /v1/jobmitra/employer/shift/posts/:postId
  const updateMatch = subpath.match(/^\/posts\/([^/]+)$/);
  if (method === "PATCH" && updateMatch) {
    const params = parseWithSchema(shiftPostIdParamsSchema, { postId: updateMatch[1] });
    if (!params.ok) {
      return sendValidationError(res, requestId, "postId must be a valid UUID");
    }
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const parsed = parseWithSchema(updateShiftPostBodySchema, body);
    if (!parsed.ok) {
      return sendValidationError(res, requestId, "Invalid shift post update body");
    }
    const result = await employerShiftService.updatePost(
      params.data.postId,
      req.authenticatedUser,
      parsed.data as Record<string, unknown>,
    );
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

  // DELETE /v1/jobmitra/employer/shift/posts/:postId
  const deleteMatch = subpath.match(/^\/posts\/([^/]+)$/);
  if (method === "DELETE" && deleteMatch) {
    const params = parseWithSchema(shiftPostIdParamsSchema, { postId: deleteMatch[1] });
    if (!params.ok) {
      return sendValidationError(res, requestId, "postId must be a valid UUID");
    }
    const result = await employerShiftService.deletePost(params.data.postId, req.authenticatedUser);
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
    const params = parseWithSchema(shiftConfirmParamsSchema, {
      postId: workspaceMatch[1],
      appId: workspaceMatch[2],
    });
    if (!params.ok) {
      return sendValidationError(res, requestId, "postId and appId must be valid UUIDs");
    }
    const result = await employerShiftService.getWorkspaceForApplication(
      params.data.postId,
      params.data.appId,
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

  // POST /v1/jobmitra/employer/shift/posts/:postId/direct-invites
  const inviteCreateMatch = subpath.match(/^\/posts\/([^/]+)\/direct-invites$/);
  if (method === "POST" && inviteCreateMatch) {
    const params = parseWithSchema(shiftPostIdParamsSchema, { postId: inviteCreateMatch[1] });
    if (!params.ok) {
      return sendValidationError(res, requestId, "postId must be a valid UUID");
    }
    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const parsed = parseWithSchema(directInviteCreateBodySchema, body);
    if (!parsed.ok) {
      return sendValidationError(res, requestId, "Invalid direct-invite body");
    }
    const workerWmId = parsed.data.worker_wm_id?.trim() || parsed.data.workerWmId?.trim() || "";
    if (!workerWmId) {
      sendJson(res, 400, {
        error: { code: "VALIDATION_ERROR", message: "worker_wm_id is required", requestId },
      });
      return true;
    }
    const post = await employerShiftService.getOwnedPost(params.data.postId, req.authenticatedUser);
    if (!post.ok) {
      sendJson(res, post.httpStatus, {
        error: { code: post.code, message: post.message, requestId },
      });
      return true;
    }
    const invite = await shiftDirectInviteStore.create({
      postId: params.data.postId,
      employerId: req.authenticatedUser.id,
      workerWmId,
    });
    sendJson(
      res,
      201,
      envelope(
        {
          invite: {
            id: invite.id,
            post_id: invite.postId,
            worker_wm_id: invite.workerWmId,
            token: invite.token,
            status: invite.status,
            expires_at: invite.expiresAt,
          },
        },
        requestId,
      ),
    );
    return true;
  }

  // POST /v1/jobmitra/employer/shift/posts/:postId/applications/:appId/confirm
  const confirmMatch = subpath.match(/^\/posts\/([^/]+)\/applications\/([^/]+)\/confirm$/);
  if (method === "POST" && confirmMatch) {
    const params = parseWithSchema(shiftConfirmParamsSchema, {
      postId: confirmMatch[1],
      appId: confirmMatch[2],
    });
    if (!params.ok) {
      return sendValidationError(res, requestId, "postId and appId must be valid UUIDs");
    }

    const body = await readJsonBody(req);
    if (body === null) {
      sendJson(res, 413, {
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body too large", requestId },
      });
      return true;
    }
    const parsed = parseWithSchema(confirmShiftBodySchema, body);
    if (!parsed.ok) {
      return sendValidationError(res, requestId, "Invalid confirm body");
    }

    const idemKey = readIdempotencyKey(
      req.headers as Record<string, string | string[] | undefined>,
    );
    if (idemKey) {
      const cached = await idempotencyStore.get(req.authenticatedUser.id, idemKey);
      if (cached) {
        sendJson(res, cached.httpStatus, cached.body);
        return true;
      }
    }

    const workerWmIdHint =
      parsed.data.worker_wm_id?.trim() || parsed.data.workerWmId?.trim() || undefined;

    const result = await confirmShiftCandidate(
      params.data.postId,
      params.data.appId,
      req.authenticatedUser,
      workerWmIdHint,
    );

    if (!result.ok) {
      const errBody = { error: { code: result.code, message: result.message, requestId } };
      sendJson(res, result.httpStatus, errBody);
      return true;
    }

    const okBody = envelope({ workspace: result.workspace, events: result.events }, requestId);
    if (idemKey) {
      await idempotencyStore.put(req.authenticatedUser.id, idemKey, 200, okBody);
    }
    sendJson(res, 200, okBody);
    return true;
  }

  sendNotFound(res, requestId, "Employer shift");
  return true;
}
