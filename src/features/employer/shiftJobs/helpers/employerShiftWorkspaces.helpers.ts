// App name: Job Mitra
// File name: employerShiftWorkspaces.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\helpers\employerShiftWorkspaces.helpers.ts

import type {
  EmployerWorkspaceCounts,
  EmployerWorkspaceFilter,
  EmployerWorkspaceLite,
  EmployerWorkspaceStatus,
} from "../types/employerShiftWorkspaces.types";

type UnknownRecord = Record<string, unknown>;

export const EMPLOYER_WORKSPACE_KEY = "wm_employee_shift_workspaces_v1";
export const EMPLOYER_WORKSPACE_CHANGED = "wm:employee-shift-workspaces-changed";

export const EMPLOYER_WORKSPACE_FILTERS: EmployerWorkspaceFilter[] = [
  "all",
  "active",
  "upcoming",
  "completed",
  "left",
  "replaced",
];

export function parseEmployerWorkspaces(raw: string | null): EmployerWorkspaceLite[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(toWorkspaceLite)
      .filter((workspace): workspace is EmployerWorkspaceLite => Boolean(workspace))
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  } catch {
    return [];
  }
}

export function createWorkspaceCounts(
  workspaces: EmployerWorkspaceLite[],
): EmployerWorkspaceCounts {
  const counts: EmployerWorkspaceCounts = {
    all: workspaces.length,
    active: 0,
    upcoming: 0,
    completed: 0,
    left: 0,
    replaced: 0,
  };

  for (const workspace of workspaces) {
    counts[workspace.status] += 1;
  }

  return counts;
}

export function filterEmployerWorkspaces({
  workspaces,
  filter,
  query,
}: {
  workspaces: EmployerWorkspaceLite[];
  filter: EmployerWorkspaceFilter;
  query: string;
}): EmployerWorkspaceLite[] {
  const cleanQuery = query.trim().toLowerCase();

  return workspaces.filter((workspace) => {
    if (filter !== "all" && workspace.status !== filter) return false;

    if (!cleanQuery) return true;

    const haystack =
      `${workspace.companyName} ${workspace.jobName} ${workspace.locationName}`.toLowerCase();
    return haystack.includes(cleanQuery);
  });
}

export function formatWorkspaceDateRange(startAt: number, endAt: number): string {
  try {
    const start = new Date(startAt);
    const end = new Date(endAt);

    const startText = start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    const endText = end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    return start.toDateString() === end.toDateString() ? startText : `${startText} - ${endText}`;
  } catch {
    return "Date not set";
  }
}

export function formatWorkspaceLastActivity(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

export function getWorkspaceStatusLabel(status: EmployerWorkspaceStatus): string {
  if (status === "active") return "Active";
  if (status === "upcoming") return "Upcoming";
  if (status === "completed") return "Completed";
  if (status === "left") return "Left";
  return "Replaced";
}

function toWorkspaceLite(value: unknown): EmployerWorkspaceLite | null {
  if (!isRecord(value)) return null;

  const id = readString(value, "id");
  const postId = readString(value, "postId");
  const companyName = readString(value, "companyName");
  const jobName = readString(value, "jobName");
  const locationName = readString(value, "locationName");
  const startAt = readNumber(value, "startAt");
  const endAt = readNumber(value, "endAt");
  const lastActivityAt = readNumber(value, "lastActivityAt");

  if (!id || !postId || !companyName || !jobName || !locationName) return null;
  if (startAt === undefined || endAt === undefined || lastActivityAt === undefined) return null;

  return {
    id,
    postId,
    companyName,
    jobName,
    locationName,
    startAt,
    endAt,
    status: normalizeWorkspaceStatus(value.status),
    lastActivityAt,
    workerMlId: readString(value, "workerMlId"),
    workerName: readString(value, "workerName"),
  };
}

function normalizeWorkspaceStatus(value: unknown): EmployerWorkspaceStatus {
  if (value === "active") return "active";
  if (value === "upcoming") return "upcoming";
  if (value === "completed") return "completed";
  if (value === "left") return "left";
  if (value === "replaced") return "replaced";

  return "active";
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readString(record: UnknownRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function readNumber(record: UnknownRecord, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
