// Job Mitra | plannerDayConflict.helpers.ts | Section 8.10.2

import { getEmployerShiftPosts } from "../../../employer/shiftJobs/storage/employerShift.postActions";
import type { PlannerDayConflict } from "../types/employeeAvailability.types";
import { shiftWorkspacesStorage } from "../../shiftJobs/storage/shiftWorkspaces.storage";

const APPS_KEY = "wm_employee_shift_applications_v1";

type AppRecord = {
  id: string;
  postId: string;
  status: string;
  profileSnapshot?: { uniqueId?: string };
};

function dateKeyFromPost(startAt: number): string {
  const d = new Date(startAt);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readApps(): AppRecord[] {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (typeof item !== "object" || item === null) return [];
      const rec = item as Record<string, unknown>;
      if (typeof rec.postId !== "string") return [];
      return [
        {
          id: String(rec.id ?? ""),
          postId: rec.postId,
          status: String(rec.status ?? "applied"),
          profileSnapshot:
            typeof rec.profileSnapshot === "object" && rec.profileSnapshot !== null
              ? {
                  uniqueId:
                    typeof (rec.profileSnapshot as { uniqueId?: string }).uniqueId === "string"
                      ? (rec.profileSnapshot as { uniqueId?: string }).uniqueId
                      : undefined,
                }
              : undefined,
        },
      ];
    });
  } catch {
    return [];
  }
}

function appBelongsToWorker(app: AppRecord, workerWmId: string): boolean {
  const uid = app.profileSnapshot?.uniqueId?.trim();
  if (uid) return uid === workerWmId;
  return true;
}

function workspaceBelongsToWorker(
  ws: { workerWmId?: string; appId?: string },
  workerWmId: string,
  apps: AppRecord[],
): boolean {
  if (ws.workerWmId?.trim()) return ws.workerWmId.trim() === workerWmId;
  if (!ws.appId) return true;
  const app = apps.find((a) => a.id === ws.appId);
  return app ? appBelongsToWorker(app, workerWmId) : true;
}

export function getShiftDayConflict(
  dateKey: string,
  workerWmId: string,
  excludePostId?: string,
): PlannerDayConflict | null {
  const posts = getEmployerShiftPosts();
  const apps = readApps();
  const workspaces = shiftWorkspacesStorage.getAll();
  const excluded = excludePostId ? posts.find((p) => p.id === excludePostId) : null;
  const excludePlanId = excluded?.planId;

  for (const app of apps) {
    if (app.status !== "confirmed") continue;
    if (!appBelongsToWorker(app, workerWmId)) continue;

    const post = posts.find((p) => p.id === app.postId);
    if (!post || post.id === excludePostId) continue;
    if (dateKeyFromPost(post.startAt) !== dateKey) continue;
    if (excludePlanId && post.planId === excludePlanId) continue;

    return {
      dateKey,
      postId: excludePostId ?? "",
      conflictType: "confirmed_shift",
      conflictLabel: `You have a ${post.jobName} shift on this day`,
      blockingPostId: post.id,
    };
  }

  for (const ws of workspaces) {
    if (ws.status !== "active" && ws.status !== "upcoming") continue;
    if (!workspaceBelongsToWorker(ws, workerWmId, apps)) continue;

    const post = posts.find((p) => p.id === ws.postId);
    if (!post || post.id === excludePostId) continue;
    if (dateKeyFromPost(post.startAt) !== dateKey) continue;
    if (excludePlanId && post.planId === excludePlanId) continue;

    return {
      dateKey,
      postId: excludePostId ?? "",
      conflictType: "active_workspace",
      conflictLabel: `You have a ${post.jobName} shift on this day`,
      blockingPostId: post.id,
    };
  }

  return null;
}

export function longestConsecutiveDates(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort();
  let best = 1;
  let run = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00`);
    const cur = new Date(`${sorted[i]}T00:00:00`);
    const diffDays = (cur.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
    if (diffDays === 1) {
      run += 1;
      best = Math.max(best, run);
    } else if (diffDays > 0) {
      run = 1;
    }
  }

  return best;
}
