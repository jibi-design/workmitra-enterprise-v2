/**
 * Job Mitra | plannerRtw.service.ts
 * Hybrid A2 Phase-2 P2.5 — RTW expiry scan, audit, Bell + Pulse.
 *
 * Lightweight Visa / Right-to-Work only — never NMC / clinical.
 */

import { appendPlannerAudit } from "../../../employer/planner/storage/plannerAuditLog.storage";
import { demandPlannerStorage } from "../../../employer/planner/storage/demandPlannerStorage";
import {
  getPlannerRtwRecord,
  getPlannerRtwWarnDays,
  listPlannerRtwRecords,
  type PlannerRtwRecord,
} from "../../../employer/planner/storage/plannerRtw.storage";
import {
  plannerReadJson,
  plannerWriteJson,
} from "../../../employer/planner/storage/plannerSafeStorage";
import { handleIncomingNotification } from "../../../pulse/pulseEventBridge";
import { usePulseStore } from "../../../pulse/pulseStore";
import type { PulseChainSeverity } from "../../../pulse/pulseTypes";
import {
  getPlannerEscalation,
  plannerEscalationIncludesBell,
  plannerEscalationIncludesPulse,
} from "../plannerEscalationRegistry";
import { listPlannerRosterAssignments } from "./plannerRoster.helpers";

export const PLANNER_RTW_FIRED_KEY = "wm_planner_rtw_fired_v1";

export type PlannerRtwFlagLevel = "ok" | "warning" | "expired" | "missing";

export type PlannerRtwFlag = {
  planId: string;
  planName: string;
  workerMlId: string;
  workerName: string;
  expiresOn: string;
  daysRemaining: number;
  level: "warning" | "expired";
  documentKind: PlannerRtwRecord["documentKind"];
  warnDaysBefore: number;
};

type FiredMap = Record<string, number>;

