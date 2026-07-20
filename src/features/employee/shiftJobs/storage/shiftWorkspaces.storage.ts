// App name: Job Mitra
// File name: shiftWorkspaces.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftWorkspaces.storage.ts

export type {
  ShiftWorkspace,
  ShiftWorkspaceCategory,
  ShiftWorkspaceStatus,
  ShiftWorkspaceUpdate,
} from "../types/shiftWorkspace.types";

import type { ShiftWorkspace, ShiftWorkspaceUpdate } from "../types/shiftWorkspace.types";
import { markApplicationsExitedForPost } from "./shiftWorkspace.applicationSync";
import { seedShiftWorkspacesDemoOnce } from "./shiftWorkspace.demoSeed";
import { pushEmployerNotificationShift } from "./shiftWorkspace.employerNotifications";
import { isReadOnlyWorkspaceStatus } from "./shiftWorkspace.normalizers";
import {
  readShiftWorkspaces,
  subscribeShiftWorkspaces,
  writeShiftWorkspaces,
  type ShiftWorkspaceWriteResult,
} from "./shiftWorkspace.persistence";
import { clampText, createLocalId } from "./shiftWorkspace.utils";

const OK_WRITE_RESULT: ShiftWorkspaceWriteResult = { ok: true };

export const shiftWorkspacesStorage = {
  seedDemoOnce: seedShiftWorkspacesDemoOnce,

  subscribe(callback: () => void): () => void {
    return subscribeShiftWorkspaces(callback);
  },

  getAll(): ShiftWorkspace[] {
    return readShiftWorkspaces();
  },

  getById(workspaceId: string): ShiftWorkspace | null {
    return readShiftWorkspaces().find((workspace) => workspace.id === workspaceId) ?? null;
  },

  markRead(workspaceId: string): ShiftWorkspaceWriteResult {
    const next = readShiftWorkspaces().map((workspace) =>
      workspace.id === workspaceId ? { ...workspace, unreadCount: 0 } : workspace,
    );

    return writeShiftWorkspaces(next);
  },

  addUpdate(
    workspaceId: string,
    update: Omit<ShiftWorkspaceUpdate, "id">,
  ): ShiftWorkspaceWriteResult {
    const next = readShiftWorkspaces().map((workspace) => {
      if (workspace.id !== workspaceId) return workspace;

      const nextUpdate: ShiftWorkspaceUpdate = {
        id: createLocalId("u"),
        ...update,
      };

      return {
        ...workspace,
        updates: [nextUpdate, ...workspace.updates].slice(0, 50),
        lastActivityAt: nextUpdate.createdAt,
        unreadCount: workspace.unreadCount + 1,
      };
    });

    return writeShiftWorkspaces(next);
  },

  replyToEmployer(workspaceId: string, message: string): ShiftWorkspaceWriteResult {
    const cleanMessage = clampText(message, 360);
    if (!cleanMessage) return OK_WRITE_RESULT;

    const list = readShiftWorkspaces();
    const target = list.find((workspace) => workspace.id === workspaceId);

    if (!target) return OK_WRITE_RESULT;
    if (isReadOnlyWorkspaceStatus(target.status)) return OK_WRITE_RESULT;

    const now = Date.now();

    const update: ShiftWorkspaceUpdate = {
      id: createLocalId("u"),
      createdAt: now,
      kind: "direct",
      title: "Reply (Employee)",
      body: cleanMessage,
    };

    const next = list.map((workspace) => {
      if (workspace.id !== workspaceId) return workspace;

      return {
        ...workspace,
        updates: [update, ...workspace.updates].slice(0, 50),
        lastActivityAt: now,
        unreadCount: Math.max(0, workspace.unreadCount),
      };
    });

    const writeResult = writeShiftWorkspaces(next);

    if (!writeResult.ok) {
      return writeResult;
    }

    const shortMessage =
      cleanMessage.length > 80 ? `${cleanMessage.slice(0, 80)}...` : cleanMessage;

    pushEmployerNotificationShift(
      "New reply",
      `${target.jobName} - ${target.companyName}. "${shortMessage}"`,
      `/employer/shift/workspace/${workspaceId}`,
    );

    return writeResult;
  },

  exitWorkspace(
    workspaceId: string,
    reason: ShiftWorkspace["exitReason"],
    note: string,
  ): ShiftWorkspaceWriteResult {
    const list = readShiftWorkspaces();
    const target = list.find((workspace) => workspace.id === workspaceId);

    if (!target) return OK_WRITE_RESULT;
    if (isReadOnlyWorkspaceStatus(target.status)) return OK_WRITE_RESULT;

    const now = Date.now();

    const next = list.map((workspace) => {
      if (workspace.id !== workspaceId) return workspace;

      const update: ShiftWorkspaceUpdate = {
        id: createLocalId("u"),
        createdAt: now,
        kind: "system",
        title: "You left this workspace",
        body: "Employer will be notified inside the app.",
      };

      return {
        ...workspace,
        status: "left" as const,
        exitedAt: now,
        exitReason: reason,
        exitNote: note.trim() ? note.trim() : undefined,
        unreadCount: 0,
        updates: [update, ...workspace.updates].slice(0, 50),
        lastActivityAt: now,
      };
    });

    const writeResult = writeShiftWorkspaces(next);

    if (!writeResult.ok) {
      return writeResult;
    }

    markApplicationsExitedForPost(target.postId);

    const reasonText = reason ? String(reason) : "other";
    const noteText = note.trim() ? ` Note: ${note.trim()}` : "";

    pushEmployerNotificationShift(
      "Worker exited",
      `${target.jobName} - ${target.companyName}. Reason: ${reasonText}.${noteText} Action: Fill vacancy from waiting list.`,
      `/employer/shift/post/${target.postId}`,
    );

    return writeResult;
  },

  saveRating(
    workspaceId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    comment: string,
  ): ShiftWorkspaceWriteResult {
    const list = readShiftWorkspaces();
    const target = list.find((workspace) => workspace.id === workspaceId);

    if (!target) return OK_WRITE_RESULT;
    if (target.status !== "completed") return OK_WRITE_RESULT;
    if (target.rating) return OK_WRITE_RESULT;

    const now = Date.now();
    const trimmedComment = comment.trim().slice(0, 240);

    const update: ShiftWorkspaceUpdate = {
      id: createLocalId("u"),
      createdAt: now,
      kind: "system",
      title: "You rated this job",
      body: `Rating: ${rating} star${rating > 1 ? "s" : ""}${trimmedComment ? `. "${trimmedComment}"` : ""}`,
    };

    const next = list.map((workspace) => {
      if (workspace.id !== workspaceId) return workspace;

      return {
        ...workspace,
        rating,
        ratingComment: trimmedComment || undefined,
        ratedAt: now,
        updates: [update, ...workspace.updates].slice(0, 50),
        lastActivityAt: now,
      };
    });

    return writeShiftWorkspaces(next);
  },

  markReplaced(
    workspaceId: string,
    reason: ShiftWorkspace["replacedReason"],
  ): ShiftWorkspaceWriteResult {
    const list = readShiftWorkspaces();
    const now = Date.now();

    const next = list.map((workspace) => {
      if (workspace.id !== workspaceId) return workspace;

      const update: ShiftWorkspaceUpdate = {
        id: createLocalId("u"),
        createdAt: now,
        kind: "system",
        title: "Assignment replaced by employer",
        body: "Your assignment was replaced. You will not be part of this workspace anymore.",
      };

      return {
        ...workspace,
        status: "replaced" as const,
        replacedAt: now,
        replacedReason: reason ?? "other",
        unreadCount: 0,
        updates: [update, ...workspace.updates].slice(0, 50),
        lastActivityAt: now,
      };
    });

    return writeShiftWorkspaces(next);
  },
} as const;
