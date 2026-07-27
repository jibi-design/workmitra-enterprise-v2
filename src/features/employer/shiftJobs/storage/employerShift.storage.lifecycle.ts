import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EMP_POSTS_KEY } from "./employerShift.keys";
import { pushEmployerActivity } from "./employerShift.activityStorage";
import { getEmployerShiftPost, updateEmployerShiftPost } from "./employerShift.postActions";
import {
  readEmployerPosts,
  syncToEmployeeSearch,
  writeEmployerPosts,
} from "./employerShift.postStorage";
import {
  readEmployeeApplications,
  writeEmployeeApplications,
} from "./employerShift.employeeBridge";
import { notifyEmployerShiftPostsChanged, safeWrite } from "./employerShift.utils";
import type { EmployerShiftActivityEntry, ShiftPost } from "./employerShift.types";

export function resetEmployerShiftAnalysis(
  postId: string,
  reason = "Employer reset analysis",
  opts: { unhideFromSearch?: boolean } = {},
): void {
  const current = getEmployerShiftPost(postId);
  if (!current) return;

  const priorPosts = readEmployerPosts();
  const priorApps = readEmployeeApplications();

  const patch: Partial<ShiftPost> = {
    analysisStatus: "not_started",
    analyzedAt: undefined,
    analysisNote: `Reset: ${reason}`,
    shortlistIds: [],
    waitingIds: [],
    rejectedIds: current.rejectedIds,
  };

  if (opts.unhideFromSearch) {
    patch.isHiddenFromSearch = false;
  }

  const updated = updateEmployerShiftPost(postId, patch);
  if (!updated) return;

  const apps = priorApps.map((app) => {
    if (app.postId !== postId) return app;

    if (app.status === "shortlisted" || app.status === "waiting") {
      return { ...app, status: "applied" as const };
    }

    return app;
  });

  const appWrite = writeEmployeeApplications(apps);
  if (!appWrite.ok) {
    writeEmployerPosts(priorPosts);
    syncToEmployeeSearch(priorPosts);
    return;
  }

  pushEmployerActivity({
    postId,
    kind: "analysis_reset",
    title: "Analysis reset",
    body: `Reason: ${reason}.${opts.unhideFromSearch ? " Post unhidden from search." : ""}`,
    route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
  });
}

export function checkExpiredEmployerShiftPosts(): void {
  const now = Date.now();
  const posts = readEmployerPosts();
  let changed = false;

  const apps = readEmployeeApplications();
  const pendingActivities: Array<Omit<EmployerShiftActivityEntry, "id" | "createdAt">> = [];

  const next = posts.map((post) => {
    if (post.status === "completed" || post.status === "cancelled") return post;
    if (post.endAt > now) return post;

    if (post.confirmedIds.length > 0) {
      changed = true;
      return { ...post, status: "completed" as const };
    }

    const hasApps = apps.some((app) => app.postId === post.id && app.status !== "withdrawn");

    if (!hasApps) {
      changed = true;

      pendingActivities.push({
        postId: post.id,
        kind: "post_expired",
        title: "Shift expired",
        body: `${post.jobName} expired with no applications. Consider reposting.`,
        route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", post.id),
      });

      return { ...post, status: "cancelled" as const };
    }

    return post;
  });

  if (!changed) return;

  const postWrite = safeWrite(EMP_POSTS_KEY, next);
  if (!postWrite.ok) return;

  notifyEmployerShiftPostsChanged();
  syncToEmployeeSearch(next);

  for (const activity of pendingActivities) {
    pushEmployerActivity(activity);
  }
}
