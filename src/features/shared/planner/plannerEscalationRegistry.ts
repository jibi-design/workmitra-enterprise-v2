/**
 * Job Mitra | plannerEscalationRegistry.ts
 * Hybrid A2 Phase-2 P2.3 — central planner escalation catalog.
 *
 * Catalog + live triggers (P2.4 understaff/noshow/publish; P2.5 RTW).
 * Domain lock: planner-scoped; never Career / Admin / Employment diary.
 */

import { PLANNER_ROUTE_CONTRACT } from "./plannerRouteContract";
import type {
  PlannerEscalationChannel,
  PlannerEscalationEntry,
  PlannerEscalationId,
} from "./plannerEscalation.types";

export type {
  PlannerEscalationAudience,
  PlannerEscalationChannel,
  PlannerEscalationEntry,
  PlannerEscalationId,
  PlannerEscalationPulseSurface,
  PlannerEscalationSeverity,
} from "./plannerEscalation.types";

/**
 * Frozen catalog. Keys are PlannerEscalationId.
 * Pulse entries must declare pulseNodeId + pulseSurface + nextAction/nextRoute.
 */
export const PLANNER_ESCALATION_REGISTRY: Record<PlannerEscalationId, PlannerEscalationEntry> = {
  PLANNER_UNDERSTAFF_RISK: {
    id: "PLANNER_UNDERSTAFF_RISK",
    severity: "warning",
    channel: "bell_and_pulse",
    audience: "employer",
    nextAction: "Open roster and fill coverage",
    nextRoute: PLANNER_ROUTE_CONTRACT.employer.roster,
    summary: "Open slots near start date or fill % drop — Bell + Pulse if action needed.",
    pulseNodeId: "employer-planner-roster-understaff",
    pulseSurface: "card",
    triggerSection: "P2.4",
  },
  PLANNER_NO_SHOW_CHECKIN: {
    id: "PLANNER_NO_SHOW_CHECKIN",
    severity: "urgent",
    channel: "pulse",
    audience: "employer",
    nextAction: "Review roster day and replace coverage",
    nextRoute: PLANNER_ROUTE_CONTRACT.employer.rosterDetail,
    summary: "No-show / missed check-in via PlannerExecutionPort ledger — Pulse on roster.",
    pulseNodeId: "employer-planner-roster-noshow",
    pulseSurface: "card",
    triggerSection: "P2.4",
  },
  PLANNER_PUBLISH_FAILED: {
    id: "PLANNER_PUBLISH_FAILED",
    severity: "warning",
    channel: "bell",
    audience: "employer",
    nextAction: "Retry publish from plan detail",
    nextRoute: PLANNER_ROUTE_CONTRACT.employer.detail,
    summary: "publishStatus failed — Bell + audit only (no pulse spam).",
    triggerSection: "P2.4",
  },
  PLANNER_PLAN_CANCELLED: {
    id: "PLANNER_PLAN_CANCELLED",
    severity: "warning",
    channel: "bell_and_pulse",
    audience: "employee",
    nextAction: "View applications / cancelled plan",
    nextRoute: PLANNER_ROUTE_CONTRACT.employee.applications,
    summary: "Legacy plan-cancelled notify (existing pulse chains under shift domain).",
    pulseNodeId: "employee-plan-cancelled-card",
    pulseSurface: "card",
    triggerSection: "legacy",
  },
  PLANNER_RTW_EXPIRING: {
    id: "PLANNER_RTW_EXPIRING",
    severity: "warning",
    channel: "bell_and_pulse",
    audience: "employer",
    nextAction: "Review worker RTW on roster",
    nextRoute: PLANNER_ROUTE_CONTRACT.employer.rosterDetail,
    summary: "Visa / Right-to-Work expiry warning (lightweight; not NMC clinical).",
    pulseNodeId: "employer-planner-roster-rtw",
    pulseSurface: "card",
    triggerSection: "P2.5",
  },
};

export const PLANNER_ESCALATION_IDS = Object.keys(
  PLANNER_ESCALATION_REGISTRY,
) as PlannerEscalationId[];

export function getPlannerEscalation(id: PlannerEscalationId): PlannerEscalationEntry {
  return PLANNER_ESCALATION_REGISTRY[id];
}

export function listPlannerEscalations(): readonly PlannerEscalationEntry[] {
  return PLANNER_ESCALATION_IDS.map((id) => PLANNER_ESCALATION_REGISTRY[id]);
}

export function plannerEscalationIncludesBell(channel: PlannerEscalationChannel): boolean {
  return channel === "bell" || channel === "bell_and_pulse";
}

export function plannerEscalationIncludesPulse(channel: PlannerEscalationChannel): boolean {
  return channel === "pulse" || channel === "bell_and_pulse";
}

/** True when Pulse wrappers (PulseNode / PulseTarget) must be used for this entry. */
export function isPlannerEscalationActionRequired(entry: PlannerEscalationEntry): boolean {
  return plannerEscalationIncludesPulse(entry.channel);
}

/**
 * Resolve nextAction / nextRoute for Zero Dead-End.
 * Pulse escalations always have both; bell-only also carries a recovery route.
 */
export function resolvePlannerEscalationNextStep(id: PlannerEscalationId): {
  nextAction: string;
  nextRoute: string;
} {
  const entry = getPlannerEscalation(id);
  return { nextAction: entry.nextAction, nextRoute: entry.nextRoute };
}
