// App name: Job Mitra
// File name: shiftWorkspace.demoSeed.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftWorkspace.demoSeed.ts

import type {
  ShiftWorkspace,
  ShiftWorkspaceCategory,
  ShiftWorkspaceUpdate,
} from "../types/shiftWorkspace.types";
import { SHIFT_POSTS_KEY } from "./shiftWorkspace.keys";
import { clampCategory } from "./shiftWorkspace.normalizers";
import { readShiftWorkspaces, writeShiftWorkspaces } from "./shiftWorkspace.persistence";
import { createLocalId, safeParseArray } from "./shiftWorkspace.utils";

type DemoPost = {
  id: string;
  companyName: string;
  jobName: string;
  category?: ShiftWorkspaceCategory;
  locationName: string;
  startAt: number;
  endAt: number;
};

export function seedShiftWorkspacesDemoOnce(): void {
  const existing = readShiftWorkspaces();
  if (existing.length > 0) return;

  const posts = safeParseArray<DemoPost>(localStorage.getItem(SHIFT_POSTS_KEY)).filter(
    (post) =>
      post &&
      typeof post.id === "string" &&
      typeof post.companyName === "string" &&
      typeof post.jobName === "string",
  );

  const now = Date.now();
  const demo = posts.slice(0, 2).map((post, index) => createDemoWorkspace(post, index, now));

  writeShiftWorkspaces(demo);
}

function createDemoWorkspace(post: DemoPost, index: number, now: number): ShiftWorkspace {
  const update: ShiftWorkspaceUpdate = {
    id: createLocalId("u"),
    createdAt: now - (index + 1) * 60 * 60 * 1000,
    kind: "system",
    title: "Workspace created (demo)",
    body: "This workspace becomes real after employer confirmation in later steps.",
  };

  return {
    id: createLocalId("ws"),
    postId: post.id,
    companyName: post.companyName,
    jobName: post.jobName,
    category: clampCategory(post.category),
    locationName: post.locationName ?? "Location",
    startAt: typeof post.startAt === "number" ? post.startAt : now,
    endAt: typeof post.endAt === "number" ? post.endAt : now,
    status: "active",
    lastActivityAt: update.createdAt,
    unreadCount: 1,
    updates: [update],
  };
}
