import type { WorkspaceLite, WorkspaceStatus } from "./dashboardHelpers.types";
import { isRec, num, safeParseArray, str } from "./dashboardHelpers.parsing";

const WORKSPACES_KEY = "wm_employee_shift_workspaces_v1";

function clampWsStatus(x: unknown): WorkspaceStatus {
  if (x === "active" || x === "upcoming" || x === "completed" || x === "left" || x === "replaced")
    return x;
  return "active";
}

export function normalizeWorkspacesLite(rawList: unknown[]): WorkspaceLite[] {
  const out: WorkspaceLite[] = [];
  for (const item of rawList) {
    if (!isRec(item)) continue;
    const id = str(item, "id");
    const postId = str(item, "postId");
    const lastActivityAt = num(item, "lastActivityAt");
    const startAt = num(item, "startAt");
    if (!id || !postId || lastActivityAt === undefined || startAt === undefined) continue;
    out.push({ id, postId, status: clampWsStatus(item["status"]), lastActivityAt, startAt });
  }
  out.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  return out;
}

export function findWorkspaceIdForPost(postId: string): string | null {
  for (const item of safeParseArray(localStorage.getItem(WORKSPACES_KEY))) {
    if (!isRec(item)) continue;
    if (str(item, "postId") === postId) return str(item, "id") ?? null;
  }
  return null;
}

export function workspaceNeedsAttention(ws: WorkspaceLite): {
  needs: boolean;
  hint: string | null;
} {
  if (ws.status === "left") return { needs: true, hint: "Worker exited" };
  if (ws.status === "replaced") return { needs: true, hint: "Replaced" };
  return { needs: false, hint: null };
}

export { WORKSPACES_KEY };
