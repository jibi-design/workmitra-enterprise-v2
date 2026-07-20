import type { IncomingMessage } from "node:http";

export interface RequestMeta {
  requestId: string;
  ip: string | null;
  userAgent: string | null;
}

export function extractRequestMeta(req: IncomingMessage, requestId: string): RequestMeta {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : (req.socket.remoteAddress ?? null);
  const userAgent =
    typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null;
  return { requestId, ip, userAgent };
}
