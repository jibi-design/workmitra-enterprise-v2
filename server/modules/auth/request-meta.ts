import type { IncomingMessage } from "node:http";
import { resolveClientIp } from "../../middleware/clientIp.js";

export interface RequestMeta {
  requestId: string;
  ip: string | null;
  userAgent: string | null;
}

export function extractRequestMeta(req: IncomingMessage, requestId: string): RequestMeta {
  const ip = resolveClientIp(req);
  const userAgent =
    typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null;
  return { requestId, ip: ip === "unknown" ? null : ip, userAgent };
}
