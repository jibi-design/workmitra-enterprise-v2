// src/features/employee/careerJobs/helpers/careerWorkspaceHooks.ts
//
// Cached snapshot + subscribe for career workspace data.
// Used by EmployeeCareerWorkspacePage with useSyncExternalStore.

import type { CareerWorkspace } from "../../../employer/careerJobs/types/careerTypes";
import {
  CAREER_WORKSPACES_KEY,
  CAREER_WORKSPACES_CHANGED,
  safeParse,
} from "../../../employer/careerJobs/helpers/careerStorageUtils";

/* ── Stable-reference cache ────────────────────── */

let cacheRaw: string | null = "__init__";
let cacheList: CareerWorkspace[] = [];

export function getCareerWorkspacesSnapshot(): CareerWorkspace[] {
  const raw = localStorage.getItem(CAREER_WORKSPACES_KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheList = safeParse<CareerWorkspace>(raw).filter(
      (w): w is CareerWorkspace =>
        typeof w === "object" && w !== null && typeof (w as CareerWorkspace).id === "string",
    );
  }
  return cacheList;
}

/* ── Subscribe ─────────────────────────────────── */

export function subscribeCareerWorkspaces(cb: () => void): () => void {
  const handler = () => cb();
  const events = ["storage", "focus", CAREER_WORKSPACES_CHANGED];
  for (const ev of events) window.addEventListener(ev, handler);
  document.addEventListener("visibilitychange", handler);
  return () => {
    for (const ev of events) window.removeEventListener(ev, handler);
    document.removeEventListener("visibilitychange", handler);
  };
}