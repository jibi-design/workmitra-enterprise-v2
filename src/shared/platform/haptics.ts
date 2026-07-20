// src/shared/platform/haptics.ts

// Job Mitra — centralized, settings-gated Capacitor Haptics utility

import { Haptics, ImpactStyle } from "@capacitor/haptics";

import { appSettingsStore } from "../store/appSettingsStore";

const MIN_HAPTIC_INTERVAL_MS = 80;

/** Canonical interactive selectors — all UI haptics route through document delegation. */

const HAPTIC_INTERACTIVE_SELECTOR = [
  ".wm-primarybtn",

  ".wm-iconbtn",

  ".wm-press-btn",

  ".wm-analyticsActionBtn",
].join(", ");

let lastHapticAt = 0;

let delegationBound = false;

export async function triggerLightHaptic(): Promise<void> {
  if (!appSettingsStore.hapticFeedback) {
    return;
  }

  const now = Date.now();

  if (now - lastHapticAt < MIN_HAPTIC_INTERVAL_MS) {
    return;
  }

  lastHapticAt = now;

  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.debug("[Job Mitra] Light haptic feedback is unavailable in this environment.", error);
    }
  }
}

/** Double-tick haptic for planner day selection (Pick & Choose). */

export async function triggerSelectionHaptic(): Promise<void> {
  await triggerLightHaptic();

  window.setTimeout(() => {
    void triggerLightHaptic();
  }, 48);
}

/**
 * Deep resonating double-rumble for cinematic bloom peak.
 */
export async function triggerDeepDoubleRumble(): Promise<void> {
  if (!appSettingsStore.hapticFeedback) {
    return;
  }

  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
    window.setTimeout(() => {
      void Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => undefined);
    }, 90);
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.debug("[Job Mitra] Deep rumble haptic is unavailable in this environment.", error);
    }
  }
}

/**
 * PRODUCTION LOCK — light pulse @ 0.8s, deep rumble @ 2.5s energy sync peak.
 * Returns cleanup for timers.
 */
export function triggerSplashCinematicHaptics(): () => void {
  if (!appSettingsStore.hapticFeedback) {
    return () => undefined;
  }

  const lightPulseTimer = window.setTimeout(() => {
    void triggerLightHaptic();
  }, 800);

  const rumbleTimer = window.setTimeout(() => {
    void triggerDeepDoubleRumble();
  }, 2500);

  return () => {
    window.clearTimeout(lightPulseTimer);
    window.clearTimeout(rumbleTimer);
  };
}

/** Document-level haptics for canonical interactive classes (settings-gated). */

export function initAppHaptics(): void {
  if (delegationBound || typeof document === "undefined") {
    return;
  }

  delegationBound = true;

  document.addEventListener(
    "click",

    (event) => {
      const target = (event.target as Element | null)?.closest?.(HAPTIC_INTERACTIVE_SELECTOR);

      if (!target) return;

      if (target.matches(":disabled, [aria-disabled='true']")) return;

      void triggerLightHaptic();
    },

    { capture: true },
  );
}
