import type {
  ShiftApplicationData,
  ShiftPostData,
} from "../../shiftJobs/types/shiftApplicationTypes";
import type {
  CancelConfirmedAssignmentResult,
  ConfirmShiftAttendanceResult,
  WithdrawShiftApplicationResult,
} from "./shiftApplications.storage.types";
import {
  APPS_CHANGED,
  APPS_KEY,
  POSTS_KEY,
  isRec,
  num,
  parseApps,
  parsePosts,
  safeArr,
  str,
} from "./shiftApplications.storage.parse";
import { notifyCrossRole } from "../../../pulse/pulseEventBridge";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { readShiftWorkspaces, writeShiftWorkspaces } from "./shiftWorkspace.persistence";
import { stripConfirmedIdAcrossPostStores } from "./shiftApplications.storage.confirmedIds";

function isWithdrawableStatus(status: unknown): status is "applied" | "shortlisted" | "waiting" {
  return status === "applied" || status === "shortlisted" || status === "waiting";
}

function newUpdateId(): string {
  return `wu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function withdrawApplication(applicationId: string): WithdrawShiftApplicationResult {
  const rawItems = safeArr(localStorage.getItem(APPS_KEY));

  let found = false;
  let changed = false;
  const withdrawnAt = Date.now();

  const nextItems = rawItems.map((item) => {
    if (!isRec(item)) return item;

    if (str(item, "id") !== applicationId) return item;

    found = true;
    if (!isWithdrawableStatus(item.status)) return item;

    changed = true;
    return { ...item, status: "withdrawn", withdrawnAt };
  });

  if (!found) return { ok: false, reason: "not_found" };
  if (!changed) return { ok: false, reason: "not_withdrawable" };

  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event(APPS_CHANGED));
    void import("../../../shift/services/shiftGateApi.service").then(
      ({ isShiftApiSyncEnabled, shiftGateApi }) => {
        if (!isShiftApiSyncEnabled()) return;
        return import("../../../shift/utils/shiftIdBridge").then(({ shiftAppIdBridge }) => {
          const serverId = shiftAppIdBridge.resolveServerId(applicationId);
          if (!serverId) return;
          return shiftGateApi.withdrawApplication(serverId).catch(() => undefined);
        });
      },
    );
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

/** Worker cancels after employer confirmation — frees slot + alerts employer. */
export function cancelConfirmedAssignment(applicationId: string): CancelConfirmedAssignmentResult {
  const rawItems = safeArr(localStorage.getItem(APPS_KEY));
  const withdrawnAt = Date.now();

  let found = false;
  let changed = false;
  let postId = "";

  const nextItems = rawItems.map((item) => {
    if (!isRec(item)) return item;
    if (str(item, "id") !== applicationId) return item;

    found = true;
    if (item.status !== "confirmed") return item;

    changed = true;
    postId = str(item, "postId") ?? "";
    return {
      ...item,
      status: "withdrawn",
      withdrawnAt,
      statusChangedAt: withdrawnAt,
      attendanceConfirmedAt: undefined,
    };
  });

  if (!found) return { ok: false, reason: "not_found" };
  if (!changed) return { ok: false, reason: "not_confirmed" };

  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event(APPS_CHANGED));
  } catch {
    return { ok: false, reason: "storage_error" };
  }

  if (postId) {
    stripConfirmedIdAcrossPostStores(postId, applicationId);

    try {
      const workspaces = readShiftWorkspaces();
      const nextWorkspaces = workspaces.map((workspace) => {
        if (workspace.postId !== postId) return workspace;
        if (workspace.appId !== applicationId) return workspace;
        if (
          workspace.status === "completed" ||
          workspace.status === "left" ||
          workspace.status === "replaced" ||
          workspace.status === "cancelled"
        ) {
          return workspace;
        }

        return {
          ...workspace,
          status: "left" as const,
          exitedAt: withdrawnAt,
          exitReason: "other" as const,
          exitNote: "Worker cancelled confirmation",
          lastActivityAt: withdrawnAt,
          unreadCount: 0,
          updates: [
            {
              id: newUpdateId(),
              createdAt: withdrawnAt,
              kind: "system" as const,
              title: "Worker cancelled",
              body: "The worker cancelled their confirmed assignment. Find a replacement if needed.",
            },
            ...workspace.updates,
          ].slice(0, 50),
        };
      });
      writeShiftWorkspaces(nextWorkspaces);
    } catch {
      /* advisory */
    }

    try {
      notifyCrossRole({
        type: "SHIFT_WORKER_CANCELLED",
        domain: "shift",
        affectedUserRole: "employer",
        postId,
        appId: applicationId,
        severity: "urgent",
        title: "Confirmed worker cancelled",
        body: "A confirmed worker has cancelled their shift. Find a replacement immediately.",
        route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
      });
    } catch {
      /* never block cancel save */
    }
  }

  return { ok: true };
}

export function confirmAttendance(applicationId: string): ConfirmShiftAttendanceResult {
  const rawItems = safeArr(localStorage.getItem(APPS_KEY));

  let found = false;
  let changed = false;
  let alreadyConfirmed = false;
  let notifiedPostId = "";
  const attendanceConfirmedAt = Date.now();

  const nextItems = rawItems.map((item) => {
    if (!isRec(item)) return item;

    if (str(item, "id") !== applicationId) return item;

    found = true;
    if (item.status !== "confirmed") return item;

    if (num(item, "attendanceConfirmedAt") !== undefined) {
      alreadyConfirmed = true;
      return item;
    }

    changed = true;
    notifiedPostId = str(item, "postId") ?? "";
    return { ...item, attendanceConfirmedAt, statusChangedAt: attendanceConfirmedAt };
  });

  if (!found) return { ok: false, reason: "not_found" };
  if (alreadyConfirmed && !changed) return { ok: false, reason: "already_confirmed" };
  if (!changed) return { ok: false, reason: "not_confirmed" };

  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event(APPS_CHANGED));
  } catch {
    return { ok: false, reason: "storage_error" };
  }

  if (notifiedPostId) {
    try {
      notifyCrossRole({
        type: "SHIFT_WORKER_CONFIRMED",
        domain: "shift",
        affectedUserRole: "employer",
        postId: notifiedPostId,
        appId: applicationId,
        severity: "success",
        title: "They're planning to attend",
        body: "A confirmed worker said they'll be there. This isn't a clock-in.",
        route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", notifiedPostId),
      });
    } catch {
      /* never block intent save */
    }
  }

  return { ok: true };
}

let pRaw: string | null = "__init__";
let pList: ShiftPostData[] = [];
let aRaw: string | null = "__init__";
let aList: ShiftApplicationData[] = [];

export function getPosts(): ShiftPostData[] {
  const raw = localStorage.getItem(POSTS_KEY);

  if (raw !== pRaw) {
    pRaw = raw;
    pList = parsePosts(raw);
  }

  return pList;
}

export function getApps(): ShiftApplicationData[] {
  const raw = localStorage.getItem(APPS_KEY);

  if (raw !== aRaw) {
    aRaw = raw;
    aList = parseApps(raw);
  }

  return aList;
}

export function subscribe(cb: () => void): () => void {
  const handler = () => cb();

  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);
  window.addEventListener(APPS_CHANGED, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);
    window.removeEventListener(APPS_CHANGED, handler);
  };
}

export { APPS_CHANGED, APPS_KEY, POSTS_KEY };
