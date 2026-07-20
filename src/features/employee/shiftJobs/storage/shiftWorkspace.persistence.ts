// App name: Job Mitra
// File name: shiftWorkspace.persistence.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftWorkspace.persistence.ts

import type { ShiftWorkspace } from "../types/shiftWorkspace.types";
import { SHIFT_WORKSPACES_CHANGED_EVENT, SHIFT_WORKSPACES_KEY } from "./shiftWorkspace.keys";
import { normalizeShiftWorkspaces } from "./shiftWorkspace.normalizers";
import {
  safeDispatch,
  safeParseArray,
  safeSetJson,
  type JsonStorageWriteResult,
} from "./shiftWorkspace.utils";

let workspacesCacheRaw: string | null = "__init__";
let workspacesCacheList: ShiftWorkspace[] = [];

export type ShiftWorkspaceWriteResult = JsonStorageWriteResult;

export function notifyWorkspacesChanged(): void {
  safeDispatch(SHIFT_WORKSPACES_CHANGED_EVENT);
}

export function readShiftWorkspaces(): ShiftWorkspace[] {
  const raw = localStorage.getItem(SHIFT_WORKSPACES_KEY);

  if (raw === workspacesCacheRaw) {
    return workspacesCacheList;
  }

  workspacesCacheRaw = raw;
  workspacesCacheList = normalizeShiftWorkspaces(safeParseArray<unknown>(raw)).sort(
    (a, b) => b.lastActivityAt - a.lastActivityAt,
  );

  return workspacesCacheList;
}

export function writeShiftWorkspaces(list: ShiftWorkspace[]): ShiftWorkspaceWriteResult {
  const result = safeSetJson(SHIFT_WORKSPACES_KEY, list);

  if (!result.ok) {
    return result;
  }

  workspacesCacheRaw = "__dirty__";
  notifyWorkspacesChanged();

  return result;
}

export function subscribeShiftWorkspaces(callback: () => void): () => void {
  const handler = () => callback();

  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);
  window.addEventListener(SHIFT_WORKSPACES_CHANGED_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);
    window.removeEventListener(SHIFT_WORKSPACES_CHANGED_EVENT, handler);
  };
}
