// App name: Job Mitra
// File name: employerShift.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.storage.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  EMPLOYEE_APPS_CHANGED_EVENT,
  EMPLOYEE_WORKSPACES_CHANGED_EVENT,
  EMPLOYER_SHIFT_ACTIVITY_CHANGED_EVENT,
  EMPLOYER_SHIFT_POSTS_CHANGED_EVENT,
  EMP_POSTS_KEY,
} from "./employerShift.keys";
import { pushEmployerActivity, readEmployerActivityAll } from "./employerShift.activityStorage";
import {
  broadcastEmployerShiftWorkspace,
  confirmEmployerShiftCandidate,
  deleteEmployerShiftPost,
  getEmployerShiftPost,
  getEmployerShiftPosts,
  rejectEmployerShiftCandidate,
  replaceEmployerShiftCandidate,
  runEmployerShiftAnalysis,
  saveEmployerShiftPost,
  setEmployerShiftHidden,
  shortlistEmployerShiftCandidate,
  updateEmployerShiftPost,
  waitlistEmployerShiftCandidate,
} from "./employerShift.postActions";
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
import { completePostSaga, type CompletePostSagaResult } from "./employerShift.postCompleteActions";
import type {
  EmployeeShiftApplication,
  EmployerShiftActivityEntry,
  PostSettings,
  PriorityTag,
  ShiftPost,
} from "./employerShift.types";

export type { CompletePostSagaResult } from "./employerShift.postCompleteActions";

export type {
  AnalysisStatus,
  ApplicantProfileSnapshot,
  ApplicantStatus,
  EmployeeNotification,
  EmployeeShiftApplication,
  EmployeeWorkspace,
  EmployeeWorkspaceUpdate,
  EmployerShiftActivityEntry,
  EmployerShiftActivityKind,
  ExperienceLabel,
  PostSettings,
  PriorityTag,
  RequirementAnswer,
  ShiftCategory,
  ShiftPost,
  ShiftPostStatus,
  ShiftQuickQuestion,
} from "./employerShift.types";

export const employerShiftStorage = {
  getPosts(): ShiftPost[] {
    const posts = getEmployerShiftPosts();
    syncToEmployeeSearch(posts);
    return posts;
  },

  getPost(postId: string): ShiftPost | null {
    return getEmployerShiftPost(postId);
  },

  getActivityForPost(postId: string): EmployerShiftActivityEntry[] {
    return readEmployerActivityAll()
      .filter((entry) => entry.postId === postId)
      .slice(0, 50);
  },

  createPost(
    input: Omit<
      ShiftPost,
      "id" | "analysisStatus" | "shortlistIds" | "waitingIds" | "confirmedIds" | "rejectedIds"
    >,
  ): string {
    const post = saveEmployerShiftPost({
      ...input,
      analysisStatus: "not_started",
      shortlistIds: [],
      waitingIds: [],
      confirmedIds: [],
      rejectedIds: [],
    });

    return post.id;
  },

  updatePost(postId: string, patch: Partial<ShiftPost>): ShiftPost | null {
    return updateEmployerShiftPost(postId, patch);
  },

  editPost(postId: string, patch: Partial<ShiftPost>): ShiftPost | null {
    return updateEmployerShiftPost(postId, patch);
  },

  setHidden(postId: string, hidden: boolean): void {
    setEmployerShiftHidden(postId, hidden);
  },

  runAnalysis(postId: string): ShiftPost | null {
    return runEmployerShiftAnalysis(postId);
  },

  analyzePost(postId: string): ShiftPost | null {
    return runEmployerShiftAnalysis(postId);
  },

  analyzeOnce(postId: string, opts: { hideFromSearch?: boolean } = {}): ShiftPost | null {
    const analyzed = runEmployerShiftAnalysis(postId);

    if (!analyzed) return null;

    if (opts.hideFromSearch) {
      return updateEmployerShiftPost(postId, { isHiddenFromSearch: true });
    }

    return analyzed;
  },

  resetAnalysis(
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
  },

  moveToShortlist(postId: string, appId: string): void {
    shortlistEmployerShiftCandidate(postId, appId);
  },

  moveToWaiting(postId: string, appId: string): void {
    waitlistEmployerShiftCandidate(postId, appId);
  },

  rejectCandidate(postId: string, appId: string): void {
    rejectEmployerShiftCandidate(postId, appId);
  },

  removeFromPicks(postId: string, appId: string, reason = "Removed by employer"): void {
    void reason;
    rejectEmployerShiftCandidate(postId, appId);
  },

  confirmCandidate(postId: string, appId: string): string | null {
    const result = confirmEmployerShiftCandidate(postId, appId);
    return result?.workspaceId ?? null;
  },

  confirm(postId: string, appId: string): string | null {
    const result = confirmEmployerShiftCandidate(postId, appId);
    return result?.workspaceId ?? null;
  },

  replaceConfirmed(
    postId: string,
    appId: string,
    reason: EmployeeShiftApplication["replacedReason"] = "other",
  ): boolean {
    const result = replaceEmployerShiftCandidate(postId, appId, reason);
    return result !== null;
  },

  replaceCandidate(
    postId: string,
    appId: string,
    reason: EmployeeShiftApplication["replacedReason"] = "other",
  ): boolean {
    const result = replaceEmployerShiftCandidate(postId, appId, reason);
    return result !== null;
  },

  broadcastToWorkspace(postId: string, title: string, body: string): void {
    broadcastEmployerShiftWorkspace(postId, title, body);
  },

  closePost(postId: string, reason = "Closed by employer"): boolean {
    const post = getEmployerShiftPost(postId);

    if (!post) return false;

    const updated = updateEmployerShiftPost(postId, {
      status: "cancelled",
      isHiddenFromSearch: true,
      analysisNote: reason,
    });

    if (!updated) return false;

    pushEmployerActivity({
      postId,
      kind: "post_closed",
      title: "Shift closed",
      body: `${post.jobName} was closed by the employer. Reason: ${reason}`,
      route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
    });

    return true;
  },

  deletePost(postId: string): boolean {
    const post = getEmployerShiftPost(postId);

    if (!post) return false;

    const hasApplications = readEmployeeApplications().some((app) => app.postId === postId);

    if (hasApplications) {
      return false;
    }

    deleteEmployerShiftPost(postId);
    return true;
  },

  checkExpiredPosts(): void {
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
  },

  completePost(postId: string): CompletePostSagaResult {
    return completePostSaga(postId);
  },

  updateSettings(postId: string, settings: PostSettings): void {
    updateEmployerShiftPost(postId, { settings });
  },

  setPriorityTag(postId: string, appId: string, tag: PriorityTag | undefined): void {
    const apps = readEmployeeApplications().map((app) => {
      if (app.id === appId && app.postId === postId) {
        return { ...app, priorityTag: tag };
      }

      return app;
    });

    writeEmployeeApplications(apps);
  },

  _events: {
    employerShiftPostsChanged: EMPLOYER_SHIFT_POSTS_CHANGED_EVENT,
    employeeAppsChanged: EMPLOYEE_APPS_CHANGED_EVENT,
    employeeWorkspacesChanged: EMPLOYEE_WORKSPACES_CHANGED_EVENT,
    employerShiftActivityChanged: EMPLOYER_SHIFT_ACTIVITY_CHANGED_EVENT,
  },
} as const;
