/**
 * Job Mitra | plannerEscalationTriggers.service.ts
 * Hybrid A2 Phase-2 P2.4 — live triggers for understaff / no-show / publish fail.
 *
 * Uses plannerEscalationRegistry catalog. Bell via GROUP_UPDATE (info).
 * Pulse via PulseNode ids (action-required). No Career / Admin / Employment diary.
 */

import {
  demandPlannerStorage,
  buildPlannerSlotId,
} from "../../../employer/planner/storage/demandPlannerStorage";
import {
  plannerReadJson,
  plannerWriteJson,
} from "../../../employer/planner/storage/plannerSafeStorage";
import { handleIncomingNotification } from "../../../pulse/pulseEventBridge";
import { usePulseStore } from "../../../pulse/pulseStore";
import type { PulseChainSeverity } from "../../../pulse/pulseTypes";
import { getPlannerExecutionPort } from "../ports/plannerExecutionPort";
import {
  getPlannerEscalation,
  plannerEscalationIncludesBell,
  plannerEscalationIncludesPulse,
  type PlannerEscalationId,
  type PlannerEscalationSeverity,
} from "../plannerEscalationRegistry";
import { countConfirmedPlannerAppsForTarget } from "./plannerNativeApplication.helpers";
import { listPlannerRosterAssignments } from "./plannerRoster.helpers";

export const PLANNER_ESCALATION_FIRED_KEY = "wm_planner_escalation_fired_v1";

/** Upcoming window for understaff near-start detection (inclusive days from today). */
export const UNDERSTAFF_NEAR_START_DAYS = 3;

/** Fill ratio below this on near-start open capacity counts as risk. */
export const UNDERSTAFF_FILL_RATIO_THRESHOLD = 0.7;

type FiredMap = Record<string, number>;

export type UnderstaffRisk = {
  planId: string;
  planName: string;
  openNearStartSlots: number;
  neededWorkers: number;
  confirmedWorkers: number;
  fillRatio: number;
};

export type NoShowMiss = {
  planId: string;
  planName: string;
  workerMlId: string;
  workerName: string;
  missedDates: string[];
};

