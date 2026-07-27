/** Pulse LED / halo tone tokens — severity-first, then domain GUIDE. */

import type { PulseChainSeverity, PulseNodeId } from "./pulseTypes";

export type PulseEdgeTone = {
  readonly background: string;
  readonly solid: string;
  readonly ledColorA: string;
  readonly ledColorB: string;
  readonly shadow: string;
  readonly focusRing: string;
};

export type PulseVisualMode = "breathe" | "arrival" | "static";

export const SHIFT_EDGE_TONE: PulseEdgeTone = {
  background:
    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, #22c55e 40%, #15803d 100%)",
  solid: "#22c55e",
  ledColorA: "rgba(34,197,94,0.35)",
  ledColorB: "rgba(34,197,94,0.5)",
  shadow: "0 0 8px 2px rgba(34,197,94,0.9), 0 0 22px 6px rgba(34,197,94,0.45)",
  focusRing: "focus-visible:ring-emerald-500/35",
};

export const CAREER_EDGE_TONE: PulseEdgeTone = {
  background:
    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, #3b82f6 40%, #1d4ed8 100%)",
  solid: "#3b82f6",
  ledColorA: "rgba(59,130,246,0.35)",
  ledColorB: "rgba(59,130,246,0.5)",
  shadow: "0 0 8px 2px rgba(59,130,246,0.9), 0 0 22px 6px rgba(59,130,246,0.45)",
  focusRing: "focus-visible:ring-blue-500/35",
};

export const WARNING_EDGE_TONE: PulseEdgeTone = {
  background:
    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, #fbbf24 40%, #d97706 100%)",
  solid: "#fbbf24",
  ledColorA: "rgba(245,158,11,0.35)",
  ledColorB: "rgba(245,158,11,0.5)",
  shadow: "0 0 8px 2px rgba(245,158,11,0.9), 0 0 22px 6px rgba(245,158,11,0.45)",
  focusRing: "focus-visible:ring-amber-500/35",
};

export const URGENT_EDGE_TONE: PulseEdgeTone = {
  background:
    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, #f87171 40%, #dc2626 100%)",
  solid: "#f87171",
  ledColorA: "rgba(239,68,68,0.35)",
  ledColorB: "rgba(239,68,68,0.5)",
  shadow: "0 0 8px 2px rgba(239,68,68,0.9), 0 0 22px 6px rgba(239,68,68,0.45)",
  focusRing: "focus-visible:ring-red-500/35",
};

const PREMIUM_EDGE_TONE: PulseEdgeTone = {
  background:
    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, #a855f7 40%, #7c3aed 100%)",
  solid: "#a855f7",
  ledColorA: "rgba(168,85,247,0.35)",
  ledColorB: "rgba(168,85,247,0.5)",
  shadow: "0 0 8px 2px rgba(168,85,247,0.9), 0 0 22px 6px rgba(168,85,247,0.45)",
  focusRing: "focus-visible:ring-violet-500/35",
};

const PLANNER_EDGE_TONE: PulseEdgeTone = {
  background:
    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, #06b6d4 40%, #0891b2 100%)",
  solid: "#06b6d4",
  ledColorA: "rgba(6,182,212,0.35)",
  ledColorB: "rgba(6,182,212,0.5)",
  shadow: "0 0 8px 2px rgba(8,145,178,0.95), 0 0 22px 6px rgba(8,145,178,0.45)",
  focusRing: "focus-visible:ring-cyan-500/35",
};

const INFO_EDGE_TONE: PulseEdgeTone = {
  background:
    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, #22d3ee 40%, #0891b2 100%)",
  solid: "#22d3ee",
  ledColorA: "rgba(8,145,178,0.35)",
  ledColorB: "rgba(8,145,178,0.45)",
  shadow: "0 0 8px 2px rgba(8,145,178,0.9), 0 0 22px 6px rgba(8,145,178,0.45)",
  focusRing: "focus-visible:ring-cyan-500/35",
};

/** Arrival success — solid green destination lock. */
export const ARRIVAL_SUCCESS_TONE: PulseEdgeTone = {
  background:
    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, #4ade80 35%, #16a34a 100%)",
  solid: "#16a34a",
  ledColorA: "rgba(22,163,74,0.45)",
  ledColorB: "rgba(22,163,74,0.65)",
  shadow: "0 0 0 2px rgba(22,163,74,0.55), 0 0 18px 6px rgba(22,163,74,0.5)",
  focusRing: "focus-visible:ring-emerald-500/40",
};

function getDomainGuideTone(nodeId: PulseNodeId): PulseEdgeTone {
  const normalizedNodeId = nodeId.toLowerCase();

  if (normalizedNodeId.includes("planner") || normalizedNodeId.includes("gig-project")) {
    return PLANNER_EDGE_TONE;
  }
  if (normalizedNodeId.includes("shift")) return SHIFT_EDGE_TONE;
  if (
    normalizedNodeId.includes("career") ||
    normalizedNodeId.includes("interview") ||
    normalizedNodeId.includes("offer")
  ) {
    return CAREER_EDGE_TONE;
  }
  if (
    normalizedNodeId.includes("premium") ||
    normalizedNodeId.includes("ai") ||
    normalizedNodeId.includes("vault")
  ) {
    return PREMIUM_EDGE_TONE;
  }
  return INFO_EDGE_TONE;
}

/**
 * Pillar 1 — Priority & domain-aware matrix:
 * URGENT (red) → PENDING/warning (yellow) → GUIDE domain theme (info/success).
 */
export function getEdgeTone(nodeId: PulseNodeId, severity: PulseChainSeverity): PulseEdgeTone {
  if (severity === "urgent") return URGENT_EDGE_TONE;
  if (severity === "warning") return WARNING_EDGE_TONE;
  if (severity === "success") return ARRIVAL_SUCCESS_TONE;
  return getDomainGuideTone(nodeId);
}

export function getLedModeClassName(severity: PulseChainSeverity, mode: PulseVisualMode): string {
  if (mode === "arrival") return "wm-led wm-led-arrival";
  if (mode === "static") return "wm-led wm-led-static";
  if (severity === "urgent") return "wm-led wm-led-urgent";
  if (severity === "warning") return "wm-led wm-led-warning";
  if (severity === "info" || severity === "success") return "wm-led wm-led-guide";
  return "wm-led wm-led-normal";
}
