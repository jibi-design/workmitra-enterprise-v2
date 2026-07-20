/** Job Mitra | pulseRegistryTokens.ts | src/features/pulse/pulseRegistryTokens.ts */

import type { PulseSeverity } from "./pulseRegistryTypes";

type PulseVisualToken = {
  readonly severity: PulseSeverity;
  readonly colorBase: string;
  readonly colorGloss: string;
  readonly colorGlow: string;
};

export const PULSE_VISUAL_TOKENS = {
  INFO: {
    severity: "INFO",
    colorBase: "#2563EB",
    colorGloss: "#DBEAFE",
    colorGlow: "rgba(37, 99, 235, 0.6)",
  },
  WARNING: {
    severity: "WARNING",
    colorBase: "#D97706",
    colorGloss: "#FEF3C7",
    colorGlow: "rgba(217, 119, 6, 0.6)",
  },
  CRITICAL: {
    severity: "CRITICAL",
    colorBase: "#DC2626",
    colorGloss: "#FEE2E2",
    colorGlow: "rgba(220, 38, 38, 0.7)",
  },
  SUCCESS: {
    severity: "SUCCESS",
    colorBase: "#16a34a",
    colorGloss: "#DCFCE7",
    colorGlow: "rgba(22, 163, 74, 0.65)",
  },
} as const satisfies Record<PulseSeverity, PulseVisualToken>;
