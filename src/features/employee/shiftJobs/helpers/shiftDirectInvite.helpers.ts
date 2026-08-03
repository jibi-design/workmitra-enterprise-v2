// App name: Job Mitra
// Employee direct-invite helpers — pending list, VIP badge, date labels.

import {
  shiftDirectInviteStorage,
  type ShiftDirectInvite,
} from "../../../shared/shift/shiftEmployerPublic";
import { actorMatchKeys } from "../../../../app/identity/identity.adapter";
import type { ShiftPostData } from "../../shiftJobs/types/shiftApplicationTypes";
import { EMPLOYEE_SEARCH_POSTS_KEY } from "../../../shared/shift/shiftTenantProjection";
import { WORKER_INVITES_PROJECTION_KEY } from "../../../shared/shift/shiftTenantProjection";

const POSTS_KEY = EMPLOYEE_SEARCH_POSTS_KEY;
const INVITES_KEY = WORKER_INVITES_PROJECTION_KEY;
const EMPTY_PENDING: EmployeePendingDirectInvite[] = [];

export { EMPTY_PENDING as EMPTY_PENDING_DIRECT_INVITES };

export type EmployeePendingDirectInvite = ShiftDirectInvite & {
  shiftDateLabel: string;
};

let pendingInvitesCacheKey = "";
let pendingInvitesCacheList: EmployeePendingDirectInvite[] = EMPTY_PENDING;

function readPostStartAt(postId: string): number | null {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const record = item as Record<string, unknown>;
      if (record.id !== postId) continue;
      const startAt = record.startAt;
      return typeof startAt === "number" && Number.isFinite(startAt) ? startAt : null;
    }
  } catch {
    /* safe */
  }

  return null;
}

export function formatShiftInviteDate(startAt: number | null): string {
  if (startAt === null) return "an upcoming date";
  return new Date(startAt).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function buildPendingInvitesForKeys(matchKeys: string[]): EmployeePendingDirectInvite[] {
  if (matchKeys.length === 0) return EMPTY_PENDING;
  const keySet = new Set(matchKeys.map((k) => k.trim().toUpperCase()).filter(Boolean));

  return shiftDirectInviteStorage
    .getAllForWorker()
    .filter(
      (invite) => keySet.has(invite.workerMlId.trim().toUpperCase()) && invite.status === "pending",
    )
    .map((invite) => ({
      ...invite,
      shiftDateLabel: formatShiftInviteDate(readPostStartAt(invite.postId)),
    }));
}

function buildPendingInvites(workerMlId: string): EmployeePendingDirectInvite[] {
  return buildPendingInvitesForKeys([workerMlId]);
}

/** Stable-reference snapshot for useSyncExternalStore (prevents infinite re-render loops). */
export function getEmployeePendingDirectInvitesSnapshot(): EmployeePendingDirectInvite[] {
  const matchKeys = actorMatchKeys("employee");
  const invitesRaw = localStorage.getItem(INVITES_KEY) ?? "";
  const postsRaw = localStorage.getItem(POSTS_KEY) ?? "";
  const identityKey = matchKeys.join(",");
  const cacheKey = `${identityKey}|${invitesRaw}|${postsRaw}`;

  if (cacheKey === pendingInvitesCacheKey) {
    return pendingInvitesCacheList;
  }

  pendingInvitesCacheKey = cacheKey;
  pendingInvitesCacheList =
    matchKeys.length > 0 ? buildPendingInvitesForKeys(matchKeys) : EMPTY_PENDING;
  return pendingInvitesCacheList;
}

export function getEmployeePendingDirectInvites(workerMlId: string): EmployeePendingDirectInvite[] {
  return buildPendingInvites(workerMlId);
}

export function countEmployeePendingDirectInvites(workerMlId: string): number {
  return getEmployeePendingDirectInvites(workerMlId).length;
}

export function isDirectInviteAcceptedApplication(appId: string): boolean {
  return shiftDirectInviteStorage
    .getAllForWorker()
    .some((invite) => invite.appId === appId && invite.status === "accepted");
}

export function getDirectInviteDateLabelForPost(post?: ShiftPostData): string {
  if (!post) return "an upcoming date";
  return formatShiftInviteDate(post.startAt);
}