function todayIso(nowMs: number): string {
  const d = new Date(nowMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function compareIso(a: string, b: string): number {
  return a.localeCompare(b);
}

function readFired(): FiredMap {
  const raw = plannerReadJson<unknown>(PLANNER_ESCALATION_FIRED_KEY, {});
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
  const out: FiredMap = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

function markFired(key: string, at: number): void {
  const next = { ...readFired(), [key]: at };
  const entries = Object.entries(next)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 400);
  plannerWriteJson(PLANNER_ESCALATION_FIRED_KEY, Object.fromEntries(entries));
}

function wasFired(key: string): boolean {
  return Boolean(readFired()[key]);
}

function resolveRoute(template: string, planId: string): string {
  return template.includes(":planId") ? template.replace(":planId", planId) : template;
}

function toPulseSeverity(severity: PlannerEscalationSeverity): PulseChainSeverity {
  if (severity === "urgent") return "urgent";
  if (severity === "warning") return "warning";
  return "info";
}

function slotTargetId(
  planId: string,
  slot: { date: string; postId?: string; slotId?: string },
): string {
  const legacy = slot.postId?.trim();
  if (legacy) return legacy;
  const native = slot.slotId?.trim();
  if (native) return native;
  return buildPlannerSlotId(planId, slot.date);
}

function activateCatalogPulse(id: PlannerEscalationId): void {
  const entry = getPlannerEscalation(id);
  if (!plannerEscalationIncludesPulse(entry.channel) || !entry.pulseNodeId) return;
  usePulseStore.getState().setChain([entry.pulseNodeId], {
    severity: toPulseSeverity(entry.severity),
  });
}

function fireEmployerBell(args: {
  escalationId: PlannerEscalationId;
  planId: string;
  title: string;
  body: string;
}): void {
  const entry = getPlannerEscalation(args.escalationId);
  if (!plannerEscalationIncludesBell(entry.channel)) return;
  handleIncomingNotification({
    type: "GROUP_UPDATE",
    domain: "shift",
    affectedUserRole: "employer",
    severity: toPulseSeverity(entry.severity),
    title: args.title,
    body: args.body,
    route: resolveRoute(entry.nextRoute, args.planId),
  });
}

/** Pure detection — open capacity on slots within the near-start window. */
export function detectUnderstaffRisks(nowMs: number = Date.now()): UnderstaffRisk[] {
  const today = todayIso(nowMs);
  const windowEnd = addDaysIso(today, UNDERSTAFF_NEAR_START_DAYS);
  const risks: UnderstaffRisk[] = [];

  for (const plan of demandPlannerStorage.getAll()) {
    if (plan.status !== "active") continue;
    let needed = 0;
    let confirmed = 0;
    let openSlots = 0;

    for (const slot of plan.slots) {
      if (slot.workers <= 0) continue;
      if (compareIso(slot.date, today) < 0) continue;
      if (compareIso(slot.date, windowEnd) > 0) continue;

      const targetId = slotTargetId(plan.id, slot);
      const got = countConfirmedPlannerAppsForTarget({
        planId: plan.id,
        targetId,
      });
      needed += slot.workers;
      confirmed += Math.min(got, slot.workers);
      if (got < slot.workers) openSlots += 1;
    }

    if (needed === 0) continue;
    const fillRatio = confirmed / needed;
    if (openSlots > 0 && fillRatio < UNDERSTAFF_FILL_RATIO_THRESHOLD) {
      risks.push({
        planId: plan.id,
        planName: plan.name,
        openNearStartSlots: openSlots,
        neededWorkers: needed,
        confirmedWorkers: confirmed,
        fillRatio,
      });
    }
  }

  return risks;
}

/** Pure detection — confirmed roster days in the past without ExecutionPort check-in. */
export function detectNoShowMisses(nowMs: number = Date.now()): NoShowMiss[] {
  const today = todayIso(nowMs);
  const port = getPlannerExecutionPort();
  const byKey = new Map<string, NoShowMiss>();

  for (const assignment of listPlannerRosterAssignments({ confirmedOnly: true })) {
    const missed: string[] = [];
    for (const day of assignment.days) {
      if (!day.date || compareIso(day.date, today) >= 0) continue;
      const status = port.getDayExecutionStatus({
        planId: assignment.planId,
        slotDate: day.date,
        workerMlId: assignment.workerMlId,
        postId: day.postId || undefined,
      });
      if (!status?.attendanceConfirmed) {
        missed.push(day.date);
      }
    }
    if (missed.length === 0) continue;
    const key = `${assignment.planId}::${assignment.workerMlId}`;
    byKey.set(key, {
      planId: assignment.planId,
      planName: assignment.planName,
      workerMlId: assignment.workerMlId,
      workerName: assignment.workerName,
      missedDates: missed.sort(),
    });
  }

  return Array.from(byKey.values());
}

export function listUnderstaffPlanIds(nowMs?: number): Set<string> {
  return new Set(detectUnderstaffRisks(nowMs).map((r) => r.planId));
}

export function listNoShowWorkerMlIdsForPlan(planId: string, nowMs?: number): Set<string> {
  const id = planId.trim();
  return new Set(
    detectNoShowMisses(nowMs)
      .filter((m) => m.planId === id)
      .map((m) => m.workerMlId),
  );
}

/**
 * Fire understaff Bell (+ Pulse). Deduped per plan per calendar day.
 * Returns count of newly fired plan escalations.
 */
export function fireUnderstaffEscalations(nowMs: number = Date.now()): number {
  const entry = getPlannerEscalation("PLANNER_UNDERSTAFF_RISK");
  const risks = detectUnderstaffRisks(nowMs);
  const today = todayIso(nowMs);
  let fired = 0;

  for (const risk of risks) {
    const dedupeKey = `PLANNER_UNDERSTAFF_RISK:${risk.planId}:${today}`;
    if (wasFired(dedupeKey)) continue;

    fireEmployerBell({
      escalationId: "PLANNER_UNDERSTAFF_RISK",
      planId: risk.planId,
      title: `Understaff risk — ${risk.planName}`,
      body: `${risk.openNearStartSlots} open day(s) in the next ${UNDERSTAFF_NEAR_START_DAYS} days · fill ${Math.round(risk.fillRatio * 100)}%. ${entry.nextAction}.`,
    });
    markFired(dedupeKey, nowMs);
    fired += 1;
  }

  if (risks.length > 0 && plannerEscalationIncludesPulse(entry.channel)) {
    activateCatalogPulse("PLANNER_UNDERSTAFF_RISK");
  }

  return fired;
}

/**
 * Fire no-show Pulse (catalog is pulse-only). Deduped per worker+date.
 * Optional planId limits scan to one roster detail.
 */
export function fireNoShowEscalations(nowMs: number = Date.now(), planIdFilter?: string): number {
  const entry = getPlannerEscalation("PLANNER_NO_SHOW_CHECKIN");
  const filter = planIdFilter?.trim();
  const misses = detectNoShowMisses(nowMs).filter((m) => !filter || m.planId === filter);
  let fired = 0;

  for (const miss of misses) {
    for (const date of miss.missedDates) {
      const dedupeKey = `PLANNER_NO_SHOW_CHECKIN:${miss.planId}:${miss.workerMlId}:${date}`;
      if (wasFired(dedupeKey)) continue;

      if (plannerEscalationIncludesBell(entry.channel)) {
        fireEmployerBell({
          escalationId: "PLANNER_NO_SHOW_CHECKIN",
          planId: miss.planId,
          title: `Missed check-in — ${miss.workerName}`,
          body: `No check-in on ${date} for ${miss.planName}. ${entry.nextAction}.`,
        });
      }
      markFired(dedupeKey, nowMs);
      fired += 1;
    }
  }

  if (misses.length > 0 && plannerEscalationIncludesPulse(entry.channel)) {
    activateCatalogPulse("PLANNER_NO_SHOW_CHECKIN");
  }

  return fired;
}

/** Bell + existing audit path for publishStatus failed. Deduped per plan. */
export function notifyPublishFailed(planId: string, planName?: string): void {
  const id = planId.trim();
  if (!id) return;
  const dedupeKey = `PLANNER_PUBLISH_FAILED:${id}`;
  if (wasFired(dedupeKey)) return;

  const name = planName?.trim() || demandPlannerStorage.getById(id)?.name || id;
  const entry = getPlannerEscalation("PLANNER_PUBLISH_FAILED");
  fireEmployerBell({
    escalationId: "PLANNER_PUBLISH_FAILED",
    planId: id,
    title: `Publish failed — ${name}`,
    body: `${entry.summary} ${entry.nextAction}.`,
  });
  markFired(dedupeKey, Date.now());
}

/** Roster index scan — understaff. */
export function runRosterUnderstaffScan(nowMs?: number): {
  planIds: Set<string>;
  fired: number;
} {
  const planIds = listUnderstaffPlanIds(nowMs);
  const fired = fireUnderstaffEscalations(nowMs);
  return { planIds, fired };
}

/** Roster detail scan — no-show for one plan. */
export function runRosterNoShowScan(
  planId: string,
  nowMs?: number,
): { workerMlIds: Set<string>; fired: number } {
  const workerMlIds = listNoShowWorkerMlIdsForPlan(planId, nowMs);
  const fired = fireNoShowEscalations(nowMs, planId);
  return { workerMlIds, fired };
}

/** Test helper — clear fired dedupe map. */
export function __clearPlannerEscalationFiredForTests(): void {
  plannerWriteJson(PLANNER_ESCALATION_FIRED_KEY, {});
}
