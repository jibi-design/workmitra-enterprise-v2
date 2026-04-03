// src/features/employer/helpers/ratingNudgeHelpers.ts
//
// Helpers to count unrated workers across Shift Jobs + Workforce.
// Used by home pages for "X workers pending rating" counter cards.

type Rec = Record<string, unknown>;

function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null;
}

function safeParseArray(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Shift: count completed workspaces where worker has NOT been rated          */
/* ─────────────────────────────────────────────────────────────────────────── */

const SHIFT_WS_KEY = "wm_employee_shift_workspaces_v1";

export function countShiftPendingRatings(): number {
  const workspaces = safeParseArray(SHIFT_WS_KEY);
  let count = 0;

  for (const ws of workspaces) {
    if (!isRec(ws)) continue;
    if (ws["status"] !== "completed") continue;

    const rated = ws["employerRating"];
    if (typeof rated === "number" && rated > 0) continue;

    count++;
  }

  return count;
}

/**
 * Returns IDs of completed but unrated shift workspaces.
 */
export function getShiftUnratedWorkspaceIds(): string[] {
  const workspaces = safeParseArray(SHIFT_WS_KEY);
  const ids: string[] = [];

  for (const ws of workspaces) {
    if (!isRec(ws)) continue;
    if (ws["status"] !== "completed") continue;

    const rated = ws["employerRating"];
    if (typeof rated === "number" && rated > 0) continue;

    const id = ws["id"];
    if (typeof id === "string") ids.push(id);
  }

  return ids;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Workforce: count completed groups where members have NOT been rated        */
/* ─────────────────────────────────────────────────────────────────────────── */

const WF_GROUPS_KEY = "wm_workforce_groups_v1";
const WF_MEMBERS_KEY = "wm_workforce_members_v1";

export function countWorkforcePendingRatings(): number {
  const groups = safeParseArray(WF_GROUPS_KEY);
  const members = safeParseArray(WF_MEMBERS_KEY);

  let count = 0;

  for (const g of groups) {
    if (!isRec(g)) continue;
    if (g["status"] !== "completed") continue;

    const groupId = g["id"];
    if (typeof groupId !== "string") continue;

    const groupMembers = members.filter(
      (m) => isRec(m) && m["groupId"] === groupId && m["status"] === "active",
    );

    for (const m of groupMembers) {
      if (!isRec(m)) continue;
      const rated = m["rating"];
      if (typeof rated === "number" && rated > 0) continue;
      count++;
    }
  }

  return count;
}

/**
 * Returns group IDs that have at least one unrated active member.
 */
export function getWorkforceUnratedGroupIds(): string[] {
  const groups = safeParseArray(WF_GROUPS_KEY);
  const members = safeParseArray(WF_MEMBERS_KEY);
  const ids: string[] = [];

  for (const g of groups) {
    if (!isRec(g)) continue;
    if (g["status"] !== "completed") continue;

    const groupId = g["id"];
    if (typeof groupId !== "string") continue;

    const hasUnrated = members.some((m) => {
      if (!isRec(m)) return false;
      if (m["groupId"] !== groupId) return false;
      if (m["status"] !== "active") return false;
      const rated = m["rating"];
      return !(typeof rated === "number" && rated > 0);
    });

    if (hasUnrated) ids.push(groupId);
  }

  return ids;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Combined                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

export function countTotalPendingRatings(): number {
  return countShiftPendingRatings() + countWorkforcePendingRatings();
}