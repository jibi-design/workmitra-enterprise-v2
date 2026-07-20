// App name: Job Mitra
// File name: shiftWorkspace.applicationSync.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftWorkspace.applicationSync.ts

import { SHIFT_APPLICATIONS_CHANGED_EVENT, SHIFT_APPLICATIONS_KEY } from "./shiftWorkspace.keys";
import {
  getString,
  isRecord,
  safeDispatch,
  safeParseArray,
  safeSetJson,
} from "./shiftWorkspace.utils";

type AppStatus =
  | "applied"
  | "shortlisted"
  | "waiting"
  | "confirmed"
  | "rejected"
  | "withdrawn"
  | "replaced"
  | "exited";

export function notifyApplicationsChanged(): void {
  safeDispatch(SHIFT_APPLICATIONS_CHANGED_EVENT);
}

export function markApplicationsExitedForPost(postId: string): void {
  const raw = safeParseArray<unknown>(localStorage.getItem(SHIFT_APPLICATIONS_KEY));
  if (raw.length === 0) return;

  let changed = false;

  const next = raw.map((item) => {
    if (!isRecord(item)) return item;

    const itemPostId = getString(item, "postId");
    const status = clampAppStatus(item["status"]);

    if (!itemPostId || !status) return item;
    if (itemPostId !== postId) return item;
    if (isTerminalApplicationStatus(status)) return item;

    changed = true;
    return { ...item, status: "exited" as const };
  });

  if (!changed) return;

  safeSetJson(SHIFT_APPLICATIONS_KEY, next);
  notifyApplicationsChanged();
}

function clampAppStatus(value: unknown): AppStatus | null {
  if (
    value === "applied" ||
    value === "shortlisted" ||
    value === "waiting" ||
    value === "confirmed" ||
    value === "rejected" ||
    value === "withdrawn" ||
    value === "replaced" ||
    value === "exited"
  ) {
    return value;
  }

  return null;
}

function isTerminalApplicationStatus(status: AppStatus): boolean {
  return (
    status === "rejected" || status === "withdrawn" || status === "replaced" || status === "exited"
  );
}
