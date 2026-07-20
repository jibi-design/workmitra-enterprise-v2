// App name: Job Mitra
// File name: employerShift.activityStorage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.activityStorage.ts

import { EMPLOYER_SHIFT_ACTIVITY_KEY } from "./employerShift.keys";
import type { EmployerShiftActivityEntry, EmployerShiftActivityKind } from "./employerShift.types";
import {
  createLocalId,
  getNumber,
  getString,
  isRecord,
  notifyEmployerShiftActivityChanged,
  safeParse,
  safeWrite,
} from "./employerShift.utils";

export function normalizeActivity(raw: unknown): EmployerShiftActivityEntry | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");
  const postId = getString(raw, "postId");
  const kind = getString(raw, "kind");
  const createdAt = getNumber(raw, "createdAt");
  const title = getString(raw, "title");

  if (!id || !postId || !kind || createdAt === undefined || !title) {
    return null;
  }

  if (!isEmployerShiftActivityKind(kind)) {
    return null;
  }

  return {
    id,
    postId,
    kind,
    createdAt,
    title,
    body: getString(raw, "body"),
    route: getString(raw, "route"),
  };
}

export function readEmployerActivityAll(): EmployerShiftActivityEntry[] {
  const raw = localStorage.getItem(EMPLOYER_SHIFT_ACTIVITY_KEY);

  return safeParse<unknown>(raw)
    .map(normalizeActivity)
    .filter((entry): entry is EmployerShiftActivityEntry => entry !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function writeEmployerActivityAll(list: EmployerShiftActivityEntry[]): void {
  safeWrite(EMPLOYER_SHIFT_ACTIVITY_KEY, list);
  notifyEmployerShiftActivityChanged();
}

export function pushEmployerActivity(
  entry: Omit<EmployerShiftActivityEntry, "id" | "createdAt"> & {
    createdAt?: number;
  },
): void {
  const createdAt = typeof entry.createdAt === "number" ? entry.createdAt : Date.now();

  const item: EmployerShiftActivityEntry = {
    id: createLocalId("al"),
    postId: entry.postId,
    kind: entry.kind,
    createdAt,
    title: entry.title,
    body: entry.body,
    route: entry.route,
  };

  const existing = readEmployerActivityAll();
  writeEmployerActivityAll([item, ...existing].slice(0, 300));
}

function isEmployerShiftActivityKind(value: string): value is EmployerShiftActivityKind {
  return (
    value === "post_created" ||
    value === "analysis_run" ||
    value === "analysis_reset" ||
    value === "hidden" ||
    value === "unhidden" ||
    value === "move_shortlist" ||
    value === "move_waiting" ||
    value === "candidate_rejected" ||
    value === "confirmed" ||
    value === "replaced"
  );
}
