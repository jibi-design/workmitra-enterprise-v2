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

const SHIFT_START_SOON_MS = 2 * 60 * 60 * 1000;

export function isLiveShiftOwnedPost(post: ShiftPost): boolean {
  return isShiftOwnedPost(post) && post.status !== "completed" && post.status !== "cancelled";
}

export function countUpcomingShiftPosts(posts: readonly ShiftPost[], now = Date.now()): number {
  return posts.filter((post) => isLiveShiftOwnedPost(post) && post.startAt > now).length;
}

export function countShiftsStartingSoon(
  posts: readonly ShiftPost[],
  now = Date.now(),
  windowMs = SHIFT_START_SOON_MS,
): number {
  return posts.filter(
    (post) => isLiveShiftOwnedPost(post) && post.startAt > now && post.startAt <= now + windowMs,
  ).length;
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
  const open = posts.filter((post) => isLiveShiftOwnedPost(post)).length;
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
    .filter((post) => isLiveShiftOwnedPost(post))
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

export function buildShiftRosterRows(
  apps: readonly EmployeeShiftApplication[],
  posts: readonly ShiftPost[],
): EmployerOsOpenRow[] {
  const postsById = new Map(posts.map((post) => [post.id, post]));
  const rows: EmployerOsOpenRow[] = [];
  for (const app of apps) {
    if (isPlannerTaggedShiftApp(app)) continue;
    if (app.status !== "applied" && app.status !== "shortlisted" && app.status !== "waiting") {
      continue;
    }
    const post = postsById.get(app.postId);
    if (!post || !isLiveShiftOwnedPost(post)) continue;
    rows.push({
      id: app.id,
      title: app.profileSnapshot?.fullName?.trim() || "Worker",
      meta: post.jobName?.trim() || "Open shift",
      href: ROUTE_PATHS.employerCandidateDetail
        .replace(":postId", app.postId)
        .replace(":appId", app.id),
      badge: app.status === "waiting" ? "Available" : "Match",
    });
  }
  return rows.slice(0, 8);
}

export function buildShiftGateRows(posts: readonly ShiftPost[]): EmployerOsOpenRow[] {
  return posts
    .filter((post) => isLiveShiftOwnedPost(post) && (post.confirmedIds?.length ?? 0) > 0)
    .sort((a, b) => a.startAt - b.startAt)
    .slice(0, 8)
    .map((post) => ({
      id: post.id,
      title: post.jobName,
      meta: `${post.confirmedIds.length} confirmed · gate ready`,
      href: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", post.id),
      badge: "Gate",
    }));
}

export function countShiftRosterMatches(
  apps: readonly EmployeeShiftApplication[],
  posts: readonly ShiftPost[],
): number {
  const liveIds = new Set(posts.filter(isLiveShiftOwnedPost).map((post) => post.id));
  return apps.filter(
    (app) =>
      !isPlannerTaggedShiftApp(app) &&
      liveIds.has(app.postId) &&
      (app.status === "applied" || app.status === "shortlisted" || app.status === "waiting"),
  ).length;
}

export function countShiftGateReady(posts: readonly ShiftPost[]): number {
  return posts
    .filter(isLiveShiftOwnedPost)
    .reduce((sum, post) => sum + (post.confirmedIds?.length ?? 0), 0);
}
