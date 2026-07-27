/** Resolve Review Center shift workspace paths without employer↔employee coupling. */

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { ReviewCenterRequest } from "../types/reviewCenter.types";

type WorkspaceLike = { id?: string; domain?: string; source?: string };
type AppLike = { workspaceId?: string; postId?: string };

function readJsonArray(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isPlannerWorkspace(workspace: WorkspaceLike, apps: AppLike[]): boolean {
  const domain = String(workspace.domain ?? workspace.source ?? "").toLowerCase();
  if (domain.includes("planner") || domain.includes("gig")) return true;
  const id = workspace.id ?? "";
  return apps.some(
    (app) =>
      (app.workspaceId === id || app.postId === id) &&
      String((app as { domain?: string }).domain ?? "")
        .toLowerCase()
        .includes("planner"),
  );
}

export function getRequestTargetPath(request: ReviewCenterRequest): string | null {
  if (request.domain !== "shift") return null;

  if (request.toRole === "employee") {
    const workspaces = readJsonArray("wm_employee_shift_workspaces_v1") as WorkspaceLike[];
    const apps = readJsonArray("wm_employee_shift_applications_v1") as AppLike[];
    const workspace = workspaces.find((row) => row.id === request.sourceId);
    const path =
      workspace && isPlannerWorkspace(workspace, apps)
        ? ROUTE_PATHS.employeePlannerWorkspace
        : ROUTE_PATHS.employeeShiftWorkspace;
    return path.replace(":workspaceId", request.sourceId);
  }

  if (request.toRole === "employer") {
    return ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", request.sourceId);
  }

  return null;
}
