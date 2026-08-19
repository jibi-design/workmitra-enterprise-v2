/**
 * Breathing Light Pro — Phase 1 perceptual tokens.
 * Raised-cosine + gamma (~2.2) encoded in CSS; these vars drive period / amp / hue.
 * No JS animation loops — compositor only (opacity + micro-scale on LED core).
 */

import type { CSSProperties } from "react";
import type { PulseChainSeverity } from "./pulseTypes";
import type { PulseVisualMode } from "./pulseEdgeTones";

/** Inverse gamma 1/2.2 for CSS pow() / baked keyframe weights. */
export const PULSE_BREATH_GAMMA = 2.2;
export const PULSE_BREATH_GAMMA_INV = Number((1 / PULSE_BREATH_GAMMA).toFixed(4)); // 0.4545

export type PulseBreathProfile = {
  readonly periodMs: number;
  /** Hue degrees for --wm-pulse-hue (domain/severity chroma hint). */
  readonly hueDeg: number;
  /** Overall amplitude scale 0–1 (multiplies envelope). */
  readonly amp: number;
  readonly ampMin: number;
  readonly ampMax: number;
  readonly scaleMin: number;
  readonly scaleMax: number;
};

/**
 * Raised cosine L(t)=0.5-0.5*cos(2πt), then gamma lift:
 * I = ampMin + (ampMax-ampMin) * L^(1/γ)
 * Used to document baked CSS keyframe weights (Phase 1).
 */
export function breathIntensityAt(
  t: number,
  ampMin = 0.35,
  ampMax = 1,
  gamma = PULSE_BREATH_GAMMA,
): number {
  const tt = ((t % 1) + 1) % 1;
  const linear = 0.5 - 0.5 * Math.cos(2 * Math.PI * tt);
  const shaped = Math.pow(linear, 1 / gamma);
  return ampMin + (ampMax - ampMin) * shaped;
}

/** Precomputed γ-weights at quarter steps for CSS calc() mix factors. */
export const BREATH_WAVE_WEIGHTS = {
  /** t=0.125, L≈0.1464 → L^γ⁻¹ */
  t125: Number(Math.pow(0.5 - 0.5 * Math.cos(2 * Math.PI * 0.125), PULSE_BREATH_GAMMA_INV).toFixed(4)),
  /** t=0.25, L=0.5 */
  t25: Number(Math.pow(0.5, PULSE_BREATH_GAMMA_INV).toFixed(4)),
  /** t=0.375, L≈0.8536 */
  t375: Number(Math.pow(0.5 - 0.5 * Math.cos(2 * Math.PI * 0.375), PULSE_BREATH_GAMMA_INV).toFixed(4)),
} as const;

const GUIDE_PERIOD_MS = 4000; // idle/guide band 3.5–4.5s → mid
const WARNING_PERIOD_MS = 2500;
const URGENT_PERIOD_MS = 1000;
const ARRIVAL_PERIOD_MS = 2500;
/** Final destination “this is it” double-blink + hold loop. */
const DESTINATION_PERIOD_MS = 1800;

/** Phase 3 arrival envelope checkpoints (fraction of period) — docs + tests. */
export const ARRIVAL_ENVELOPE = {
  attackEnd: 0.16,
  holdEnd: 0.68,
  releaseEnd: 1,
  periodMs: ARRIVAL_PERIOD_MS,
} as const;

export function getBreathProfile(
  severity: PulseChainSeverity,
  mode: PulseVisualMode,
  hueDeg = 190,
): PulseBreathProfile {
  if (mode === "arrival" || severity === "success") {
    return {
      periodMs: ARRIVAL_PERIOD_MS,
      hueDeg: 142,
      amp: 1,
      ampMin: 0.78,
      ampMax: 1,
      scaleMin: 0.96,
      scaleMax: 1.05,
    };
  }
  if (mode === "destination") {
    return {
      periodMs: DESTINATION_PERIOD_MS,
      hueDeg,
      amp: 1,
      ampMin: 0.78,
      ampMax: 1,
      scaleMin: 0.9,
      scaleMax: 1.12,
    };
  }
  if (mode === "static") {
    return {
      periodMs: GUIDE_PERIOD_MS,
      hueDeg,
      amp: 0.85,
      ampMin: 1,
      ampMax: 1,
      scaleMin: 1,
      scaleMax: 1,
    };
  }
  if (severity === "urgent") {
    return {
      periodMs: URGENT_PERIOD_MS,
      hueDeg: 0,
      amp: 1,
      ampMin: 0.78,
      ampMax: 1,
      scaleMin: 0.96,
      scaleMax: 1.08,
    };
  }
  if (severity === "warning") {
    return {
      periodMs: WARNING_PERIOD_MS,
      hueDeg: 38,
      amp: 1,
      ampMin: 0.8,
      ampMax: 1,
      scaleMin: 0.97,
      scaleMax: 1.06,
    };
  }
  return {
    periodMs: GUIDE_PERIOD_MS,
    hueDeg,
    amp: 1,
    ampMin: 0.82,
    ampMax: 1,
    scaleMin: 0.97,
    scaleMax: 1.05,
  };
}

/** Hue hint from tone solid hex (fallback cyan). */
export function hueDegFromHex(solid: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(solid.trim());
  if (!m) return 190;
  const n = Number.parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d < 1e-6) return 190;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return Math.round(h);
}

export type PulseBreathCssVars = CSSProperties & {
  readonly "--wm-pulse-period": string;
  readonly "--wm-pulse-hue": string;
  readonly "--wm-pulse-amp": string;
  readonly "--wm-pulse-amp-min": string;
  readonly "--wm-pulse-amp-max": string;
  readonly "--wm-pulse-scale-min": string;
  readonly "--wm-pulse-scale-max": string;
  readonly "--wm-pulse-gamma-inv": string;
  readonly "--wm-pulse-w125": string;
  readonly "--wm-pulse-w25": string;
  readonly "--wm-pulse-w375": string;
};

export function getBreathCssVars(
  severity: PulseChainSeverity,
  mode: PulseVisualMode,
  solidHex?: string,
): PulseBreathCssVars {
  const hue = solidHex ? hueDegFromHex(solidHex) : severity === "info" ? 190 : 142;
  const p = getBreathProfile(severity, mode, hue);
  return {
    "--wm-pulse-period": `${p.periodMs}ms`,
    "--wm-pulse-hue": String(p.hueDeg),
    "--wm-pulse-amp": String(p.amp),
    "--wm-pulse-amp-min": String(p.ampMin),
    "--wm-pulse-amp-max": String(p.ampMax),
    "--wm-pulse-scale-min": String(p.scaleMin),
    "--wm-pulse-scale-max": String(p.scaleMax),
    "--wm-pulse-gamma-inv": String(PULSE_BREATH_GAMMA_INV),
    "--wm-pulse-w125": String(BREATH_WAVE_WEIGHTS.t125),
    "--wm-pulse-w25": String(BREATH_WAVE_WEIGHTS.t25),
    "--wm-pulse-w375": String(BREATH_WAVE_WEIGHTS.t375),
  };
}
