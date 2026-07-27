/** Job Mitra | pulseStorage.ts | Urgent-safe hydrate + re-trigger (P2-7) */

import type {
  ActivePulseTrails,
  ActivePulses,
  HydratedPulseState,
  PulseChainSeverity,
  PulseNodeId,
  PulseState,
} from "./pulseTypes";

type PersistedPulseState = {
  readonly version: 1;
  readonly chain: PulseNodeId[];
  readonly severityByNodeId: Record<PulseNodeId, PulseChainSeverity>;
  readonly activePulses: ActivePulses;
  readonly activeTrails: ActivePulseTrails;
};

const PULSE_STORAGE_KEY = "wm_pulse_chain_state_v1";

export const EMPTY_HYDRATED_PULSE_STATE: HydratedPulseState = {
  chain: [],
  resolvingNodeId: null,
  severityByNodeId: {},
  activePulses: {},
  activeTrails: {},
};

function safeSetStorageItem(key: string, value: string): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    // Pulse persistence is best-effort only.
  }
}

export function safeRemovePulseStorage(): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(PULSE_STORAGE_KEY);
  } catch {
    // Pulse cleanup is best-effort only.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Keep urgent chain nodes across refresh; drop stale non-urgent breathing lights.
 * Re-triggers activePulses so urgent LEDs resume after reload.
 */
export function hydratePulseState(): HydratedPulseState {
  try {
    if (typeof window === "undefined") return EMPTY_HYDRATED_PULSE_STATE;

    const raw = window.localStorage.getItem(PULSE_STORAGE_KEY);
    if (!raw) return EMPTY_HYDRATED_PULSE_STATE;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.chain)) {
      safeRemovePulseStorage();
      return EMPTY_HYDRATED_PULSE_STATE;
    }

    const severityRaw = isRecord(parsed.severityByNodeId) ? parsed.severityByNodeId : {};
    const urgentChain: PulseNodeId[] = [];
    const severityByNodeId: Record<PulseNodeId, PulseChainSeverity> = {};

    for (const item of parsed.chain) {
      if (typeof item !== "string" || item.trim().length === 0) continue;
      const id = item.trim();
      if (severityRaw[id] !== "urgent") continue;
      if (urgentChain.includes(id)) continue;
      urgentChain.push(id);
      severityByNodeId[id] = "urgent";
    }

    if (urgentChain.length === 0) {
      safeRemovePulseStorage();
      return EMPTY_HYDRATED_PULSE_STATE;
    }

    const restored = retriggerUrgentPulses({
      chain: urgentChain,
      resolvingNodeId: null,
      severityByNodeId,
      activePulses: isRecord(parsed.activePulses) ? (parsed.activePulses as ActivePulses) : {},
      activeTrails: isRecord(parsed.activeTrails) ? (parsed.activeTrails as ActivePulseTrails) : {},
    });

    persistPulseState(restored);
    return restored;
  } catch {
    safeRemovePulseStorage();
    return EMPTY_HYDRATED_PULSE_STATE;
  }
}

/** Force breathing lights back on for every urgent chain node. */
export function retriggerUrgentPulses(state: HydratedPulseState): HydratedPulseState {
  const activePulses: ActivePulses = { ...state.activePulses };
  const severityByNodeId: Record<PulseNodeId, PulseChainSeverity> = {
    ...state.severityByNodeId,
  };

  for (const nodeId of state.chain) {
    if (severityByNodeId[nodeId] !== "urgent") continue;
    activePulses[nodeId] = true;
    severityByNodeId[nodeId] = "urgent";
  }

  return {
    ...state,
    severityByNodeId,
    activePulses,
    resolvingNodeId: null,
  };
}

export function persistPulseState(
  state: Pick<PulseState, "chain" | "severityByNodeId" | "activePulses" | "activeTrails">,
): void {
  const persisted: PersistedPulseState = {
    version: 1,
    chain: state.chain,
    severityByNodeId: state.severityByNodeId,
    activePulses: state.activePulses,
    activeTrails: state.activeTrails,
  };

  safeSetStorageItem(PULSE_STORAGE_KEY, JSON.stringify(persisted));
}
