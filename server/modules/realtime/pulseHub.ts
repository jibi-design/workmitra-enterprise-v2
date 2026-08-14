import type { WebSocket } from "ws";

const socketsByUser = new Map<string, Set<WebSocket>>();

export function registerPulseSocket(userId: string, socket: WebSocket): void {
  const key = userId.trim();
  if (!key) return;
  let set = socketsByUser.get(key);
  if (!set) {
    set = new Set();
    socketsByUser.set(key, set);
  }
  set.add(socket);
}

export function unregisterPulseSocket(userId: string, socket: WebSocket): void {
  const key = userId.trim();
  const set = socketsByUser.get(key);
  if (!set) return;
  set.delete(socket);
  if (set.size === 0) socketsByUser.delete(key);
}

export function emitPulseToUser(userId: string, payload: Record<string, unknown>): void {
  const set = socketsByUser.get(userId.trim());
  if (!set || set.size === 0) return;
  const raw = JSON.stringify(payload);
  for (const socket of set) {
    if (socket.readyState === 1) {
      socket.send(raw);
    }
  }
}

export function pulseSocketCount(userId: string): number {
  return socketsByUser.get(userId.trim())?.size ?? 0;
}
