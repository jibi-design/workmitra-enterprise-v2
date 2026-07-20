// App name: Job Mitra
// File name: employerShift.employeeWorkspaces.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.employeeWorkspaces.ts

import type {
  EmployeeShiftApplication,
  EmployeeWorkspace,
  EmployeeWorkspaceUpdate,
  ShiftPost,
} from "./employerShift.types";
import type { ShiftWorkspace, ShiftWorkspaceCategory } from "../types/shiftWorkspaceTypes";
import {
  readEmployerShiftWorkspaces,
  writeEmployerShiftWorkspaces,
} from "./employerShiftWorkspace.persistence";
import { createLocalId } from "./employerShift.utils";

export type WorkspaceCreateResult =
  { ok: true; workspaceId: string } | { ok: false; reason: "storage_error" | "missing_muid" };

export type WorkspaceMarkResult =
  { ok: true } | { ok: false; reason: "not_found" | "storage_error" };

export function createOrUpdateEmployeeWorkspace(
  post: ShiftPost,
  application: EmployeeShiftApplication,
): WorkspaceCreateResult {
  const existing = readEmployeeWorkspaces();
  const appId = application.id;
  const workerWmId = application.profileSnapshot?.uniqueId?.trim() || undefined;
  const workerName = application.profileSnapshot?.fullName?.trim() || "Worker";

  if (!workerWmId) return { ok: false, reason: "missing_muid" };

  const now = Date.now();

  const existingWorkspace =
    existing.find(
      (workspace) =>
        workspace.postId === post.id &&
        workerWmId &&
        workspace.workerWmId?.trim().toUpperCase() === workerWmId.toUpperCase(),
    ) ??
    existing.find((workspace) => workspace.postId === post.id && workspace.appId === appId) ??
    null;

  if (existingWorkspace) {
    const next: EmployeeWorkspace[] = existing.map((workspace) => {
      if (workspace.id !== existingWorkspace.id) return workspace;

      const update = createWorkspaceUpdate(
        "system",
        "You are confirmed for this shift",
        "Your workspace is ready. Follow employer updates here.",
      );

      return {
        ...workspace,
        appId,
        workerWmId: workerWmId ?? workspace.workerWmId,
        workerName: workerName || workspace.workerName,
        locationName: post.locationName,
        locationAddress: post.locationAddress,
        mapsLink: post.mapsLink,
        startAt: post.startAt,
        endAt: post.endAt,
        status: workspace.status === "completed" ? "completed" : "active",
        lastActivityAt: now,
        unreadCount: workspace.unreadCount + 1,
        updates: [update, ...workspace.updates].slice(0, 50),
      };
    });

    if (!writeEmployeeWorkspaces(next)) return { ok: false, reason: "storage_error" };
    return { ok: true, workspaceId: existingWorkspace.id };
  }

  const workspace: EmployeeWorkspace = {
    id: createLocalId("ws"),
    postId: post.id,
    appId,
    workerWmId,
    workerName,
    companyName: post.companyName,
    jobName: post.jobName,
    category: post.category,
    locationName: post.locationName,
    locationAddress: post.locationAddress,
    mapsLink: post.mapsLink,
    startAt: post.startAt,
    endAt: post.endAt,
    status: "active",
    lastActivityAt: now,
    unreadCount: 1,
    updates: [
      createWorkspaceUpdate(
        "system",
        "Workspace created",
        `You are confirmed for ${post.jobName}. Application: ${appId}`,
      ),
    ],
  };

  if (!writeEmployeeWorkspaces([workspace, ...existing]))
    return { ok: false, reason: "storage_error" };
  return { ok: true, workspaceId: workspace.id };
}

export function restoreEmployeeWorkspaces(snapshot: EmployeeWorkspace[]): void {
  writeEmployeeWorkspaces(snapshot);
}

