/** Phase 4 — IntentPacket for soft-auth resume (session-scoped). */

export type IntentAction =
  | "apply_shift"
  | "apply_career"
  | "apply_planner"
  | "save_shift"
  | "save_career"
  | "create_draft"
  | "create_shift"
  | "create_career"
  | "create_planner";

export type IntentPacket = {
  readonly action: IntentAction;
  readonly targetId: string;
  readonly returnPath: string;
  readonly roleHint: "employee" | "employer";
  readonly payload?: Record<string, unknown>;
  readonly createdAt: number;
};

const INTENT_KEY = "wm_guest_intent_packet_v1";
const TTL_MS = 24 * 60 * 60 * 1000;

export function stashIntentPacket(packet: Omit<IntentPacket, "createdAt">): IntentPacket {
  const full: IntentPacket = { ...packet, createdAt: Date.now() };
  try {
    sessionStorage.setItem(INTENT_KEY, JSON.stringify(full));
  } catch {
    /* ignore */
  }
  return full;
}

export function peekIntentPacket(): IntentPacket | null {
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IntentPacket;
    if (!parsed?.action || !parsed.returnPath) return null;
    if (Date.now() - (parsed.createdAt ?? 0) > TTL_MS) {
      sessionStorage.removeItem(INTENT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function consumeIntentPacket(): IntentPacket | null {
  const packet = peekIntentPacket();
  try {
    sessionStorage.removeItem(INTENT_KEY);
  } catch {
    /* ignore */
  }
  return packet;
}

export function clearIntentPacket(): void {
  try {
    sessionStorage.removeItem(INTENT_KEY);
  } catch {
    /* ignore */
  }
}
