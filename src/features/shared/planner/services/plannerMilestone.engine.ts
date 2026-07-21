/**
 * Job Mitra | plannerMilestone.engine.ts
 * Hybrid A2 S7 — 30-day (plan.epochDays) milestone commits → wm_vault_planner_history_v1
 *
 * Idempotent key: (planId, workerMlId, epochIndex)
 * Active summaries stay vaultFinalized:false until offboard / 60-day inactivity.
 */

import { demandPlannerStorage } from "../../../employer/planner/storage/demandPlannerStorage";
import {
  getVaultPlannerHistoryForWorker,
  recordPlannerEpochInVault,
  recordPlannerOffboardInVault,
} from "../plannerVault";
import { readPlannerCheckIns } from "../ports/plannerCheckIn.ledger";
import {
  listPlannerRosterAssignments,
  type PlannerRosterAssignment,
} from "./plannerRoster.helpers";

const DAY_MS = 86_400_000;
export const PLANNER_INACTIVITY_DAYS = 60;

export type PlannerEpochWindow = {
  epochIndex: number;
  epochStart: number;
  epochEnd: number;
};

export function getEpochWindow(
  joinedAt: number,
  epochIndex: number,
  epochDays: number,
): PlannerEpochWindow {
  const days = Math.max(1, Math.floor(epochDays));
  const epochStart = joinedAt + epochIndex * days * DAY_MS;
  const epochEnd = epochStart + days * DAY_MS - 1;
  return { epochIndex, epochStart, epochEnd };
}

export function getCurrentEpochIndex(joinedAt: number, now: number, epochDays: number): number {
  const days = Math.max(1, Math.floor(epochDays));
  if (now < joinedAt) return 0;
  return Math.floor((now - joinedAt) / (days * DAY_MS));
}

