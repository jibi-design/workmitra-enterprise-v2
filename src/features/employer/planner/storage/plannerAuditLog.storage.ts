/**
 * Job Mitra | plannerAuditLog.storage.ts
 * Hybrid A2 Phase-2 P2.1 — wm_planner_audit_log_v1 (plan-scoped, 200/plan FIFO).
 */

import { plannerDispatchChanged, plannerReadJson, plannerWriteJson } from "./plannerSafeStorage";

export const PLANNER_AUDIT_LOG_KEY = "wm_planner_audit_log_v1";
export const PLANNER_AUDIT_LOG_CHANGED = "wm:planner-audit-log-changed";
export const PLANNER_AUDIT_MAX_PER_PLAN = 200;

export type PlannerAuditAction =
  | "draft_saved"
  | "published"
  | "publish_failed"
  | "cancelled"
  | "batch_approved"
  | "batch_rejected"
  | "native_confirmed"
  | "crew_broadcast"
  | "plan_completed"
  | "edit_unfilled_slot"
  | "rtw_flagged";

export type PlannerAuditEntry = {
  id: string;
  planId: string;
  at: number;
  actor: "employer" | "system";
  /** Legal entity Mitra Labs ID when known. */
  actorMlId?: string;
  /** Telemetry only — never reputation subject. */
  siteManagerId?: string;
  action: PlannerAuditAction;
  summary: string;
  meta?: Record<string, string | number | boolean>;
};

export type AppendPlannerAuditInput = {
  planId: string;
  actor?: "employer" | "system";
  actorMlId?: string;
  siteManagerId?: string;
  action: PlannerAuditAction;
  summary: string;
  meta?: Record<string, string | number | boolean>;
  at?: number;
};

const ACTIONS = new Set<PlannerAuditAction>([
  "draft_saved",
  "published",
  "publish_failed",
  "cancelled",
  "batch_approved",
  "batch_rejected",
  "native_confirmed",
  "crew_broadcast",
  "plan_completed",
  "edit_unfilled_slot",
  "rtw_flagged",
]);

function makeId(): string {
  return `pau_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function isAction(value: unknown): value is PlannerAuditAction {
  return typeof value === "string" && ACTIONS.has(value as PlannerAuditAction);
}

function normalizeMeta(value: unknown): Record<string, string | number | boolean> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function normalizeEntry(raw: unknown): PlannerAuditEntry | null {
  if (typeof raw !== "object" || raw === null) return null;
  const rec = raw as Record<string, unknown>;
  const planId = typeof rec.planId === "string" ? rec.planId.trim() : "";
  const summary = typeof rec.summary === "string" ? rec.summary.trim() : "";
  const at = typeof rec.at === "number" && Number.isFinite(rec.at) ? rec.at : 0;
  if (!planId || !summary || !at || !isAction(rec.action)) return null;
  const actor = rec.actor === "system" ? "system" : "employer";
  return {
    id: typeof rec.id === "string" && rec.id.trim() ? rec.id.trim() : makeId(),
    planId,
    at,
    actor,
    actorMlId:
      typeof rec.actorMlId === "string" && rec.actorMlId.trim() ? rec.actorMlId.trim() : undefined,
    siteManagerId:
      typeof rec.siteManagerId === "string" && rec.siteManagerId.trim()
        ? rec.siteManagerId.trim()
        : undefined,
    action: rec.action,
    summary,
    meta: normalizeMeta(rec.meta),
  };
}

function readAll(): PlannerAuditEntry[] {
  const raw = plannerReadJson<unknown>(PLANNER_AUDIT_LOG_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeEntry).filter((e): e is PlannerAuditEntry => e !== null);
}

function writeAll(entries: PlannerAuditEntry[]): void {
  if (plannerWriteJson(PLANNER_AUDIT_LOG_KEY, entries)) {
    plannerDispatchChanged(PLANNER_AUDIT_LOG_CHANGED);
  }
}

/** Newest-first list for one plan, already FIFO-capped. */
function trimPlanFifo(entries: PlannerAuditEntry[], planId: string): PlannerAuditEntry[] {
  const forPlan = entries
    .filter((e) => e.planId === planId)
    .sort((a, b) => b.at - a.at || b.id.localeCompare(a.id));
  const kept = forPlan.slice(0, PLANNER_AUDIT_MAX_PER_PLAN);
  const others = entries.filter((e) => e.planId !== planId);
  return [...kept, ...others];
}

export function getPlannerAuditLog(): PlannerAuditEntry[] {
  return readAll().sort((a, b) => b.at - a.at || b.id.localeCompare(a.id));
}

export function getPlannerAuditLogForPlan(planId: string): PlannerAuditEntry[] {
  const id = planId.trim();
  if (!id) return [];
  return readAll()
    .filter((e) => e.planId === id)
    .sort((a, b) => b.at - a.at || b.id.localeCompare(a.id));
}

export function appendPlannerAudit(input: AppendPlannerAuditInput): PlannerAuditEntry | null {
  const planId = input.planId.trim();
  const summary = input.summary.trim();
  if (!planId || !summary || !isAction(input.action)) return null;

  const entry: PlannerAuditEntry = {
    id: makeId(),
    planId,
    at: input.at ?? Date.now(),
    actor: input.actor ?? "employer",
    actorMlId: input.actorMlId?.trim() || undefined,
    siteManagerId: input.siteManagerId?.trim() || undefined,
    action: input.action,
    summary,
    meta: input.meta,
  };

  const next = trimPlanFifo([entry, ...readAll()], planId);
  writeAll(next);
  return entry;
}

export function clearPlannerAuditForPlan(planId: string): void {
  const id = planId.trim();
  if (!id) return;
  writeAll(readAll().filter((e) => e.planId !== id));
}

export function subscribePlannerAuditLog(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(PLANNER_AUDIT_LOG_CHANGED, handler);
  return () => window.removeEventListener(PLANNER_AUDIT_LOG_CHANGED, handler);
}
