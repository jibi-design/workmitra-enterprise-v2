// App name: Job Mitra
// File name: shiftPostApply.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftPostApply.storage.ts

import { APPS_KEY } from "../helpers/shiftApplyHelpers";
import type {
  ShiftApplicationRecord,
  ShiftApplicationStatus,
  WorkspaceRecord,
} from "../types/shiftPostApply.types";
import { upsertAppIntoEmployerScope } from "../../../shared/shift/shiftTenantProjection";

export const WORKSPACES_KEY = "wm_employee_shift_workspaces_v1";
export const APPS_CHANGED_EVENT = "wm:employee-shift-applications-changed";

export function safeParseAllShiftApplications(raw: string | null): ShiftApplicationRecord[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is ShiftApplicationRecord => {
      if (!item || typeof item !== "object") return false;

      const app = item as ShiftApplicationRecord;

      return (
        typeof app.id === "string" &&
        typeof app.postId === "string" &&
        typeof app.createdAt === "number" &&
        isApplicationStatus(app.status)
      );
    });
  } catch {
    return [];
  }
}

export type ShiftApplicationWriteResult =
  { readonly ok: true } | { readonly ok: false; readonly reason: "storage_error" | "conflict" };

export function safeWriteAllShiftApplications(
  list: ShiftApplicationRecord[],
): ShiftApplicationWriteResult {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(list));
    for (const app of list) {
      upsertAppIntoEmployerScope(app as unknown as Record<string, unknown>);
    }
    window.dispatchEvent(new Event(APPS_CHANGED_EVENT));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

export function safeParseShiftWorkspaces(raw: string | null): WorkspaceRecord[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is WorkspaceRecord => {
      if (!item || typeof item !== "object") return false;

      const rec = item as WorkspaceRecord;

      return (
        typeof rec.id === "string" &&
        typeof rec.postId === "string" &&
        (rec.status === "active" ||
          rec.status === "upcoming" ||
          rec.status === "completed" ||
          rec.status === "left" ||
          rec.status === "replaced")
      );
    });
  } catch {
    return [];
  }
}

export function getEffectiveApplication(
  apps: ShiftApplicationRecord[],
): ShiftApplicationRecord | null {
  if (apps.length === 0) return null;

  const sorted = [...apps].sort((a, b) => {
    const rankDiff = getApplicationRank(b.status) - getApplicationRank(a.status);
    if (rankDiff !== 0) return rankDiff;
    return b.createdAt - a.createdAt;
  });

  return sorted[0] ?? null;
}

function isApplicationStatus(status: unknown): status is ShiftApplicationStatus {
  return (
    status === "applied" ||
    status === "shortlisted" ||
    status === "waiting" ||
    status === "confirmed" ||
    status === "rejected" ||
    status === "withdrawn" ||
    status === "replaced" ||
    status === "exited"
  );
}

function getApplicationRank(status: ShiftApplicationStatus): number {
  if (status === "confirmed") return 80;
  if (status === "shortlisted") return 70;
  if (status === "waiting") return 60;
  if (status === "applied") return 50;
  if (status === "withdrawn") return 40;
  if (status === "rejected") return 30;
  if (status === "replaced") return 20;
  return 10;
}
