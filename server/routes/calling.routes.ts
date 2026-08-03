/**
 * Job Mitra | Phase 3 Calling — HTTP routes
 * Path: server/routes/calling.routes.ts
 *
 * Canonical:  /v1/jobmitra/call/*
 * Plan alias: /api/call/*
 */

import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { requireAuth } from "../middleware/index.js";
import {
  handleAnswer,
  handleEnd,
  handleFallback,
  handleInitiate,
  handleRegisterDevice,
  handleStatus,
} from "./calling.handlers.js";
import { sendNotFound } from "../utils/http.js";

const CANONICAL_PREFIX = "/v1/jobmitra/call";
const ALIAS_PREFIX = "/api/call";

function resolveSubpath(pathname: string): string | null {
  if (pathname.startsWith(CANONICAL_PREFIX)) {
    return pathname.slice(CANONICAL_PREFIX.length) || "/";
  }
  if (pathname.startsWith(ALIAS_PREFIX)) {
    return pathname.slice(ALIAS_PREFIX.length) || "/";
  }
  return null;
}

/**
 * Calling domain router. Returns true when pathname is under call prefixes.
 */
export async function handleCallingRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  const subpath = resolveSubpath(url.pathname);
  if (subpath === null) return false;

  const requestId = randomUUID();

  await requireAuth(
    req,
    res,
    requestId,
    async (authedReq) => {
      if (method === "GET" && (subpath === "/status" || subpath === "/")) {
        await handleStatus(authedReq, res);
        return;
      }
      if (method === "POST" && subpath === "/initiate") {
        await handleInitiate(authedReq, res);
        return;
      }
      if (method === "POST" && subpath === "/register-device") {
        await handleRegisterDevice(authedReq, res);
        return;
      }
      if (method === "POST" && subpath === "/answer") {
        await handleAnswer(authedReq, res);
        return;
      }
      if (method === "POST" && subpath === "/end") {
        await handleEnd(authedReq, res);
        return;
      }
      if (method === "POST" && subpath === "/fallback") {
        await handleFallback(authedReq, res);
        return;
      }
      sendNotFound(res, requestId, "Calling");
    },
    url,
  );

  return true;
}
