/** Create a local work-group workspace when the employee is confirmed but none exists. */

import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { shiftWorkspacesStorage } from "../storage/shiftWorkspaces.storage";
import type { ShiftPostData, ShiftApplicationData } from "../types/shiftApplicationTypes";
import { createLocalId } from "../storage/shiftWorkspace.utils";
import {
  readShiftWorkspaces,
  writeShiftWorkspaces,
} from "../storage/shiftWorkspace.persistence";

export function ensureConfirmedShiftWorkspace(
  application: ShiftApplicationData,
  post: ShiftPostData,
): string | null {
  if (application.status !== "confirmed") return null;

  const existingByApp = shiftWorkspacesStorage
    .getAll()
    .find((workspace) => workspace.postId === application.postId && workspace.appId === application.id);
  if (existingByApp) return existingByApp.id;

  const existingByPost = shiftWorkspacesStorage.getAll().find(
    (workspace) =>
      workspace.postId === application.postId &&
      (workspace.status === "active" ||
        workspace.status === "upcoming" ||
        workspace.status === "completed"),
  );
  if (existingByPost) return existingByPost.id;

  const now = Date.now();
  const workerMlId = employeeProfileStorage.get().uniqueId?.trim() || undefined;
  const workspace = {
    id: createLocalId("ws"),
    postId: application.postId,
    appId: application.id,
    workerMlId,
    workerName: "You",
    companyName: post.companyName,
    jobName: post.jobName,
    category: "other" as const,
    locationName: post.locationName,
    locationAddress: post.locationAddress,
    mapsLink: post.mapsLink,
    startAt: post.startAt,
    endAt: post.endAt,
    status: "active" as const,
    lastActivityAt: now,
    unreadCount: 1,
    updates: [
      {
        id: createLocalId("wu"),
        createdAt: now,
        kind: "system" as const,
        title: "Work group ready",
        body: "You are confirmed. Employer updates for this shift appear in this group.",
      },
    ],
  };

  const write = writeShiftWorkspaces([workspace, ...readShiftWorkspaces()]);
  return write.ok ? workspace.id : null;
}
