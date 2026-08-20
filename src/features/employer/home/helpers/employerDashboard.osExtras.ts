/** Ribbon extras from live workspaces, HR logs, and vault expiry. */

import { listExpiringComplianceDocuments } from "../../compliance/helpers/employerComplianceExpiry";
import type { ComplianceDocument } from "../../compliance/storage/employerCompliance.types";
import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.types";

export type OsRibbonExtras = {
  readonly workspaceClockedIn: number;
  readonly gatePending: number;
  readonly gateFlags: number;
  readonly vaultExpiring: number;
};

const CLOCKED_STATUSES = new Set(["present", "clocked_in", "in", "checked_in", "active"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function localDateKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function countHrClockedInToday(logs: readonly unknown[], now = new Date()): number {
  const today = localDateKey(now);
  let n = 0;
  for (const row of logs) {
    if (!isRecord(row)) continue;
    const status = typeof row.status === "string" ? row.status.trim().toLowerCase() : "";
    if (!CLOCKED_STATUSES.has(status)) continue;
    const workDate =
      typeof row.work_date === "string"
        ? row.work_date.slice(0, 10)
        : row.work_date instanceof Date
          ? localDateKey(row.work_date)
          : "";
    if (workDate === today) n += 1;
  }
  return n;
}

export function computeOsRibbonExtras(input: {
  readonly workspaces: readonly { readonly status: string }[];
  readonly apps: readonly EmployeeShiftApplication[];
  readonly documents: readonly ComplianceDocument[];
  readonly hrClockedIn?: number;
}): OsRibbonExtras {
  const clockedRooms = input.workspaces.filter((item) => item.status === "active").length;
  const pending = input.workspaces.filter((item) => item.status === "upcoming").length;
  const flags =
    input.workspaces.filter((item) => item.status === "left" || item.status === "replaced").length +
    input.apps.filter((app) => app.replacedReason === "no_show").length;
  const vault = listExpiringComplianceDocuments(input.documents).length;
  return {
    workspaceClockedIn: Math.max(clockedRooms, input.hrClockedIn ?? 0),
    gatePending: pending,
    gateFlags: flags,
    vaultExpiring: vault,
  };
}
