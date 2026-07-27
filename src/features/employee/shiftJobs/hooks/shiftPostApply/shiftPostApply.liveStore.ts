// App name: Job Mitra
// Shared LS subscribe helpers for Shift post-apply live state (P1-2)

import { APPS_KEY, POSTS_KEY } from "../../helpers/shiftApplyHelpers";
import { WORKSPACES_KEY } from "../../storage/shiftPostApply.storage";
import { shiftApplicationsStorage } from "../../storage/shiftApplications.storage";
import { shiftWorkspacesStorage } from "../../storage/shiftWorkspaces.storage";

const POST_CHANGED_EVENTS = [
  "wm:employer-shift-posts-changed",
  "wm:employee-shift-search-changed",
  "wm:employee-shift-posts-changed",
] as const;

export function subscribeShiftPosts(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);
  for (const eventName of POST_CHANGED_EVENTS) {
    window.addEventListener(eventName, handler);
  }
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);
    for (const eventName of POST_CHANGED_EVENTS) {
      window.removeEventListener(eventName, handler);
    }
  };
}

export function getPostsRawSnapshot(): string | null {
  return localStorage.getItem(POSTS_KEY);
}

export function subscribeShiftApps(onStoreChange: () => void): () => void {
  return shiftApplicationsStorage.subscribe(onStoreChange);
}

export function getAppsRawSnapshot(): string | null {
  return localStorage.getItem(APPS_KEY);
}

export function subscribeShiftWorkspacesRaw(onStoreChange: () => void): () => void {
  return shiftWorkspacesStorage.subscribe(onStoreChange);
}

export function getWorkspacesRawSnapshot(): string | null {
  return localStorage.getItem(WORKSPACES_KEY);
}
