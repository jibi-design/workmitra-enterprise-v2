// App name: Job Mitra
// File name: shiftWorkspaceStorage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\shiftWorkspaceStorage.ts

import { EMPLOYEE_NOTES_CHANGED_EVENT, EMPLOYEE_NOTES_KEY } from "./employerShift.keys";
import {
  readEmployerShiftWorkspaces,
  subscribeEmployerShiftWorkspaces,
  writeEmployerShiftWorkspaces,
} from "./employerShiftWorkspace.persistence";
import type { ShiftWorkspace } from "../types/shiftWorkspaceTypes";

export const WORKSPACES_KEY = "wm_employee_shift_workspaces_v1";
export const WORKSPACES_CHANGED = "wm:employee-shift-workspaces-changed";

export class WorkspaceStorageWriteError extends Error {
  readonly reason = "storage_error" as const;

  constructor() {
    super("Failed to persist shift workspace data.");
    this.name = "WorkspaceStorageWriteError";
  }
}

export function getWorkspacesSnapshot(): ShiftWorkspace[] {
  return readEmployerShiftWorkspaces();
}

export function subscribeWorkspaces(callback: () => void): () => void {
  return subscribeEmployerShiftWorkspaces(callback);
}

export function saveWorkspaces(list: ShiftWorkspace[]): void {
  const result = writeEmployerShiftWorkspaces(list);

  if (!result.ok) {
    throw new WorkspaceStorageWriteError();
  }
}

type EmployeeNote = {
  id: string;
  domain: "shift";
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
  route?: string;
};

function safeParseArray(raw: string | null): unknown[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function noteId(): string {
  return `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function safeDispatch(event: string): void {
  try {
    window.dispatchEvent(new Event(event));
  } catch (error) {
    console.warn("[shiftWorkspaceStorage] Failed to dispatch storage change event", {
      event,
      error,
    });
  }
}

export function pushEmployeeShiftNotification(
  title: string,
  body: string,
  route?: string,
): boolean {
  const note: EmployeeNote = {
    id: noteId(),
    domain: "shift",
    title,
    body,
    createdAt: Date.now(),
    isRead: false,
    route,
  };

  const existing = safeParseArray(localStorage.getItem(EMPLOYEE_NOTES_KEY));
  const next = [note, ...(existing as EmployeeNote[])].slice(0, 120);

  try {
    localStorage.setItem(EMPLOYEE_NOTES_KEY, JSON.stringify(next));
  } catch {
    return false;
  }

  safeDispatch(EMPLOYEE_NOTES_CHANGED_EVENT);
  return true;
}
