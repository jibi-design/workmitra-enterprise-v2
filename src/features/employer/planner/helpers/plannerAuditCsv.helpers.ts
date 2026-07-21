/**
 * Job Mitra | plannerAuditCsv.helpers.ts
 * Hybrid A2 Phase-2 P2.1 — agency CSV export for plan-scoped audit.
 */

import type { PlannerAuditEntry } from "../storage/plannerAuditLog.storage";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function metaToString(meta: PlannerAuditEntry["meta"]): string {
  if (!meta) return "";
  try {
    return JSON.stringify(meta);
  } catch {
    return "";
  }
}

export function buildPlannerAuditCsv(entries: PlannerAuditEntry[]): string {
  const header = [
    "id",
    "planId",
    "at_iso",
    "at_ms",
    "actor",
    "actorMlId",
    "siteManagerId",
    "action",
    "summary",
    "meta_json",
  ].join(",");

  const rows = entries.map((e) =>
    [
      csvEscape(e.id),
      csvEscape(e.planId),
      csvEscape(new Date(e.at).toISOString()),
      String(e.at),
      csvEscape(e.actor),
      csvEscape(e.actorMlId ?? ""),
      csvEscape(e.siteManagerId ?? ""),
      csvEscape(e.action),
      csvEscape(e.summary),
      csvEscape(metaToString(e.meta)),
    ].join(","),
  );

  return [header, ...rows].join("\n");
}

export function plannerAuditCsvFilename(planId: string, now = Date.now()): string {
  const safe = planId.trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "plan";
  const day = new Date(now).toISOString().slice(0, 10);
  return `planner-audit_${safe}_${day}.csv`;
}

/** Browser download helper (no-op when document unavailable). */
export function downloadPlannerAuditCsv(planId: string, entries: PlannerAuditEntry[]): void {
  if (typeof document === "undefined") return;
  const csv = buildPlannerAuditCsv(entries);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = plannerAuditCsvFilename(planId);
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
