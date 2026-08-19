/** Traffic-light LED tones — urgency only (green / amber / red). No domain hues. */

import type { NotificationId } from "./pulseEvents";
import type { PulseVisualDomain, ResolvePulseDomainInput } from "./pulseDomainResolve";
import type { PulseChainSeverity, PulseNodeId } from "./pulseTypes";

export type PulseEdgeTone = {
  readonly background: string;
  readonly solid: string;
  readonly ledColorA: string;
  readonly ledColorB: string;
  readonly shadow: string;
  readonly focusRing: string;
  readonly rim: string;
};

export type PulseVisualMode = "breathe" | "arrival" | "static" | "destination";

/** Inner inset from the card top-right corner (px). */
export const PULSE_LED_CORNER_INSET_PX = 10;

export const GREEN_EDGE_TONE: PulseEdgeTone = {
  background: "radial-gradient(circle at 38% 32%, #bbf7d0 0%, #4ade80 28%, #16a34a 68%, #14532d 100%)",
  solid: "#22c55e",
  ledColorA: "rgba(74,222,128,0.95)",
  ledColorB: "rgba(34,197,94,0.8)",
  shadow: "0 0 12px 3px rgba(34,197,94,0.75)",
  focusRing: "focus-visible:ring-emerald-500/35",
  rim: "rgba(255,255,255,0.55)",
};

export const AMBER_EDGE_TONE: PulseEdgeTone = {
  background: "radial-gradient(circle at 38% 32%, #fde68a 0%, #fbbf24 28%, #d97706 68%, #78350f 100%)",
  solid: "#f59e0b",
  ledColorA: "rgba(251,191,36,0.95)",
  ledColorB: "rgba(217,119,6,0.8)",
  shadow: "0 0 12px 3px rgba(245,158,11,0.75)",
  focusRing: "focus-visible:ring-amber-500/35",
  rim: "rgba(255,255,255,0.5)",
};

export const RED_EDGE_TONE: PulseEdgeTone = {
  background: "radial-gradient(circle at 38% 32%, #fecaca 0%, #f87171 28%, #dc2626 68%, #7f1d1d 100%)",
  solid: "#ef4444",
  ledColorA: "rgba(248,113,113,0.95)",
  ledColorB: "rgba(220,38,38,0.82)",
  shadow: "0 0 12px 3px rgba(239,68,68,0.75)",
  focusRing: "focus-visible:ring-red-500/35",
  rim: "rgba(255,255,255,0.5)",
};

export const SHIFT_EDGE_TONE = GREEN_EDGE_TONE;
export const CAREER_EDGE_TONE = GREEN_EDGE_TONE;
export const WARNING_EDGE_TONE = AMBER_EDGE_TONE;
export const URGENT_EDGE_TONE = RED_EDGE_TONE;
export const INFO_EDGE_TONE = GREEN_EDGE_TONE;
export const ARRIVAL_SUCCESS_TONE = GREEN_EDGE_TONE;

export function getGuideToneForDomain(_domain: PulseVisualDomain): PulseEdgeTone {
  void _domain;
  return GREEN_EDGE_TONE;
}

export type GetEdgeToneInput = ResolvePulseDomainInput & {
  readonly severity: PulseChainSeverity;
};

/** Traffic light: urgent=red · warning=amber · info/success=green. */
export function getEdgeTone(
  severityOrInput: PulseChainSeverity | GetEdgeToneInput,
  maybeSeverity?: PulseChainSeverity,
): PulseEdgeTone {
  if (typeof severityOrInput === "string" && maybeSeverity !== undefined) {
    const nodeId = severityOrInput as PulseNodeId;
    return getEdgeTone({ nodeId, severity: maybeSeverity });
  }

  const input = severityOrInput as GetEdgeToneInput;
  if (input.severity === "urgent") return RED_EDGE_TONE;
  if (input.severity === "warning") return AMBER_EDGE_TONE;
  return GREEN_EDGE_TONE;
}

export function getEdgeToneForEvent(
  eventId: NotificationId | string,
  severity: PulseChainSeverity,
): PulseEdgeTone {
  return getEdgeTone({ eventId, severity });
}

export function getLedModeClassName(severity: PulseChainSeverity, mode: PulseVisualMode): string {
  if (mode === "arrival") return "wm-led wm-led-arrival";
  if (mode === "destination") return "wm-led wm-led-destination";
  if (mode === "static") return "wm-led wm-led-static";
  if (severity === "urgent") return "wm-led wm-led-urgent";
  if (severity === "warning") return "wm-led wm-led-warning";
  return "wm-led wm-led-guide";
}
