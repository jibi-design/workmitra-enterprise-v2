// Job Mitra | plannerDomainFilters.ts | Separate Gig Projects from Shift Jobs

import type {
  ShiftApplicationData,
  ShiftWorkspace,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";

export function isPlannerApplication(app: ShiftApplicationData): boolean {
  return Boolean(app.planId || app.planApplyBatchId);
}

export function isShiftApplication(app: ShiftApplicationData): boolean {
  return !isPlannerApplication(app);
}

export function buildPlannerPostIdSet(apps: ShiftApplicationData[]): Set<string> {
  const ids = new Set<string>();
  for (const app of apps) {
    if (isPlannerApplication(app)) ids.add(app.postId);
  }
  return ids;
}

export function filterWorkspacesByDomain(
  workspaces: ShiftWorkspace[],
  apps: ShiftApplicationData[],
  domain: "shift" | "planner",
): ShiftWorkspace[] {
  const plannerPostIds = buildPlannerPostIdSet(apps);
  return workspaces.filter((ws) =>
    domain === "planner" ? plannerPostIds.has(ws.postId) : !plannerPostIds.has(ws.postId),
  );
}

export function isPlannerWorkspace(
  workspace: ShiftWorkspace,
  apps: ShiftApplicationData[],
): boolean {
  return buildPlannerPostIdSet(apps).has(workspace.postId);
}
