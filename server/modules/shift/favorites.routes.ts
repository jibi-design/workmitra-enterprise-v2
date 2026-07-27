/** Mock favorites routes — employer trusted workers (no private ratings in public DTO) */

import type { IncomingMessage, ServerResponse } from "node:http";
import { scrubPiiFromPublicPayload } from "../../contracts/piiPublicScrub.js";
import { FAVORITES_PATHS } from "../../contracts/shiftAvailabilityFavorites.contracts.js";

type FavRow = {
  id: string;
  workerMlId: string;
  displayName: string;
  notes?: string;
  addedVia: "hire_again_rating" | "manual";
  createdAt: number;
  privateRating?: number;
  phone?: string;
};

const favorites = new Map<string, FavRow>();

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

function toPublic(row: FavRow) {
  return scrubPiiFromPublicPayload({
    id: row.id,
    workerMlId: row.workerMlId,
    displayName: row.displayName,
    notes: row.notes,
    addedVia: row.addedVia,
    createdAt: row.createdAt,
  });
}

export async function handleFavoritesRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (url.pathname === FAVORITES_PATHS.list && method === "GET") {
    sendJson(res, 200, { items: [...favorites.values()].map(toPublic) });
    return true;
  }

  if (url.pathname === FAVORITES_PATHS.list && method === "POST") {
    const body = (await readBody(req)) as {
      workerMlId?: string;
      notes?: string;
      displayName?: string;
      phone?: string;
      privateRating?: number;
    };
    const workerMlId = (body.workerMlId ?? "").trim().toUpperCase();
    if (!workerMlId) {
      sendJson(res, 400, { error: "workerMlId_required" });
      return true;
    }
    const row: FavRow = {
      id: `fav_${workerMlId}`,
      workerMlId,
      displayName: body.displayName ?? workerMlId,
      notes: body.notes,
      addedVia: "manual",
      createdAt: Date.now(),
      phone: body.phone,
      privateRating: body.privateRating,
    };
    favorites.set(workerMlId, row);
    sendJson(res, 201, toPublic(row));
    return true;
  }

  const itemMatch = url.pathname.match(/^\/v1\/jobmitra\/employer\/shift\/favorites\/([^/]+)$/);
  if (itemMatch && method === "DELETE") {
    const workerMlId = decodeURIComponent(itemMatch[1] ?? "").toUpperCase();
    favorites.delete(workerMlId);
    sendJson(res, 204, {});
    return true;
  }

  return false;
}
