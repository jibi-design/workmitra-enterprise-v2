// App name: Job Mitra
// File name: shiftControlCenter.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftControlCenter.storage.ts

import { availabilityStorage } from "./availabilityStorage";
import type { AvailabilityBroadcast } from "./availabilityStorage";
import type {
  ShiftControlCenterCounts,
  ShiftControlCenterSnapshot,
  ShiftControlRecord,
} from "../types/shiftControlCenter.types";

const APPS_KEY = "wm_employee_shift_applications_v1";
const WS_KEY = "wm_employee_shift_workspaces_v1";
const POSTS_KEY = "wm_employee_shift_search_v1";

const APPS_CHANGED_EVENT = "wm:employee-shift-applications-changed";
const WORKSPACES_CHANGED_EVENT = "wm:employee-shift-workspaces-changed";
const EMPLOYER_POSTS_CHANGED = "wm:employee-shift-search-changed";
const EMPLOYEE_POSTS_CHANGED = "wm:employee-shift-posts-changed";

let broadcastRaw: string | null = "__init__";
let broadcastCache: AvailabilityBroadcast | null = null;

let postsRaw: string | null = "__init__";
let appsRaw: string | null = "__init__";
let workspacesRaw: string | null = "__init__";

let controlCenterCache: ShiftControlCenterSnapshot = {
  posts: [],
  apps: [],
  workspaces: [],
};

export function getBroadcastSnapshot(): AvailabilityBroadcast | null {
  const raw = localStorage.getItem("wm_employee_availability_broadcast_v1");

  if (raw === broadcastRaw) return broadcastCache;

  broadcastRaw = raw;
  broadcastCache = availabilityStorage.getMyBroadcast();
  return broadcastCache;
}

export function subscribeControlCenter(callback: () => void): () => void {
  const handler = () => callback();

  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);
  window.addEventListener(APPS_CHANGED_EVENT, handler);
  window.addEventListener(WORKSPACES_CHANGED_EVENT, handler);
  window.addEventListener(EMPLOYER_POSTS_CHANGED, handler);
  window.addEventListener(EMPLOYEE_POSTS_CHANGED, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);
    window.removeEventListener(APPS_CHANGED_EVENT, handler);
    window.removeEventListener(WORKSPACES_CHANGED_EVENT, handler);
    window.removeEventListener(EMPLOYER_POSTS_CHANGED, handler);
    window.removeEventListener(EMPLOYEE_POSTS_CHANGED, handler);
  };
}

export function getControlCenterSnapshot(): ShiftControlCenterSnapshot {
  const nextPostsRaw = localStorage.getItem(POSTS_KEY);
  const nextAppsRaw = localStorage.getItem(APPS_KEY);
  const nextWorkspacesRaw = localStorage.getItem(WS_KEY);

  if (nextPostsRaw === postsRaw && nextAppsRaw === appsRaw && nextWorkspacesRaw === workspacesRaw) {
    return controlCenterCache;
  }

  postsRaw = nextPostsRaw;
  appsRaw = nextAppsRaw;
  workspacesRaw = nextWorkspacesRaw;

  controlCenterCache = {
    posts: safeArray(POSTS_KEY),
    apps: safeArray(APPS_KEY),
    workspaces: safeArray(WS_KEY),
  };

  return controlCenterCache;
}

export function computeControlCenterCounts(
  posts: ShiftControlRecord[],
  apps: ShiftControlRecord[],
  workspaces: ShiftControlRecord[],
): ShiftControlCenterCounts {
  const discoverablePosts = getDiscoverablePosts(posts, apps, workspaces);
  const blockedPostIds = getBlockedPostIds(apps, workspaces);

  let pending = 0;
  let confirmed = 0;
  let totalApps = 0;

  for (const app of apps) {
    const status = app["status"];
    totalApps += 1;

    if (status === "applied" || status === "shortlisted" || status === "waiting") {
      pending += 1;
    }

    if (status === "confirmed") {
      confirmed += 1;
    }
  }

  const activeWs = workspaces.filter(
    (workspace) => workspace["status"] === "active" || workspace["status"] === "upcoming",
  ).length;

  return {
    availableShifts: discoverablePosts.length,
    totalApps,
    pending,
    confirmed,
    activeWs,
    blockedPostIds,
    discoverablePosts,
  };
}

function safeArray(key: string): ShiftControlRecord[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is ShiftControlRecord => typeof item === "object" && item !== null,
    );
  } catch {
    return [];
  }
}

function getDiscoverablePosts(
  posts: ShiftControlRecord[],
  apps: ShiftControlRecord[],
  workspaces: ShiftControlRecord[],
): ShiftControlRecord[] {
  const blockedPostIds = getBlockedPostIds(apps, workspaces);

  return posts.filter((post) => {
    const postId = post["id"];

    if (post["isHiddenFromSearch"]) return false;
    if (typeof postId !== "string") return false;

    return !blockedPostIds.has(postId);
  });
}

function getBlockedPostIds(
  apps: ShiftControlRecord[],
  workspaces: ShiftControlRecord[],
): Set<string> {
  const ids = new Set<string>();

  for (const app of apps) {
    const postId = app["postId"];
    const status = app["status"];

    if (typeof postId === "string" && isNonRediscoverableApplicationStatus(status)) {
      ids.add(postId);
    }
  }

  for (const workspace of workspaces) {
    const postId = workspace["postId"];
    const status = workspace["status"];

    if (typeof postId === "string" && isWorkspaceVisibleInEmployeeFlow(status)) {
      ids.add(postId);
    }
  }

  return ids;
}

function isNonRediscoverableApplicationStatus(value: unknown): boolean {
  return (
    value === "applied" ||
    value === "shortlisted" ||
    value === "waiting" ||
    value === "confirmed" ||
    value === "exited" ||
    value === "replaced"
  );
}

function isWorkspaceVisibleInEmployeeFlow(value: unknown): boolean {
  return (
    value === "active" ||
    value === "upcoming" ||
    value === "completed" ||
    value === "left" ||
    value === "replaced"
  );
}
