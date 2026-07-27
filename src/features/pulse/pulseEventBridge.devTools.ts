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

function hasPulseQaOptInFlag(): boolean {
  if (typeof window === "undefined") return false;

  const searchParams = new URLSearchParams(window.location.search);

  if (searchParams.get("wmPulseDev") === "1") return true;

  try {
    return window.localStorage.getItem("wm_enable_pulse_dev_tools") === "true";
  } catch {
    return false;
  }
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

  window.wmPulseDev = createPulseDevConsoleApi();

  return () => {
    if (previousDevTools) {
      window.wmPulseDev = previousDevTools;
      return;
    }

    delete window.wmPulseDev;
  };
}
