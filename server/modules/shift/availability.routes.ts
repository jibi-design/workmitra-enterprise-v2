/** Availability routes — employee mine + employer public pool (PII-scrubbed). */

import type { IncomingMessage, ServerResponse } from "node:http";
import { scrubPiiFromPublicPayload } from "../../contracts/piiPublicScrub.js";
import { AVAILABILITY_PATHS } from "../../contracts/shiftAvailabilityFavorites.contracts.js";
import type { AuthenticatedRequest } from "../../middleware/types.js";
import type { AuthUser } from "../auth/types.js";
import { availabilityService } from "./availability.service.js";

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (chunks.length === 0) return {};
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function sessionUser(req: IncomingMessage): AuthUser | null {
  const authed = req as Partial<AuthenticatedRequest>;
  return authed.authenticatedUser ?? null;
}

export async function handleAvailabilityRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (url.pathname === AVAILABILITY_PATHS.mine && method === "GET") {
    const dto = await availabilityService.getMine(
      sessionUser(req),
      url.searchParams.get("workerMlId") ?? undefined,
    );
    sendJson(res, 200, scrubPiiFromPublicPayload(dto));
    return true;
  }

  if (url.pathname === AVAILABILITY_PATHS.mine && method === "PUT") {
    const saved = await availabilityService.upsert(sessionUser(req), await readBody(req));
    sendJson(res, 200, scrubPiiFromPublicPayload(saved));
    return true;
  }

  if (url.pathname === AVAILABILITY_PATHS.publicPool && method === "GET") {
    const pool = await availabilityService.publicPool();
    sendJson(res, 200, scrubPiiFromPublicPayload(pool));
    return true;
  }

  return false;
}
