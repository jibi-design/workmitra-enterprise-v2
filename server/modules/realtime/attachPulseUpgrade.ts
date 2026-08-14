import type { IncomingMessage, Server } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, type WebSocket } from "ws";
import { parseCookies } from "../../middleware/csrf.js";
import { hashSessionToken } from "../auth/crypto.js";
import { authRepository } from "../auth/auth.repository.js";
import { registerPulseSocket, unregisterPulseSocket } from "./pulseHub.js";

const PULSE_PATH = "/v1/jobmitra/realtime/pulse";
const SESSION_COOKIE = "wm_session";

const wss = new WebSocketServer({ noServer: true });

async function resolveUserIdFromUpgrade(req: IncomingMessage): Promise<string | null> {
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[SESSION_COOKIE]?.trim();
  if (!raw) return null;
  const session = await authRepository.findSessionByTokenHash(hashSessionToken(raw));
  if (!session || session.revoked_at) return null;
  const now = Date.now();
  if (new Date(session.expires_at).getTime() <= now) return null;
  if (new Date(session.idle_expires_at).getTime() <= now) return null;
  return session.user_id;
}

function bindSocket(userId: string, socket: WebSocket): void {
  registerPulseSocket(userId, socket);
  socket.on("close", () => unregisterPulseSocket(userId, socket));
  socket.on("error", () => unregisterPulseSocket(userId, socket));
  socket.on("pong", () => undefined);
  const ping = setInterval(() => {
    if (socket.readyState === 1) socket.ping();
    else clearInterval(ping);
  }, 25_000);
  socket.on("close", () => clearInterval(ping));
}

export function attachPulseWebSocket(server: Server): void {
  server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const host = req.headers.host ?? "localhost";
    const url = new URL(req.url ?? "/", `http://${host}`);
    if (url.pathname !== PULSE_PATH) {
      socket.destroy();
      return;
    }
    void resolveUserIdFromUpgrade(req)
      .then((userId) => {
        if (!userId) {
          socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
          socket.destroy();
          return;
        }
        wss.handleUpgrade(req, socket, head, (ws) => {
          bindSocket(userId, ws);
          ws.send(JSON.stringify({ type: "connected", ts: Date.now() }));
        });
      })
      .catch(() => {
        socket.destroy();
      });
  });
}
