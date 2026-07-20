/** Job Mitra | pulseStorage.ts | src/features/pulse/pulseStorage.ts */

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

/**
 * Pulse state is intentionally cleared on app refresh.
 * This avoids stale breathing lights after reload/navigation recovery.
 */
export function hydratePulseState(): HydratedPulseState {
  safeRemovePulseStorage();

  return EMPTY_HYDRATED_PULSE_STATE;
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