function isoDate(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateInWindow(dateIso: string, epochStart: number, epochEnd: number): boolean {
  const t = Date.parse(`${dateIso}T12:00:00`);
  if (!Number.isFinite(t)) return false;
  return t >= epochStart && t <= epochEnd;
}

export type MilestoneCommitResult = {
  planId: string;
  workerMlId: string;
  epochIndex: number;
  daysScheduled: number;
  daysCompleted: number;
  attendanceRate: number;
};

export type MilestoneEngineResult = {
  committed: MilestoneCommitResult[];
  inactivityFinalized: number;
};

function attendanceForEpoch(
  assignment: PlannerRosterAssignment,
  window: PlannerEpochWindow,
): {
  daysScheduled: number;
  daysCompleted: number;
  attendanceRate: number;
  reliabilityScore: number;
} {
  const scheduled = assignment.days.filter((d) =>
    dateInWindow(d.date, window.epochStart, window.epochEnd),
  );
  const checkIns = readPlannerCheckIns().filter(
    (c) =>
      c.planId === assignment.planId &&
      c.workerMlId.trim().toUpperCase() === assignment.workerMlId.trim().toUpperCase() &&
      dateInWindow(c.slotDate, window.epochStart, window.epochEnd),
  );
  const completedDates = new Set(checkIns.map((c) => c.slotDate));
  const daysScheduled = scheduled.length;
  const daysCompleted = scheduled.filter((d) => completedDates.has(d.date)).length;
  const attendanceRate = daysScheduled > 0 ? Math.round((daysCompleted / daysScheduled) * 100) : 0;
  const reliabilityScore = attendanceRate;
  return { daysScheduled, daysCompleted, attendanceRate, reliabilityScore };
}

function commitEpochIfDue(
  assignment: PlannerRosterAssignment,
  epochIndex: number,
  now: number,
): MilestoneCommitResult | null {
  const window = getEpochWindow(assignment.joinedAt, epochIndex, assignment.epochDays);
  // Commit only after the epoch window has fully elapsed.
  if (now <= window.epochEnd) return null;

  const existing = getVaultPlannerHistoryForWorker(assignment.workerMlId).find(
    (e) => e.planId === assignment.planId && e.epochIndex === epochIndex,
  );
  if (existing) return null;

  const stats = attendanceForEpoch(assignment, window);
  // Skip empty epochs with zero scheduled days (worker not on roster that window).
  if (stats.daysScheduled === 0) return null;

  const entry = recordPlannerEpochInVault({
    planId: assignment.planId,
    assignmentId: `${assignment.planId}_${assignment.workerMlId}`,
    employeeMlId: assignment.workerMlId,
    employeeName: assignment.workerName,
    employerMlId: assignment.employerMlId,
    companyName: assignment.companyName,
    planName: assignment.planName,
    epochIndex,
    epochStart: window.epochStart,
    epochEnd: window.epochEnd,
    daysScheduled: stats.daysScheduled,
    daysCompleted: stats.daysCompleted,
    attendanceRate: stats.attendanceRate,
    reliabilityScore: stats.reliabilityScore,
    siteManagerId: assignment.siteManagerId,
    siteId: assignment.siteId,
    completedAt: now,
  });

  if (!entry) return null;

  return {
    planId: assignment.planId,
    workerMlId: assignment.workerMlId,
    epochIndex,
    daysScheduled: stats.daysScheduled,
    daysCompleted: stats.daysCompleted,
    attendanceRate: stats.attendanceRate,
  };
}

function lastActivityAt(assignment: PlannerRosterAssignment): number {
  const checkIns = readPlannerCheckIns().filter(
    (c) =>
      c.planId === assignment.planId &&
      c.workerMlId.trim().toUpperCase() === assignment.workerMlId.trim().toUpperCase(),
  );
  const lastCheck = checkIns.reduce((max, c) => Math.max(max, c.checkedInAt), 0);
  const lastDay = assignment.days.reduce((max, d) => {
    const t = Date.parse(`${d.date}T23:59:59`);
    return Number.isFinite(t) ? Math.max(max, t) : max;
  }, 0);
  return Math.max(lastCheck, lastDay, assignment.joinedAt);
}

/**
 * Commit due epochs for all (or filtered) assignments, then inactivity finalize.
 */
export function runPlannerMilestoneEngine(options?: {
  now?: number;
  planId?: string;
  workerMlId?: string;
}): MilestoneEngineResult {
  const now = options?.now ?? Date.now();
  const assignments = listPlannerRosterAssignments({
    planId: options?.planId,
    workerMlId: options?.workerMlId,
    confirmedOnly: true,
  });

  const committed: MilestoneCommitResult[] = [];
  let inactivityFinalized = 0;
  const planCursorBump = new Map<string, number>();

  for (const assignment of assignments) {
    const current = getCurrentEpochIndex(assignment.joinedAt, now, assignment.epochDays);
    // Commit every completed epoch up to current-1 (or current if window ended).
    for (let epochIndex = 0; epochIndex <= current; epochIndex += 1) {
      const result = commitEpochIfDue(assignment, epochIndex, now);
      if (result) {
        committed.push(result);
        const prev = planCursorBump.get(assignment.planId) ?? 0;
        planCursorBump.set(assignment.planId, Math.max(prev, epochIndex + 1));
      }
    }

    const inactiveMs = PLANNER_INACTIVITY_DAYS * DAY_MS;
    if (now - lastActivityAt(assignment) >= inactiveMs) {
      const closed = recordPlannerOffboardInVault({
        planId: assignment.planId,
        employeeMlId: assignment.workerMlId,
        exitType: "inactivity",
      });
      if (closed) inactivityFinalized += 1;
    }
  }

  for (const [planId, cursor] of planCursorBump) {
    const plan = demandPlannerStorage.getById(planId);
    if (!plan) continue;
    if (cursor > plan.milestoneCursor) {
      demandPlannerStorage.updatePlan(planId, { milestoneCursor: cursor });
    }
  }

  return { committed, inactivityFinalized };
}

export function getAssignmentEpochProgress(
  assignment: PlannerRosterAssignment,
  now = Date.now(),
): {
  currentEpochIndex: number;
  window: PlannerEpochWindow;
  daysScheduled: number;
  daysCompleted: number;
  attendanceRate: number;
  epochEndsAt: number;
  isoToday: string;
} {
  const currentEpochIndex = getCurrentEpochIndex(assignment.joinedAt, now, assignment.epochDays);
  const window = getEpochWindow(assignment.joinedAt, currentEpochIndex, assignment.epochDays);
  const stats = attendanceForEpoch(assignment, window);
  return {
    currentEpochIndex,
    window,
    daysScheduled: stats.daysScheduled,
    daysCompleted: stats.daysCompleted,
    attendanceRate: stats.attendanceRate,
    epochEndsAt: window.epochEnd,
    isoToday: isoDate(now),
  };
}
