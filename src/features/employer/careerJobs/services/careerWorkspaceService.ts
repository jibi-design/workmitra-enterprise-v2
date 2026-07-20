// App name: Job Mitra
// File name: careerWorkspaceService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\services\careerWorkspaceService.ts

import { uid } from "../helpers/careerStorageUtils";
import { readCareerWorkspaces, writeCareerWorkspaces } from "../helpers/careerNormalizers";
import type { CareerJobPost, CareerWorkspace, CareerWorkspaceUpdate } from "../types/careerTypes";

export type CreateCareerWorkspaceResult =
  { ok: true; workspaceId: string; created: boolean } | { ok: false; reason: "storage_error" };

function findCareerWorkspaceByJobId(jobId: string): CareerWorkspace | null {
  return readCareerWorkspaces().find((workspace) => workspace.jobId === jobId) ?? null;
}

export function createCareerWorkspace(post: CareerJobPost): CreateCareerWorkspaceResult {
  const existing = findCareerWorkspaceByJobId(post.id);
  if (existing) return { ok: true, workspaceId: existing.id, created: false };

  const now = Date.now();
  const workspaceId = uid("cws");

  const welcomeUpdate: CareerWorkspaceUpdate = {
    id: uid("cu"),
    createdAt: now,
    kind: "system",
    title: "Welcome to your new role",
    body: `Congratulations! You have been hired as ${post.jobTitle} at ${post.companyName}. This workspace is your official channel for onboarding and communication.`,
  };

  const workspace: CareerWorkspace = {
    id: workspaceId,
    jobId: post.id,
    companyName: post.companyName,
    jobTitle: post.jobTitle,
    department: post.department,
    location: post.location,
    status: "onboarding",
    lastActivityAt: now,
    unreadCount: 1,
    updates: [welcomeUpdate],
    hiredAt: now,
  };

  const writeResult = writeCareerWorkspaces([workspace, ...readCareerWorkspaces()].slice(0, 100));
  if (!writeResult.ok) return { ok: false, reason: "storage_error" };

  return { ok: true, workspaceId, created: true };
}
