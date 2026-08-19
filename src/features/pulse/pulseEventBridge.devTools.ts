/** Job Mitra | pulseEventBridge.devTools.ts | src/features/pulse/pulseEventBridge.devTools.ts */

import { PULSE_BACKEND_EVENT_TYPES } from "./pulseRegistry";
import type { PulseDevConsoleApi } from "./pulseEventBridge.types";
import { handleIncomingNotification } from "./pulseEventBridge.notifications";
import { queuePulseEventForAffectedUser } from "./pulseEventBridge.queue";
import {
  clearCareerPulseQaData,
  clearShiftPulseQaData,
  createDevPulsePayload,
  seedPulseQaData,
} from "./pulseEventBridge.qa";
import { usePulseStore } from "./pulseStore";

function isLocalPulseQaHost(): boolean {
  if (typeof window === "undefined") return false;

  const { hostname } = window.location;

  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  );
}

function readUrlQueryParam(name: string): string | null {
  if (typeof window === "undefined") return null;

  const fromSearch = new URLSearchParams(window.location.search).get(name);
  if (fromSearch != null) return fromSearch;

  // HashRouter: #/employer?wmPulseDemo=1
  const hash = window.location.hash;
  const queryIndex = hash.indexOf("?");
  if (queryIndex < 0) return null;

  return new URLSearchParams(hash.slice(queryIndex + 1)).get(name);
}

function hasPulseQaOptInFlag(): boolean {
  if (typeof window === "undefined") return false;

  if (readUrlQueryParam("wmPulseDev") === "1") return true;

  try {
    return window.localStorage.getItem("wm_enable_pulse_dev_tools") === "true";
  } catch {
    return false;
  }
}

/** DEV-only sample: ?wmPulseDemo=1|shift|final */
function maybeAutoTriggerPulseDemo(api: PulseDevConsoleApi): number | undefined {
  if (typeof window === "undefined") return undefined;
  if (!import.meta.env.DEV && !isLocalPulseQaHost()) return undefined;

  const flag = readUrlQueryParam("wmPulseDemo");
  if (flag !== "1" && flag !== "shift" && flag !== "final") return undefined;

  // Wait one tick so Employer Home PulseNodes mount before chain activate.
  return window.setTimeout(() => {
    if (flag === "final") {
      // Single-node chain → destination double-blink (“this is it”).
      api.activateNode("home-shift-card", "urgent");
      return;
    }
    api.trigger("SHIFT_APPLICATION_SUBMITTED");
  }, 400);
}

function shouldInstallPulseDevTools(): boolean {
  if (import.meta.env.DEV) return true;

  return isLocalPulseQaHost() && hasPulseQaOptInFlag();
}

function createPulseDevConsoleApi(): PulseDevConsoleApi {
  return {
    events: PULSE_BACKEND_EVENT_TYPES,

    trigger: (type, options) => {
      const seededOptions = seedPulseQaData(type, options);
      const payload = createDevPulsePayload(type, seededOptions);

      if (!payload) return [];

      return handleIncomingNotification(payload);
    },

    queue: (type, options) => {
      const seededOptions = seedPulseQaData(type, options);
      const payload = createDevPulsePayload(type, seededOptions);

      if (!payload) return;

      queuePulseEventForAffectedUser(payload);
    },

    activateNode: (nodeId, severity) => {
      usePulseStore.getState().setChain([nodeId], { severity });
      return [nodeId];
    },

    setChain: (chain, options) => {
      usePulseStore.getState().setChain(chain, options);
      return [...chain];
    },

    clear: () => {
      usePulseStore.getState().clearAllPulses();
    },

    clearDemoData: () => {
      clearShiftPulseQaData();
      clearCareerPulseQaData();
    },

    status: () => {
      const store = usePulseStore.getState();

      return {
        currentNodeId: store.getCurrentNodeId(),
        chain: [...store.chain],
        hasAnyActivePulse: store.hasAnyActivePulse(),
      };
    },
  };
}

/**
 * Console-only QA simulator for local development and local production-preview QA.
 *
 * This keeps manual testing out of business components. It installs automatically
 * in Vite dev mode. For production-preview builds, it only installs on localhost
 * after an explicit QA opt-in flag, so public users never receive fake controls.
 */
export function installPulseDevTools(): () => void {
  if (typeof window === "undefined") return () => undefined;
  if (!shouldInstallPulseDevTools()) return () => undefined;

  const previousDevTools = window.wmPulseDev;
  const api = createPulseDevConsoleApi();

  window.wmPulseDev = api;
  const demoTimerId = maybeAutoTriggerPulseDemo(api);

  return () => {
    if (demoTimerId != null) window.clearTimeout(demoTimerId);

    if (previousDevTools) {
      window.wmPulseDev = previousDevTools;
      return;
    }

    delete window.wmPulseDev;
  };
}
