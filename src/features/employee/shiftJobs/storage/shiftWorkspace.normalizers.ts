// App name: Job Mitra
// File name: shiftWorkspace.normalizers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftWorkspace.normalizers.ts

import type {
  ShiftWorkspace,
  ShiftWorkspaceCategory,
  ShiftWorkspaceStatus,
  ShiftWorkspaceUpdate,
} from "../types/shiftWorkspace.types";
import { getNumber, getString, isRecord } from "./shiftWorkspace.utils";

export function normalizeShiftWorkspaces(list: unknown[]): ShiftWorkspace[] {
  const out: ShiftWorkspace[] = [];

  for (const raw of list) {
    if (!isRecord(raw)) continue;

    const id = getString(raw, "id");
    const postId = getString(raw, "postId");
    const companyName = getString(raw, "companyName");
    const jobName = getString(raw, "jobName");
    const locationName = getString(raw, "locationName");
    const startAt = getNumber(raw, "startAt");
    const endAt = getNumber(raw, "endAt");

    if (!id || !postId || !companyName || !jobName || !locationName) continue;
    if (startAt === undefined || endAt === undefined) continue;

    const updates = normalizeUpdates(raw["updates"]);
    const unreadCountRaw = getNumber(raw, "unreadCount");
    const lastActivityAtRaw = getNumber(raw, "lastActivityAt");

    out.push({
      id,
      postId,
      appId: getString(raw, "appId"),
      // Dual-read: prefer workerMlId; accept legacy workerWmId from older localStorage JSON.
      workerMlId: getString(raw, "workerMlId") ?? getString(raw, "workerWmId"),
      workerName: getString(raw, "workerName"),
      companyName,
      jobName,
      category: clampCategory(raw["category"]),
      locationName,
      locationAddress: getString(raw, "locationAddress"),
      mapsLink: getString(raw, "mapsLink"),
      startAt,
      endAt,
      status: clampStatus(raw["status"]),
      lastActivityAt: deriveLastActivityAt(startAt, updates, lastActivityAtRaw),
      unreadCount: unreadCountRaw !== undefined ? Math.max(0, Math.floor(unreadCountRaw)) : 0,
      updates,
      exitedAt: getNumber(raw, "exitedAt"),
      exitReason: clampExitReason(raw["exitReason"]),
      exitNote: typeof raw["exitNote"] === "string" ? raw["exitNote"] : undefined,
      replacedAt: getNumber(raw, "replacedAt"),
      replacedReason: clampReplacedReason(raw["replacedReason"]),
      rating: clampRating(raw["rating"]),
      ratingComment: typeof raw["ratingComment"] === "string" ? raw["ratingComment"] : undefined,
      ratedAt: getNumber(raw, "ratedAt"),
      employerRating: getNumber(raw, "employerRating"),
      employerRatingComment:
        typeof raw["employerRatingComment"] === "string" ? raw["employerRatingComment"] : undefined,
      employerRatedAt: getNumber(raw, "employerRatedAt"),
    });
  }

  return out;
}

export function clampCategory(value: unknown): ShiftWorkspaceCategory {
  if (
    value === "construction" ||
    value === "kitchen" ||
    value === "office" ||
    value === "delivery"
  ) {
    return value;
  }

  return "other";
}

export function isReadOnlyWorkspaceStatus(status: ShiftWorkspaceStatus): boolean {
  return (
    status === "left" || status === "replaced" || status === "completed" || status === "cancelled"
  );
}

function clampStatus(value: unknown): ShiftWorkspaceStatus {
  if (
    value === "active" ||
    value === "upcoming" ||
    value === "completed" ||
    value === "left" ||
    value === "replaced" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "active";
}

function normalizeUpdates(updatesRaw: unknown): ShiftWorkspaceUpdate[] {
  if (!Array.isArray(updatesRaw)) return [];

  const out: ShiftWorkspaceUpdate[] = [];

  for (const updateRaw of updatesRaw) {
    if (!isRecord(updateRaw)) continue;

    const id = getString(updateRaw, "id");
    const createdAt = getNumber(updateRaw, "createdAt");
    const title = getString(updateRaw, "title");

    if (!id || createdAt === undefined || !title) continue;

    const body = typeof updateRaw["body"] === "string" ? updateRaw["body"] : undefined;

    out.push({
      id,
      createdAt,
      kind: clampUpdateKind(updateRaw["kind"]),
      title,
      body,
    });
  }

  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}

function clampUpdateKind(value: unknown): ShiftWorkspaceUpdate["kind"] {
  if (value === "broadcast" || value === "direct" || value === "system") return value;
  return "system";
}

function clampExitReason(value: unknown): ShiftWorkspace["exitReason"] | undefined {
  if (value === "emergency" || value === "sick" || value === "travel" || value === "other") {
    return value;
  }

  return undefined;
}

function clampReplacedReason(value: unknown): ShiftWorkspace["replacedReason"] | undefined {
  if (
    value === "no_show" ||
    value === "schedule_change" ||
    value === "quality_issue" ||
    value === "other"
  ) {
    return value;
  }

  return undefined;
}

function clampRating(value: unknown): ShiftWorkspace["rating"] | undefined {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) {
    return value;
  }

  return undefined;
}

function deriveLastActivityAt(
  startAt: number,
  updates: ShiftWorkspaceUpdate[],
  rawLast?: number,
): number {
  if (typeof rawLast === "number" && Number.isFinite(rawLast)) return rawLast;

  const newestUpdate = updates.length > 0 ? updates[0].createdAt : undefined;
  if (typeof newestUpdate === "number" && Number.isFinite(newestUpdate)) {
    return newestUpdate;
  }

  return startAt;
}
