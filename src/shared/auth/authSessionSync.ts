/**
 * Cross-tab auth session signal (RBAC Wave 2 P1).
 * AUTH on only: when Tab A logs in/out, Tab B re-hydrates so cookie + UI stay aligned.
 * Phase-0 dual-role dual-tab is unchanged (role stays in sessionStorage).
 */

import { AUTH_BACKEND_ENABLED } from "../config/authConfig";

const EPOCH_KEY = "wm_auth_session_epoch_v1";
const CHANNEL_NAME = "wm-auth-session-v1";

export type AuthSessionEpoch = {
  at: number;
  userId: string | null;
  role: string | null;
};

let channel: BroadcastChannel | null = null;

function ensureChannel(): BroadcastChannel | null {
  if (!AUTH_BACKEND_ENABLED) return null;
  if (typeof BroadcastChannel === "undefined") return null;
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    return channel;
  } catch {
    return null;
  }
}

function readEpoch(): AuthSessionEpoch | null {
  try {
    const raw = localStorage.getItem(EPOCH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthSessionEpoch>;
    if (typeof parsed.at !== "number") return null;
    return {
      at: parsed.at,
      userId: typeof parsed.userId === "string" ? parsed.userId : null,
      role: typeof parsed.role === "string" ? parsed.role : null,
    };
  } catch {
    return null;
  }
}

/** Call after setAuth / clearAuth so peer tabs re-check /me. */
export function publishAuthSessionEpoch(userId: string | null, role: string | null): void {
  if (!AUTH_BACKEND_ENABLED) return;

  const prev = readEpoch();
  if (prev && prev.userId === userId && prev.role === role) return;

  const next: AuthSessionEpoch = { at: Date.now(), userId, role };
  try {
    localStorage.setItem(EPOCH_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }

  try {
    ensureChannel()?.postMessage(next);
  } catch {
    /* ignore */
  }
}

/**
 * Subscribe to peer-tab auth changes. Returns unsubscribe.
 * Listener should call hydrateSession() (idempotent).
 * Same-tab publishes are ignored (no CustomEvent; storage/BC are cross-context).
 */
export function subscribeAuthSessionEpoch(
  onPeerChange: (epoch: AuthSessionEpoch) => void,
): () => void {
  if (!AUTH_BACKEND_ENABLED) return () => undefined;

  let lastAt = readEpoch()?.at ?? 0;

  const handle = (epoch: AuthSessionEpoch) => {
    if (epoch.at <= lastAt) return;
    lastAt = epoch.at;
    onPeerChange(epoch);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== EPOCH_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as AuthSessionEpoch;
      if (typeof parsed.at === "number") handle(parsed);
    } catch {
      /* ignore */
    }
  };

  const ch = ensureChannel();
  const onMessage = (event: MessageEvent<AuthSessionEpoch>) => {
    if (event.data && typeof event.data.at === "number") handle(event.data);
  };

  window.addEventListener("storage", onStorage);
  ch?.addEventListener("message", onMessage);

  return () => {
    window.removeEventListener("storage", onStorage);
    ch?.removeEventListener("message", onMessage);
  };
}