export function broadcastToEmployeeWorkspace(postId: string, title: string, body: string): void {
  const existing = readEmployeeWorkspaces();
  const now = Date.now();

  let changed = false;

  const next: EmployeeWorkspace[] = existing.map((workspace) => {
    if (workspace.postId !== postId) return workspace;
    if (
      workspace.status === "left" ||
      workspace.status === "replaced" ||
      workspace.status === "completed" ||
      workspace.status === "cancelled"
    ) {
      return workspace;
    }

    changed = true;

    const update: EmployeeWorkspaceUpdate = {
      id: createLocalId("wu"),
      createdAt: now,
      kind: "broadcast",
      title,
      body,
    };

    return {
      ...workspace,
      updates: [update, ...workspace.updates].slice(0, 50),
      unreadCount: workspace.unreadCount + 1,
      lastActivityAt: now,
    };
  });

  if (!changed) return;

  writeEmployeeWorkspaces(next);
}

export function markEmployeeWorkspaceReplaced(
  postId: string,
  reason: EmployeeWorkspace["replacedReason"] = "other",
): WorkspaceMarkResult {
  const existing = readEmployeeWorkspaces();
  const now = Date.now();

  let changed = false;

  const next: EmployeeWorkspace[] = existing.map((workspace) => {
    if (workspace.postId !== postId) return workspace;
    if (workspace.status === "replaced") return workspace;

    changed = true;

    const update: EmployeeWorkspaceUpdate = {
      id: createLocalId("wu"),
      createdAt: now,
      kind: "system",
      title: "Assignment replaced",
      body: "The employer replaced this assignment.",
    };

    return {
      ...workspace,
      status: "replaced",
      replacedAt: now,
      replacedReason: reason,
      unreadCount: 0,
      lastActivityAt: now,
      updates: [update, ...workspace.updates].slice(0, 50),
    };
  });

  if (!changed) return { ok: false, reason: "not_found" };
  if (!writeEmployeeWorkspaces(next)) return { ok: false, reason: "storage_error" };
  return { ok: true };
}

export function markEmployeeWorkspaceCancelled(postId: string, appId: string): WorkspaceMarkResult {
  const existing = readEmployeeWorkspaces();
  const now = Date.now();

  let changed = false;

  const next: EmployeeWorkspace[] = existing.map((workspace) => {
    if (workspace.postId !== postId) return workspace;
    if (workspace.appId !== appId) return workspace;
    if (workspace.status === "cancelled") return workspace;
    if (
      workspace.status === "completed" ||
      workspace.status === "left" ||
      workspace.status === "replaced"
    ) {
      return workspace;
    }

    changed = true;

    const update: EmployeeWorkspaceUpdate = {
      id: createLocalId("wu"),
      createdAt: now,
      kind: "system",
      title: "Project cancelled",
      body: "The employer cancelled this project plan. This workspace is now closed.",
    };

    return {
      ...workspace,
      status: "cancelled",
      unreadCount: workspace.unreadCount + 1,
      lastActivityAt: now,
      updates: [update, ...workspace.updates].slice(0, 50),
    };
  });

  if (!changed) return { ok: false, reason: "not_found" };
  if (!writeEmployeeWorkspaces(next)) return { ok: false, reason: "storage_error" };
  return { ok: true };
}

export function readEmployeeWorkspaces(): EmployeeWorkspace[] {
  return readEmployerShiftWorkspaces();
}

function clampWorkspaceCategory(value: string): ShiftWorkspaceCategory {
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

function toShiftWorkspace(workspace: EmployeeWorkspace): ShiftWorkspace {
  return {
    ...workspace,
    category: clampWorkspaceCategory(workspace.category),
  };
}

function writeEmployeeWorkspaces(workspaces: EmployeeWorkspace[]): boolean {
  const result = writeEmployerShiftWorkspaces(workspaces.map(toShiftWorkspace));
  return result.ok;
}

function createWorkspaceUpdate(
  kind: EmployeeWorkspaceUpdate["kind"],
  title: string,
  body?: string,
): EmployeeWorkspaceUpdate {
  return {
    id: createLocalId("wu"),
    createdAt: Date.now(),
    kind,
    title,
    body,
  };
}
