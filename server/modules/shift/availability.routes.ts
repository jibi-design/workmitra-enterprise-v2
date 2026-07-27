/** Mock availability routes — employee mine + employer public pool (PII-scrubbed) */

import type { IncomingMessage, ServerResponse } from "node:http";
import { scrubPiiFromPublicPayload } from "../../contracts/piiPublicScrub.js";
import { AVAILABILITY_PATHS } from "../../contracts/shiftAvailabilityFavorites.contracts.js";

type StoreRow = {
  workerMlId: string;
  selectedDates: string[];
  city?: string;
  updatedAt: number;
  phone?: string;
};

const store = new Map<string, StoreRow>();

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

export async function handleAvailabilityRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  method: string,
): Promise<boolean> {
  if (url.pathname === AVAILABILITY_PATHS.mine && method === "GET") {
    const workerMlId = String(url.searchParams.get("workerMlId") ?? "demo-worker");
    const row = store.get(workerMlId) ?? {
      workerMlId,
      selectedDates: [],
      updatedAt: Date.now(),
    };
    sendJson(res, 200, scrubPiiFromPublicPayload(row));
    return true;
  }

  if (url.pathname === AVAILABILITY_PATHS.mine && method === "PUT") {
    const body = (await readBody(req)) as {
      workerMlId?: string;
      selectedDates?: string[];
      city?: string;
      phone?: string;
    };
    const workerMlId = body.workerMlId ?? "demo-worker";
    store.set(workerMlId, {
      workerMlId,
      selectedDates: Array.isArray(body.selectedDates) ? body.selectedDates : [],
      city: body.city,
      updatedAt: Date.now(),
      phone: body.phone,
    });
    const saved = store.get(workerMlId)!;
    sendJson(res, 200, scrubPiiFromPublicPayload({ ...saved, phone: undefined }));
    return true;
  }

  if (url.pathname === AVAILABILITY_PATHS.publicPool && method === "GET") {
    const items = [...store.values()].map((row) => ({
      workerMlId: row.workerMlId,
      freeDayCount: row.selectedDates.length,
      cityHash: row.city ? `h_${row.city.length}` : undefined,
    }));
    sendJson(res, 200, scrubPiiFromPublicPayload({ items, generatedAt: Date.now() }));
    return true;
  }

  return false;
}
