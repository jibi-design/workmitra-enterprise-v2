/**
 * Job Mitra | incomingCallIdentity.ts
 * Resolve employer display from pending call → employee workspace context.
 */

import type { IncomingCallPayload } from "../../../shared/calling/incomingCallBridge";
import { shiftWorkspacesStorage } from "../storage/shiftWorkspaces.storage";

export type IncomingCallerIdentity = {
  initial: string;
  companyName: string;
  workspaceId: string | null;
};

function companyFromWorkspaceId(workspaceId: string): IncomingCallerIdentity | null {
  const workspace = shiftWorkspacesStorage.getById(workspaceId);
  const companyName = workspace?.companyName?.trim() ?? "";
  if (!companyName) return null;
  return {
    initial: companyName.charAt(0).toUpperCase() || "E",
    companyName,
    workspaceId,
  };
}

/**
 * Prefer explicit workspaceId on the FCM/native payload (ties to callSession workspace).
 * Single live workspace is a best-effort fallback when payload omits workspaceId.
 */
export function resolveIncomingCallerIdentity(
  pending: IncomingCallPayload,
): IncomingCallerIdentity {
  const workspaceId = pending.workspaceId?.trim() ?? "";
  if (workspaceId) {
    const fromId = companyFromWorkspaceId(workspaceId);
    if (fromId) return fromId;
  }

  const live = shiftWorkspacesStorage
    .getAll()
    .filter((item) => item.status === "active" || item.status === "upcoming")
    .sort((a, b) => a.startAt - b.startAt);

  if (live.length === 1 && live[0]?.companyName?.trim()) {
    const companyName = live[0].companyName.trim();
    return {
      initial: companyName.charAt(0).toUpperCase() || "E",
      companyName,
      workspaceId: live[0].id,
    };
  }

  return {
    initial: "E",
    companyName: "Employer",
    workspaceId: workspaceId || null,
  };
}
