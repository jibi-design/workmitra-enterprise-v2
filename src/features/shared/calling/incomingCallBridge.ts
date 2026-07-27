/**
 * Job Mitra | Phase 3 Calling — native FCM → WebView bridge
 * Path: src/features/shared/calling/incomingCallBridge.ts
 *
 * Android MainActivity dispatches `wm-incoming-call` CustomEvent + window.__wmIncomingCall.
 */

export type IncomingCallPayload = {
  type: "incoming_call";
  callSessionId?: string;
  channelId?: string;
  workspaceId?: string;
  initiatorMl?: string;
  receiverMl?: string;
};

const STORAGE_KEY = "wm_incoming_call_pending_v1";
export const INCOMING_CALL_EVENT = "wm-incoming-call";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseIncomingCallPayload(value: unknown): IncomingCallPayload | null {
  if (typeof value === "string") {
    try {
      return parseIncomingCallPayload(JSON.parse(value) as unknown);
    } catch {
      return null;
    }
  }
  if (!isRecord(value)) return null;
  const type = typeof value.type === "string" ? value.type.trim() : "";
  if (type && type.toLowerCase() !== "incoming_call") return null;

  const callSessionId = typeof value.callSessionId === "string" ? value.callSessionId.trim() : "";
  if (!callSessionId) return null;

  return {
    type: "incoming_call",
    callSessionId,
    channelId: typeof value.channelId === "string" ? value.channelId.trim() : undefined,
    workspaceId: typeof value.workspaceId === "string" ? value.workspaceId.trim() : undefined,
    initiatorMl: typeof value.initiatorMl === "string" ? value.initiatorMl.trim() : undefined,
    receiverMl: typeof value.receiverMl === "string" ? value.receiverMl.trim() : undefined,
  };
}

export function stashIncomingCall(payload: IncomingCallPayload): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function consumeIncomingCall(): IncomingCallPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return parseIncomingCallPayload(raw);
  } catch {
    return null;
  }
}

export function peekIncomingCallFromWindow(): IncomingCallPayload | null {
  const w = window as Window & { __wmIncomingCall?: unknown };
  const parsed = parseIncomingCallPayload(w.__wmIncomingCall);
  if (parsed) delete w.__wmIncomingCall;
  return parsed;
}

/**
 * Subscribe to native/WebView incoming-call events. Returns unsubscribe.
 */
export function subscribeIncomingCallFromNative(
  onCall: (payload: IncomingCallPayload) => void,
): () => void {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<unknown>).detail;
    const parsed = parseIncomingCallPayload(detail);
    if (!parsed) return;
    stashIncomingCall(parsed);
    onCall(parsed);
  };

  window.addEventListener(INCOMING_CALL_EVENT, handler);

  // Cold start: payload may already be on window before listeners attach
  const existing = peekIncomingCallFromWindow();
  if (existing) {
    stashIncomingCall(existing);
    onCall(existing);
  }

  return () => window.removeEventListener(INCOMING_CALL_EVENT, handler);
}

/** Install once at app boot — stashes payload for answer UI. */
export function installIncomingCallNativeBridge(): () => void {
  return subscribeIncomingCallFromNative((payload) => {
    stashIncomingCall(payload);
  });
}
