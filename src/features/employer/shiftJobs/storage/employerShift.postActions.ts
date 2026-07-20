// App name: Job Mitra
// File name: employerShift.postActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.postActions.ts

import { analyzeShiftCandidates, getAnalysisNote } from "./employerShift.analysis";
import {
  confirmCandidate,
  moveCandidateToShortlist,
  moveCandidateToWaiting,
  rejectCandidate,
  replaceConfirmedCandidate,
} from "./employerShift.candidateActions";
import {
  broadcastToEmployeeWorkspace,
  readEmployeeApplications,
  writeEmployeeApplications,
} from "./employerShift.employeeBridge";
import {
  readEmployerPosts,
  syncToEmployeeSearch,
  writeEmployerPosts,
} from "./employerShift.postStorage";
import { plannerPublicIndex } from "../../planner/storage/plannerPublicIndex.storage";
import { pushEmployerActivity } from "./employerShift.activityStorage";
import type { EmployeeShiftApplication, ShiftPost } from "./employerShift.types";
import {
  createLocalId,
  notifyEmployeeAppsChanged,
  notifyEmployerShiftPostsChanged,
  uniq,
} from "./employerShift.utils";

export function getEmployerShiftPosts(): ShiftPost[] {
  return readEmployerPosts();
}

export function getEmployerShiftPost(postId: string): ShiftPost | null {
  return readEmployerPosts().find((post) => post.id === postId) ?? null;
}

export function saveEmployerShiftPost(input: Omit<ShiftPost, "id"> & { id?: string }): ShiftPost {
  const posts = readEmployerPosts();
  const nowId = input.id && input.id.trim() ? input.id : createLocalId("shift");

  const post: ShiftPost = {
    ...input,
    id: nowId,
    shortlistIds: uniq(input.shortlistIds ?? []),
    waitingIds: uniq(input.waitingIds ?? []),
    confirmedIds: uniq(input.confirmedIds ?? []),
    rejectedIds: uniq(input.rejectedIds ?? []),
  };

  const exists = posts.some((item) => item.id === post.id);
  const next = exists ? posts.map((item) => (item.id === post.id ? post : item)) : [post, ...posts];

  writeEmployerPosts(next);
  syncToEmployeeSearch(next);

  if (!exists) {
    pushEmployerActivity({
      postId: post.id,
      kind: "post_created",
      title: "Shift post created",
      body: `${post.jobName} at ${post.companyName}`,
      route: `/employer/shift/post/${post.id}`,
    });
  }

  return post;
}

export function updateEmployerShiftPost(
  postId: string,
  patch: Partial<ShiftPost>,
): ShiftPost | null {
  const posts = readEmployerPosts();
  const current = posts.find((post) => post.id === postId);

  if (!current) return null;

  const updated: ShiftPost = {
    ...current,
    ...patch,
    id: current.id,
    shortlistIds: uniq(patch.shortlistIds ?? current.shortlistIds),
    waitingIds: uniq(patch.waitingIds ?? current.waitingIds),
    confirmedIds: uniq(patch.confirmedIds ?? current.confirmedIds),
    rejectedIds: uniq(patch.rejectedIds ?? current.rejectedIds),
  };

  const next = posts.map((post) => (post.id === postId ? updated : post));

  writeEmployerPosts(next);
  syncToEmployeeSearch(next);

  return updated;
}

export function setEmployerShiftHidden(postId: string, hidden: boolean): ShiftPost | null {
  const updated = updateEmployerShiftPost(postId, {
    isHiddenFromSearch: hidden,
  });

  if (!updated) return null;

  pushEmployerActivity({
    postId,
    kind: hidden ? "hidden" : "unhidden",
    title: hidden ? "Shift hidden from employee search" : "Shift visible in employee search",
    body: updated.jobName,
    route: `/employer/shift/post/${postId}`,
  });

  return updated;
}

export function runEmployerShiftAnalysis(postId: string): ShiftPost | null {
  const posts = readEmployerPosts();
  const current = posts.find((post) => post.id === postId);

  if (!current) return null;

  const apps = readEmployeeApplications();
  const analyzedApps = analyzeShiftCandidates(current, apps);
  const mergedApps = mergeAnalyzedApplications(apps, analyzedApps);

  writeEmployeeApplications(mergedApps);
  notifyEmployeeAppsChanged();

  const note = getAnalysisNote(current, mergedApps);

  const updated: ShiftPost = {
    ...current,
    analysisStatus: "done",
    analyzedAt: Date.now(),
    analysisNote: note,
  };

  const next = posts.map((post) => (post.id === postId ? updated : post));

  writeEmployerPosts(next);
  syncToEmployeeSearch(next);

  pushEmployerActivity({
    postId,
    kind: "analysis_run",
    title: "Candidate analysis completed",
    body: note,
    route: `/employer/shift/post/${postId}`,
  });

  return updated;
}

