/**
 * Employer home — today's roster from Shift workspaces / posts (employer truth).
 * MUST NOT read wm_work_diary_* or worker Personal Work Diary punches.
 */

import type { ShiftWorkspace } from "../../shiftJobs/types/shiftWorkspaceTypes";
import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";

export type RosterRadarRow = {
  readonly id: string;
  readonly workerLabel: string;
  readonly jobName: string;
  readonly status: string;
};

function toDateKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isActiveToday(startAt: number, endAt: number, todayKey: string, now: number): boolean {
  if (toDateKey(startAt) === todayKey) return true;
  return startAt <= now && endAt >= now;
}

export function buildRosterRadarRows(
  workspaces: readonly ShiftWorkspace[],
  posts: readonly ShiftPost[],
  now = Date.now(),
): RosterRadarRow[] {
  const todayKey = toDateKey(now);
  const rows: RosterRadarRow[] = [];
  const seen = new Set<string>();

  for (const ws of workspaces) {
    if (
      ws.status === "cancelled" ||
      ws.status === "left" ||
      ws.status === "replaced" ||
      ws.status === "completed"
    ) {
      continue;
    }
    if (!isActiveToday(ws.startAt, ws.endAt, todayKey, now)) continue;

    const workerLabel = ws.workerName?.trim() || ws.workerMlId?.trim() || "Confirmed worker";
    const key = `${ws.id}:${workerLabel}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({
      id: ws.id,
      workerLabel,
      jobName: ws.jobName,
      status: ws.status,
    });
  }

  // Posts with confirmed seats today but workspace row not yet visible.
  for (const post of posts) {
    if (post.status === "cancelled" || post.status === "completed") continue;
    if (!isActiveToday(post.startAt, post.endAt, todayKey, now)) continue;
    if (!Array.isArray(post.confirmedIds) || post.confirmedIds.length === 0) continue;

    const openSlots = Math.max(0, (post.vacancies ?? 0) - post.confirmedIds.length);
    const key = `post-${post.id}`;
    if (seen.has(key)) continue;
    // Prefer workspace-derived rows; only add a summary if no worker rows for this post.
    const hasWorkerForPost = rows.some((row) =>
      workspaces.some((ws) => ws.id === row.id && ws.postId === post.id),
    );
    if (hasWorkerForPost) continue;
    seen.add(key);

    rows.push({
      id: key,
      workerLabel: `${post.confirmedIds.length} confirmed`,
      jobName: post.jobName,
      status: openSlots > 0 ? `${openSlots} open slot${openSlots === 1 ? "" : "s"}` : "filled",
    });
  }

  return rows.slice(0, 8);
}

export function countOpenShiftGaps(
  posts: readonly ShiftPost[],
  now = Date.now(),
): { readonly openSlots: number; readonly urgentPosts: number } {
  const todayKey = toDateKey(now);
  let openSlots = 0;
  let urgentPosts = 0;

  for (const post of posts) {
    if (post.status === "cancelled" || post.status === "completed") continue;
    if (!isActiveToday(post.startAt, post.endAt, todayKey, now)) continue;
    const gap = Math.max(0, (post.vacancies ?? 0) - (post.confirmedIds?.length ?? 0));
    if (gap <= 0) continue;
    openSlots += gap;
    urgentPosts += 1;
  }

  return { openSlots, urgentPosts };
}
