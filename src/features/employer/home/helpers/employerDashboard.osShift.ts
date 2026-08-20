/** Shift-lane rows for Employer OS dashboard (excludes Planner-tagged apps). */

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type {
  EmployeeShiftApplication,
  ShiftPost,
} from "../../shiftJobs/storage/employerShift.types";
import type {
  EmployerOsDomainSnapshot,
  EmployerOsOpenRow,
  EmployerOsStageDef,
  EmployerOsTrackerRow,
} from "./employerDashboard.osTypes";

export const SHIFT_OS_STAGES: readonly EmployerOsStageDef[] = [
  { key: "Applied", label: "Applied" },
  { key: "Shortlisted", label: "Shortlisted" },
  { key: "Confirmed", label: "Confirmed" },
];

export function isPlannerTaggedShiftApp(app: EmployeeShiftApplication): boolean {
  return Boolean(app.planId?.trim() || app.planApplyBatchId?.trim());
}

function isShiftOwnedPost(post: ShiftPost): boolean {
  return post.source !== "planner" && !post.planId;
}

export function mapShiftOsStage(status: string): string | null {
  if (status === "applied") return "Applied";
  if (status === "shortlisted" || status === "waiting") return "Shortlisted";
  if (status === "confirmed") return "Confirmed";
  return null;
}

export function computeShiftOsSnapshot(
  posts: readonly ShiftPost[],
  apps: readonly EmployeeShiftApplication[],
): EmployerOsDomainSnapshot {
  const shiftApps = apps.filter((app) => !isPlannerTaggedShiftApp(app));
  const open = posts.filter(
    (post) => isShiftOwnedPost(post) && post.status !== "completed" && post.status !== "cancelled",
  ).length;
  const pending = shiftApps.filter(
    (app) => app.status === "applied" || app.status === "shortlisted" || app.status === "waiting",
  ).length;
  const confirmed = shiftApps.filter((app) => app.status === "confirmed").length;
  return {
    domain: "shift",
    title: "Shift Jobs",
    openLabel: "Open posts",
    openCount: open,
    pendingLabel: "Waiting review",
    pendingCount: pending,
    confirmedLabel: "Confirmed",
    confirmedCount: confirmed,
  };
}

export function buildShiftOsRows(
  apps: readonly EmployeeShiftApplication[],
  posts: readonly ShiftPost[],
): EmployerOsTrackerRow[] {
  const postsById = new Map(posts.map((post) => [post.id, post]));
  const rows: EmployerOsTrackerRow[] = [];
  for (const app of apps) {
    if (isPlannerTaggedShiftApp(app)) continue;
    const stage = mapShiftOsStage(app.status);
    if (!stage) continue;
    const post = postsById.get(app.postId);
    rows.push({
      id: app.id,
      title: app.profileSnapshot?.fullName?.trim() || "Worker",
      subtitle: post?.jobName?.trim() || "Shift post",
      stage,
      updatedAt: app.statusChangedAt ?? app.createdAt,
      href: ROUTE_PATHS.employerCandidateDetail
        .replace(":postId", app.postId)
        .replace(":appId", app.id),
    });
  }
  return rows;
}

export function buildShiftOpenRows(posts: readonly ShiftPost[]): EmployerOsOpenRow[] {
  return posts
    .filter(
      (post) =>
        isShiftOwnedPost(post) && post.status !== "completed" && post.status !== "cancelled",
    )
    .sort((a, b) => a.startAt - b.startAt)
    .slice(0, 8)
    .map((post) => ({
      id: post.id,
      title: post.jobName,
      meta: `${post.confirmedIds?.length ?? 0} confirmed`,
      href: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", post.id),
      badge: post.startAt > Date.now() ? "Upcoming" : "Active",
    }));
}
