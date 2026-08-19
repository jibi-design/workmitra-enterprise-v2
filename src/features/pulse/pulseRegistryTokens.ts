/** Job Mitra | pulseRegistryTokens.ts | src/features/pulse/pulseRegistryTokens.ts */

import type { PulseSeverity } from "./pulseRegistryTypes";

type PulseVisualToken = {
  readonly severity: PulseSeverity;
  readonly colorBase: string;
  readonly colorGloss: string;
  readonly colorGlow: string;
  /** Breathing Light Pro period — synced with pulseBreathTokens profiles. */
  readonly duration: `${number}s`;
};

/**
 * Severity visual tokens (Phase 2 tempo lock):
 * INFO/guide 4s · WARNING/processing 2.5s · CRITICAL/urgent 1s · SUCCESS/arrival 2.5s
 */
export const PULSE_VISUAL_TOKENS = {
  INFO: {
    severity: "INFO",
    colorBase: "#22d3ee",
    colorGloss: "#cffafe",
    colorGlow: "rgba(34, 211, 238, 0.55)",
    duration: "4s",
  },
  WARNING: {
    severity: "WARNING",
    colorBase: "#fbbf24",
    colorGloss: "#FEF3C7",
    colorGlow: "rgba(251, 191, 36, 0.6)",
    duration: "2.5s",
  },
  CRITICAL: {
    severity: "CRITICAL",
    colorBase: "#f87171",
    colorGloss: "#FEE2E2",
    colorGlow: "rgba(248, 113, 113, 0.7)",
    duration: "1s",
  },
  SUCCESS: {
    severity: "SUCCESS",
    colorBase: "#16a34a",
    colorGloss: "#DCFCE7",
    colorGlow: "rgba(22, 163, 74, 0.65)",
    duration: "2.5s",
  },
} as const satisfies Record<PulseSeverity, PulseVisualToken>;
