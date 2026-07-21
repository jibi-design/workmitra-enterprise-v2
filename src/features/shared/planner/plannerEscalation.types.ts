/**
 * Job Mitra | plannerEscalation.types.ts
 * Hybrid A2 Phase-2 P2.3 — planner escalation catalog contracts.
 *
 * Bell = information-only. Pulse = action-required (left-edge cards / button halo).
 * No Career / Admin / Employment diary mix.
 */

/** Delivery channel — mirrors INFORMATION_ONLY vs PULSE_ENABLED split. */
export type PlannerEscalationChannel = "bell" | "pulse" | "bell_and_pulse";

export type PlannerEscalationSeverity = "info" | "warning" | "urgent";

export type PlannerEscalationAudience = "employer" | "employee";

/**
 * How PulseTarget wrappers must render when channel includes pulse.
 * card → left-edge only (PulseNode / PulseTargetCard)
 * button → outer halo only (PulseTargetButton) — never left-edge on buttons
 */
export type PlannerEscalationPulseSurface = "card" | "button";

export type PlannerEscalationId =
  | "PLANNER_UNDERSTAFF_RISK"
  | "PLANNER_NO_SHOW_CHECKIN"
  | "PLANNER_PUBLISH_FAILED"
  | "PLANNER_PLAN_CANCELLED"
  | "PLANNER_RTW_EXPIRING";

export type PlannerEscalationEntry = {
  readonly id: PlannerEscalationId;
  readonly severity: PlannerEscalationSeverity;
  readonly channel: PlannerEscalationChannel;
  readonly audience: PlannerEscalationAudience;
  /** Human CTA label (Zero Dead-End). Required when channel includes pulse. */
  readonly nextAction: string;
  /** Absolute planner route (may include :planId). */
  readonly nextRoute: string;
  /** Short catalog summary for tests / future trigger docs. */
  readonly summary: string;
  /**
   * Logical pulse node id for P2.4 wiring into PulseNode / PulseTarget.
   * Required when channel is pulse or bell_and_pulse.
   */
  readonly pulseNodeId?: string;
  readonly pulseSurface?: PlannerEscalationPulseSurface;
  /**
   * Reserved / future — catalog may list entries before triggers ship.
   * P2.3: all listed ids are catalog-ready; triggers land in P2.4 / P2.5.
   */
  readonly triggerSection: "P2.4" | "P2.5" | "legacy";
};