export function resetEmployerShiftAnalysis(postId: string): ShiftPost | null {
  const updated = updateEmployerShiftPost(postId, {
    analysisStatus: "not_started",
    analyzedAt: undefined,
    analysisNote: undefined,
  });

  if (!updated) return null;

  pushEmployerActivity({
    postId,
    kind: "analysis_reset",
    title: "Candidate analysis reset",
    body: updated.jobName,
    route: `/employer/shift/post/${postId}`,
  });

  return updated;
}

export function shortlistEmployerShiftCandidate(postId: string, appId: string): ShiftPost | null {
  const post = getEmployerShiftPost(postId);
  if (!post) return null;

  const result = moveCandidateToShortlist(post, appId);
  if (!result.changed) return post;

  const updated = updateEmployerShiftPost(postId, result.post);

  pushEmployerActivity({
    postId,
    kind: "move_shortlist",
    title: "Candidate moved to shortlist",
    body: appId,
    route: `/employer/shift/post/${postId}/candidate/${appId}`,
  });

  return updated;
}

export function waitlistEmployerShiftCandidate(postId: string, appId: string): ShiftPost | null {
  const post = getEmployerShiftPost(postId);
  if (!post) return null;

  const result = moveCandidateToWaiting(post, appId);
  if (!result.changed) return post;

  const updated = updateEmployerShiftPost(postId, result.post);

  pushEmployerActivity({
    postId,
    kind: "move_waiting",
    title: "Candidate moved to waiting list",
    body: appId,
    route: `/employer/shift/post/${postId}/candidate/${appId}`,
  });

  return updated;
}

export function rejectEmployerShiftCandidate(postId: string, appId: string): ShiftPost | null {
  const post = getEmployerShiftPost(postId);
  if (!post) return null;

  const result = rejectCandidate(post, appId);
  if (!result.changed) return post;

  const updated = updateEmployerShiftPost(postId, result.post);

  pushEmployerActivity({
    postId,
    kind: "candidate_rejected",
    title: "Candidate rejected",
    body: appId,
    route: `/employer/shift/post/${postId}/candidate/${appId}`,
  });

  return updated;
}

export function confirmEmployerShiftCandidate(
  postId: string,
  appId: string,
): { post: ShiftPost; workspaceId: string | null } | null {
  const post = getEmployerShiftPost(postId);
  if (!post) return null;

  const result = confirmCandidate(post, appId);
  if (!result.ok) return { post, workspaceId: null };

  const updated = updateEmployerShiftPost(postId, result.post);
  if (!updated) return null;

  pushEmployerActivity({
    postId,
    kind: "confirmed",
    title: "Candidate confirmed",
    body: appId,
    route: `/employer/shift/post/${postId}/candidate/${appId}`,
  });

  if (updated.planId) {
    plannerPublicIndex.refreshOpenCounts(updated.planId);
  }

  return { post: updated, workspaceId: result.workspaceId };
}

export function replaceEmployerShiftCandidate(
  postId: string,
  appId: string,
  reason: EmployeeShiftApplication["replacedReason"] = "other",
): ShiftPost | null {
  const post = getEmployerShiftPost(postId);
  if (!post) return null;

  const result = replaceConfirmedCandidate(post, appId, reason);
  if (!result.ok) {
    // Precondition failures return the unmodified post; storage failures return null.
    return result.reason === "not_found" || result.reason === "not_confirmed" ? post : null;
  }

  const updated = updateEmployerShiftPost(postId, result.post);

  pushEmployerActivity({
    postId,
    kind: "replaced",
    title: "Confirmed candidate replaced",
    body: appId,
    route: `/employer/shift/post/${postId}/candidate/${appId}`,
  });

  return updated;
}

export function broadcastEmployerShiftWorkspace(postId: string, title: string, body: string): void {
  broadcastToEmployeeWorkspace(postId, title, body);

  pushEmployerActivity({
    postId,
    kind: "confirmed",
    title: "Workspace broadcast sent",
    body: title,
    route: `/employer/shift/workspace/${postId}`,
  });
}

export function deleteEmployerShiftPost(postId: string): void {
  const posts = readEmployerPosts().filter((post) => post.id !== postId);

  writeEmployerPosts(posts);
  syncToEmployeeSearch(posts);
  notifyEmployerShiftPostsChanged();
}

function mergeAnalyzedApplications(
  allApps: EmployeeShiftApplication[],
  analyzedApps: EmployeeShiftApplication[],
): EmployeeShiftApplication[] {
  const analyzedMap = new Map(analyzedApps.map((app) => [app.id, app]));

  return allApps.map((app) => analyzedMap.get(app.id) ?? app);
}
