// App name: Job Mitra
// File name: employerShift.storage.ts — facade

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  EMPLOYEE_APPS_CHANGED_EVENT,
  EMPLOYEE_WORKSPACES_CHANGED_EVENT,
  EMPLOYER_SHIFT_ACTIVITY_CHANGED_EVENT,
  EMPLOYER_SHIFT_POSTS_CHANGED_EVENT,
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
  readEmployeeApplications,
  writeEmployeeApplications,
} from "./employerShift.employeeBridge";
import { completePostSaga, type CompletePostSagaResult } from "./employerShift.postCompleteActions";
import {
  checkExpiredEmployerShiftPosts,
  resetEmployerShiftAnalysis,
} from "./employerShift.storage.lifecycle";
import { cascadeRejectOpenShiftApplications } from "../services/shiftApplicationCascade.service";
import { uniq } from "./employerShift.utils";
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
    return getEmployerShiftPosts();
  },

  getPost(postId: string): ShiftPost | null {
    return getEmployerShiftPost(postId);
  },

  getActivityForPost(postId: string): EmployerShiftActivityEntry[] {
    return readEmployerActivityAll()
      .filter((entry) => entry.postId === postId)
      .slice(0, 50);
  },

  async createPost(
    input: Omit<
      ShiftPost,
      "id" | "analysisStatus" | "shortlistIds" | "waitingIds" | "confirmedIds" | "rejectedIds"
    >,
  ): Promise<string | null> {
    const post = await saveEmployerShiftPost({
      ...input,
      analysisStatus: "not_started",
      shortlistIds: [],
      waitingIds: [],
      confirmedIds: [],
      rejectedIds: [],
    });

    return post?.id ?? null;
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
    resetEmployerShiftAnalysis(postId, reason, opts);
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

  async confirmCandidate(postId: string, appId: string): Promise<string | null> {
    const result = await confirmEmployerShiftCandidate(postId, appId);
    return result.ok ? result.workspaceId : null;
  },

  async confirm(postId: string, appId: string): Promise<string | null> {
    const result = await confirmEmployerShiftCandidate(postId, appId);
    return result.ok ? result.workspaceId : null;
  },

  /** Wave-1: rich confirm result for UI error surfacing */
  async confirmWithResult(postId: string, appId: string) {
    return confirmEmployerShiftCandidate(postId, appId);
  },

  replaceConfirmed(
    postId: string,
    appId: string,
    reason: EmployeeShiftApplication["replacedReason"] = "other",
  ): Promise<boolean> {
    return replaceEmployerShiftCandidate(postId, appId, reason).then((result) => result !== null);
  },

  replaceCandidate(
    postId: string,
    appId: string,
    reason: EmployeeShiftApplication["replacedReason"] = "other",
  ): Promise<boolean> {
    return replaceEmployerShiftCandidate(postId, appId, reason).then((result) => result !== null);
  },

  broadcastToWorkspace(postId: string, title: string, body: string): void {
    broadcastEmployerShiftWorkspace(postId, title, body);
  },

  closePost(postId: string, reason = "Closed by employer"): boolean {
    const post = getEmployerShiftPost(postId);

    if (!post) return false;

    const cascade = cascadeRejectOpenShiftApplications({
      postId,
      jobName: post.jobName,
      companyName: post.companyName,
      reason,
    });
    const rejectedSet = new Set(cascade.rejectedAppIds);

    const updated = updateEmployerShiftPost(postId, {
      status: "cancelled",
      isHiddenFromSearch: true,
      analysisNote: reason,
      shortlistIds: post.shortlistIds.filter((id) => !rejectedSet.has(id)),
      waitingIds: post.waitingIds.filter((id) => !rejectedSet.has(id)),
      rejectedIds: uniq([...post.rejectedIds, ...cascade.rejectedAppIds]),
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
    checkExpiredEmployerShiftPosts();
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
