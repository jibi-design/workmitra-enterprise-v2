// App: Job Mitra / WorkMitra_Enterprise_v2
// File: adminHomePage.helpers.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\helpers\adminHomePage.helpers.ts

import type { AdminHomeData } from "../components/AdminHomeSharedUi";
import { computeAdminHomeData } from "./adminHomePage.compute";
import { ADMIN_HOME_EVENTS, ADMIN_HOME_STORAGE_KEYS } from "./adminHomePage.storage.utils";

export { ADMIN_HOME_EVENTS, ADMIN_HOME_STORAGE_KEYS };

const K = ADMIN_HOME_STORAGE_KEYS;

let cacheKey = "";
let cacheData: AdminHomeData | null = null;

export function getAdminHomeSnapshot(): AdminHomeData {
  const key = [
    localStorage.getItem(K.shiftPosts),
    localStorage.getItem(K.shiftApps),
    localStorage.getItem(K.careerPosts),
    localStorage.getItem(K.careerApps),
    localStorage.getItem(K.shiftLog),
    localStorage.getItem(K.careerLog),
    localStorage.getItem(K.shiftWorkspaces),
    localStorage.getItem(K.careerWorkspaces),
    localStorage.getItem(K.wfStaff),
    localStorage.getItem(K.wfAnnouncements),
    localStorage.getItem(K.wfGroups),
  ].join("|");

  if (key === cacheKey && cacheData) return cacheData;

  cacheKey = key;
  cacheData = computeAdminHomeData();

  return cacheData;
}

export function subscribeAdminHome(callback: () => void): () => void {
  const handler = () => callback();

  for (const eventName of ADMIN_HOME_EVENTS) {
    window.addEventListener(eventName, handler);
  }

  document.addEventListener("visibilitychange", handler);

  return () => {
    for (const eventName of ADMIN_HOME_EVENTS) {
      window.removeEventListener(eventName, handler);
    }

    document.removeEventListener("visibilitychange", handler);
  };
}

export function formatAdminHomeDate(timestamp: number): string {
  if (!timestamp) return "—";

  try {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function formatAdminHomeBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

export function formatAdminHomeRelativeTime(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

export function exportAdminHomeData() {
  try {
    const data: Record<string, unknown> = {};

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (!key) continue;

      try {
        data[key] = JSON.parse(localStorage.getItem(key) ?? "null");
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `job-mitra-export-${Date.now()}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  } catch {
    /* ignore */
  }
}
