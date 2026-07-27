/** Job Mitra | shiftOpsCommsGate.helpers.ts | Group-restricted Call/Chat access */

import type { SoMembershipStatus } from "../types";

export const SHIFT_OPS_CREW_ROLES = ["Staff", "Team Supervisor", "Lead", "Safety Marshal"] as const;

export type ShiftOpsCrewRole = (typeof SHIFT_OPS_CREW_ROLES)[number];

export const SHIFT_OPS_ZONES = [
  "General",
  "Zone A",
  "Zone B",
  "Zone C",
  "Gate",
  "Kitchen",
  "Floor",
] as const;

export type ShiftOpsZone = (typeof SHIFT_OPS_ZONES)[number];

const TERMINAL_WORKSPACE_STATUSES = new Set(["completed", "left", "replaced", "cancelled"]);

export type ShiftOpsCommsGateInput = {
  status?: SoMembershipStatus | string | null;
  groupId?: string | null;
  workerMlId?: string | null;
  /** Epoch ms — when set and past, group chat/call locks. */
  shiftEndAt?: number | null;
  /** Workspace lifecycle status — terminal statuses lock comms. */
  workspaceStatus?: string | null;
};

function isPastShiftEnd(shiftEndAt?: number | null): boolean {
  if (typeof shiftEndAt !== "number" || !Number.isFinite(shiftEndAt)) return false;
  return Date.now() > shiftEndAt;
}

function isTerminalWorkspace(workspaceStatus?: string | null): boolean {
  const status = String(workspaceStatus ?? "")
    .trim()
    .toLowerCase();
  return status.length > 0 && TERMINAL_WORKSPACE_STATUSES.has(status);
}

/**
 * In-app Call / Message allowed only when worker is an active member of a formal group
 * AND the shift/workspace window is still open.
 * Never reveal phone / email — CallButton uses workspaceId + ML ids only.
 */
export function canCommunicateInShiftOpsGroup(input: ShiftOpsCommsGateInput): boolean {
  const status = String(input.status ?? "").trim();
  const groupId = String(input.groupId ?? "").trim();
  const workerMl = String(input.workerMlId ?? "").trim();

  if (status !== "ready_for_assignment" || groupId.length === 0 || workerMl.length === 0) {
    return false;
  }

  if (isTerminalWorkspace(input.workspaceStatus)) return false;
  if (isPastShiftEnd(input.shiftEndAt)) return false;

  return true;
}

export function shiftOpsCommsBlockedReason(input: ShiftOpsCommsGateInput): string {
  if (!String(input.groupId ?? "").trim()) {
    return "Create or select an active Shift Group first";
  }
  if (String(input.status ?? "").trim() !== "ready_for_assignment") {
    return "Worker must be an active group member before Call / Message";
  }
  if (!String(input.workerMlId ?? "").trim()) {
    return "Worker Mitra Lab id missing — in-app call unavailable";
  }
  if (isTerminalWorkspace(input.workspaceStatus)) {
    return "This workspace is closed — group chat is locked";
  }
  if (isPastShiftEnd(input.shiftEndAt)) {
    return "This shift has ended — group chat is locked";
  }
  return "";
}
