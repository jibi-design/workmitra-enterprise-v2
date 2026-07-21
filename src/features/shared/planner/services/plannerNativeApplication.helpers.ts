/**
 * Job Mitra | plannerNativeApplication.helpers.ts
 * Hybrid A2 S8 — planner-native apply/confirm when no dual-write ShiftPost exists.
 */

import {
  getEmployerShiftPosts,
  readEmployeeApplications,
  writeEmployeeApplications,
  type EmployeeShiftApplication,
} from "../ports/plannerLegacyShiftBridge";

const PENDING: ReadonlySet<EmployeeShiftApplication["status"]> = new Set([
  "applied",
  "shortlisted",
  "waiting",
]);

export function hasRealShiftPost(postId: string): boolean {
  const id = postId.trim();
  if (!id) return false;
  return getEmployerShiftPosts().some((p) => p.id === id);
}

export function countConfirmedPlannerAppsForTarget(args: {
  planId: string;
  /** Real post id (legacy) or synthetic slotId (native). */
  targetId: string;
}): number {
  const planId = args.planId.trim();
  const targetId = args.targetId.trim();
  if (!planId || !targetId) return 0;
  return readEmployeeApplications().filter(
    (app) => app.planId === planId && app.postId === targetId && app.status === "confirmed",
  ).length;
}

export function confirmPlannerApplicationNative(appId: string): boolean {
  const id = appId.trim();
  if (!id) return false;
  const apps = readEmployeeApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  const app = apps[idx];
  if (!app || !PENDING.has(app.status)) return false;

  const next = [...apps];
  next[idx] = {
    ...app,
    status: "confirmed",
    notes: { ...app.notes, plannerNativeConfirm: "s8" },
  };
  writeEmployeeApplications(next);
  return true;
}

export function rejectPlannerApplicationNative(appId: string): boolean {
  const id = appId.trim();
  if (!id) return false;
  const apps = readEmployeeApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  const app = apps[idx];
  if (!app || !PENDING.has(app.status)) return false;

  const next = [...apps];
  next[idx] = {
    ...app,
    status: "rejected",
    notes: { ...app.notes, plannerNativeReject: "s8" },
  };
  writeEmployeeApplications(next);
  return true;
}
