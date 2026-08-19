/** Job Mitra | pulseStorage.ts | Role-scoped hydrate + current-hop re-trigger */

import {
  PULSE_STORAGE_LEGACY_KEY,
  readPulseStorageKey,
} from "./pulseStorage.scope";
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
  readonly pendingGuidanceRoots: PulseNodeId[];
  readonly severityByNodeId: Record<PulseNodeId, PulseChainSeverity>;
  readonly activePulses: ActivePulses;
  readonly activeTrails: ActivePulseTrails;
};

export const EMPTY_HYDRATED_PULSE_STATE: HydratedPulseState = {
  chain: [],
  pendingGuidanceRoots: [],
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
    window.localStorage.removeItem(readPulseStorageKey());
  } catch {
    // Pulse cleanup is best-effort only.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeNodeIdList(value: unknown): PulseNodeId[] {
  if (!Array.isArray(value)) return [];
  const output: PulseNodeId[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.trim().length === 0) continue;
    const id = item.trim();
    if (output.includes(id)) continue;
    output.push(id);
  }
  return output;
}

function readRawPulseBlob(): string | null {
  if (typeof window === "undefined") return null;
  const scoped = window.localStorage.getItem(readPulseStorageKey());
  if (scoped) return scoped;
  const legacy = window.localStorage.getItem(PULSE_STORAGE_LEGACY_KEY);
  if (!legacy) return null;
  try {
    window.localStorage.setItem(readPulseStorageKey(), legacy);
    window.localStorage.removeItem(PULSE_STORAGE_LEGACY_KEY);
  } catch {
    // Keep reading the in-memory legacy blob even if migrate fails.
  }
  return legacy;
}

/**
 * Restore urgent current hop only. Home reminder roots must not re-light every card.
 */
export function hydratePulseState(): HydratedPulseState {
  try {
    if (typeof window === "undefined") return EMPTY_HYDRATED_PULSE_STATE;

    const raw = readRawPulseBlob();
    if (!raw) return EMPTY_HYDRATED_PULSE_STATE;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.chain)) {
      window.localStorage.removeItem(readPulseStorageKey());
      return EMPTY_HYDRATED_PULSE_STATE;
    }

    const severityRaw = isRecord(parsed.severityByNodeId) ? parsed.severityByNodeId : {};
    const urgentChain = normalizeNodeIdList(parsed.chain);
    const pendingGuidanceRoots = normalizeNodeIdList(parsed.pendingGuidanceRoots);
    const severityByNodeId: Record<PulseNodeId, PulseChainSeverity> = {};

    for (const id of urgentChain) {
      const severity = severityRaw[id];
      if (
        severity === "urgent" ||
        severity === "warning" ||
        severity === "info" ||
        severity === "success"
      ) {
        severityByNodeId[id] = severity;
      }
    }

    if (urgentChain.length === 0) {
      window.localStorage.removeItem(readPulseStorageKey());
      return EMPTY_HYDRATED_PULSE_STATE;
    }

    const restored = retriggerUrgentPulses({
      chain: urgentChain,
      pendingGuidanceRoots,
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

/** Force breathing light back on for the current hop only. */
export function retriggerUrgentPulses(state: HydratedPulseState): HydratedPulseState {
  const head = state.chain[0];
  const activePulses: ActivePulses = { ...state.activePulses };
  const severityByNodeId: Record<PulseNodeId, PulseChainSeverity> = {
    ...state.severityByNodeId,
  };

  for (const nodeId of Object.keys(activePulses)) {
    activePulses[nodeId] = false;
  }

  if (head) {
    activePulses[head] = true;
    if (!severityByNodeId[head]) severityByNodeId[head] = "info";
  }

  return {
    ...state,
    pendingGuidanceRoots: [],
    severityByNodeId,
    activePulses,
    resolvingNodeId: null,
  };
}

export function persistPulseState(
  state: Pick<
    PulseState,
    "chain" | "pendingGuidanceRoots" | "severityByNodeId" | "activePulses" | "activeTrails"
  >,
): void {
  const persisted: PersistedPulseState = {
    version: 1,
    chain: state.chain,
    pendingGuidanceRoots: [],
    severityByNodeId: state.severityByNodeId,
    activePulses: state.activePulses,
    activeTrails: state.activeTrails,
  };

  safeSetStorageItem(readPulseStorageKey(), JSON.stringify(persisted));
}