function todayIso(nowMs: number): string {
  const d = new Date(nowMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetweenIso(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T12:00:00`);
  const b = Date.parse(`${toIso}T12:00:00`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

function readFired(): FiredMap {
  const raw = plannerReadJson<unknown>(PLANNER_RTW_FIRED_KEY, {});
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
  plannerWriteJson(PLANNER_RTW_FIRED_KEY, Object.fromEntries(entries));
}

function wasFired(key: string): boolean {
  return Boolean(readFired()[key]);
}

function toPulseSeverity(level: "warning" | "expired"): PulseChainSeverity {
  return level === "expired" ? "urgent" : "warning";
}

/** Status for one worker against current warn window. */
export function getPlannerRtwFlagLevel(
  workerMlId: string,
  nowMs: number = Date.now(),
): { level: PlannerRtwFlagLevel; record: PlannerRtwRecord | null; daysRemaining: number | null } {
  const record = getPlannerRtwRecord(workerMlId);
  if (!record) return { level: "missing", record: null, daysRemaining: null };
  const today = todayIso(nowMs);
  const daysRemaining = daysBetweenIso(today, record.expiresOn);
  const warn = getPlannerRtwWarnDays();
  if (daysRemaining < 0) return { level: "expired", record, daysRemaining };
  if (daysRemaining <= warn) return { level: "warning", record, daysRemaining };
  return { level: "ok", record, daysRemaining };
}

/** Cross roster confirmed workers with RTW records in warn/expired window. */
export function detectRtwFlags(
  nowMs: number = Date.now(),
  planIdFilter?: string,
): PlannerRtwFlag[] {
  const filter = planIdFilter?.trim();
  const warnDaysBefore = getPlannerRtwWarnDays();
  const records = listPlannerRtwRecords();
  if (records.length === 0) return [];

  const byWorker = new Map(records.map((r) => [r.workerMlId, r]));
  const flags: PlannerRtwFlag[] = [];
  const seen = new Set<string>();

  for (const assignment of listPlannerRosterAssignments({
    planId: filter,
    confirmedOnly: true,
  })) {
    const record = byWorker.get(assignment.workerMlId.trim().toUpperCase());
    if (!record) continue;
    const { level, daysRemaining } = getPlannerRtwFlagLevel(assignment.workerMlId, nowMs);
    if (level !== "warning" && level !== "expired") continue;
    if (daysRemaining === null) continue;

    const key = `${assignment.planId}::${assignment.workerMlId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    flags.push({
      planId: assignment.planId,
      planName: assignment.planName,
      workerMlId: assignment.workerMlId,
      workerName: assignment.workerName || record.workerName || assignment.workerMlId,
      expiresOn: record.expiresOn,
      daysRemaining,
      level,
      documentKind: record.documentKind,
      warnDaysBefore,
    });
  }

  return flags;
}

export function listRtwFlaggedWorkerMlIdsForPlan(planId: string, nowMs?: number): Set<string> {
  return new Set(detectRtwFlags(nowMs, planId).map((f) => f.workerMlId));
}

/**
 * Fire Bell + Pulse + audit `rtw_flagged`. Deduped per plan+worker+expiresOn.
 */
export function fireRtwEscalations(nowMs: number = Date.now(), planIdFilter?: string): number {
  const entry = getPlannerEscalation("PLANNER_RTW_EXPIRING");
  const flags = detectRtwFlags(nowMs, planIdFilter);
  let fired = 0;

  for (const flag of flags) {
    const dedupeKey = `PLANNER_RTW_EXPIRING:${flag.planId}:${flag.workerMlId}:${flag.expiresOn}`;
    if (wasFired(dedupeKey)) continue;

    const plan = demandPlannerStorage.getById(flag.planId);
    const label =
      flag.documentKind === "visa"
        ? "Visa"
        : flag.documentKind === "right_to_work"
          ? "Right to Work"
          : "RTW document";
    const when =
      flag.level === "expired"
        ? `expired ${Math.abs(flag.daysRemaining)} day(s) ago`
        : `expires in ${flag.daysRemaining} day(s)`;

    if (plannerEscalationIncludesBell(entry.channel)) {
      const route = entry.nextRoute.includes(":planId")
        ? entry.nextRoute.replace(":planId", flag.planId)
        : entry.nextRoute;
      handleIncomingNotification({
        type: "GROUP_UPDATE",
        domain: "shift",
        affectedUserRole: "employer",
        severity: toPulseSeverity(flag.level),
        title: `RTW ${flag.level === "expired" ? "expired" : "expiring"} — ${flag.workerName}`,
        body: `${label} ${when} (${flag.expiresOn}) on ${flag.planName}. ${entry.nextAction}.`,
        route,
      });
    }

    appendPlannerAudit({
      planId: flag.planId,
      actor: "system",
      actorMlId: plan?.legalEntityMlId,
      siteManagerId: plan?.siteManagerId,
      action: "rtw_flagged",
      summary: `${label} ${when} · ${flag.workerName} · ${flag.expiresOn}`,
      meta: {
        workerMlId: flag.workerMlId,
        expiresOn: flag.expiresOn,
        daysRemaining: flag.daysRemaining,
        level: flag.level,
        documentKind: flag.documentKind,
        warnDaysBefore: flag.warnDaysBefore,
        notNmcClinical: true,
      },
      at: nowMs,
    });

    markFired(dedupeKey, nowMs);
    fired += 1;
  }

  if (flags.length > 0 && plannerEscalationIncludesPulse(entry.channel)) {
    const severity = flags.some((f) => f.level === "expired") ? "urgent" : "warning";
    if (entry.pulseNodeId) {
      usePulseStore.getState().setChain([entry.pulseNodeId], { severity });
    }
  }

  return fired;
}

export function runRosterRtwScan(
  planId: string,
  nowMs?: number,
): { workerMlIds: Set<string>; fired: number } {
  const workerMlIds = listRtwFlaggedWorkerMlIdsForPlan(planId, nowMs);
  const fired = fireRtwEscalations(nowMs, planId);
  return { workerMlIds, fired };
}

export function __clearPlannerRtwFiredForTests(): void {
  plannerWriteJson(PLANNER_RTW_FIRED_KEY, {});
}
