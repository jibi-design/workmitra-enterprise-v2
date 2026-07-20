// App name: Job Mitra
// Employee direct-invite helpers — pending list, VIP badge, date labels.

import {
  shiftDirectInviteStorage,
  type ShiftDirectInvite,
} from "../../../employer/shiftJobs/storage/shiftDirectInvite.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import type { ShiftPostData } from "../../shiftJobs/types/shiftApplicationTypes";

const POSTS_KEY = "wm_employer_shift_posts_v1";
const INVITES_KEY = "wm_shift_direct_invites_v1";
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

function buildPendingInvites(workerWmId: string): EmployeePendingDirectInvite[] {
  const key = workerWmId.trim().toUpperCase();
  if (!key) return EMPTY_PENDING;

  return shiftDirectInviteStorage
    .getAll()
    .filter((invite) => invite.workerWmId === key && invite.status === "pending")
    .map((invite) => ({
      ...invite,
      shiftDateLabel: formatShiftInviteDate(readPostStartAt(invite.postId)),
    }));
}

/** Stable-reference snapshot for useSyncExternalStore (prevents infinite re-render loops). */
export function getEmployeePendingDirectInvitesSnapshot(): EmployeePendingDirectInvite[] {
  const wmId = employeeProfileStorage.get().uniqueId?.trim().toUpperCase() ?? "";
  const invitesRaw = localStorage.getItem(INVITES_KEY) ?? "";
  const postsRaw = localStorage.getItem(POSTS_KEY) ?? "";
  const cacheKey = `${wmId}|${invitesRaw}|${postsRaw}`;

  if (cacheKey === pendingInvitesCacheKey) {
    return pendingInvitesCacheList;
  }

  pendingInvitesCacheKey = cacheKey;
  pendingInvitesCacheList = wmId ? buildPendingInvites(wmId) : EMPTY_PENDING;
  return pendingInvitesCacheList;
}

export function getEmployeePendingDirectInvites(workerWmId: string): EmployeePendingDirectInvite[] {
  return buildPendingInvites(workerWmId);
}

export function countEmployeePendingDirectInvites(workerWmId: string): number {
  return getEmployeePendingDirectInvites(workerWmId).length;
}

export function isDirectInviteAcceptedApplication(appId: string): boolean {
  return shiftDirectInviteStorage
    .getAll()
    .some((invite) => invite.appId === appId && invite.status === "accepted");
}

export function getDirectInviteDateLabelForPost(post?: ShiftPostData): string {
  if (!post) return "an upcoming date";
  return formatShiftInviteDate(post.startAt);
}
