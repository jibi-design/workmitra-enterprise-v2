// careerPostService.lifecycle.ts — Pause, resume, close, delete
// B-P1-3: never treat LS write as success without writeCareerPosts(...).ok
// before AUTH dual-write / activity / cascade side effects.

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  buildServerPostCreateBody,
  mergeServerPostIntoLsCache,
} from "../../../career/services/careerPostDbTruth.service";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
  resolveCareerGatePostId,
} from "../../../career/services/careerGateApi.service";
import type { CareerJobPost } from "../types/careerTypes";
import { readCareerPosts, writeCareerPosts } from "../helpers/careerNormalizers";
import { pushCareerActivity } from "../helpers/careerNotifications";
import { syncToEmployeeCareerSearch } from "../helpers/careerValidation";
import { cascadeRejectOpenCareerApplications } from "./careerApplicationCascade.service";

/** Persist post list + search projection; roll back posts if search sync fails. */
function commitCareerPostsLocally(next: CareerJobPost[], prior: CareerJobPost[]): boolean {
  const write = writeCareerPosts(next);
  if (!write.ok) return false;

  const search = syncToEmployeeCareerSearch(next);
  if (!search.ok) {
    writeCareerPosts(prior);
    return false;
  }

  return true;
}

function restoreCareerPostsLocally(prior: CareerJobPost[]): void {
  writeCareerPosts(prior);
  syncToEmployeeCareerSearch(prior);
}

async function dualWritePostUpdate(
  localPost: CareerJobPost,
  prior: CareerJobPost[],
): Promise<boolean> {
  if (!isCareerApiSyncEnabled()) return true;

  const serverPostId = resolveCareerGatePostId(localPost.id);
  if (!serverPostId) {
    restoreCareerPostsLocally(prior);
    return false;
  }

  try {
    const dto = await careerGateApi.updateCareerPost(
      serverPostId,
      buildServerPostCreateBody(localPost),
    );
    mergeServerPostIntoLsCache(dto, localPost.id);
    return true;
  } catch {
    restoreCareerPostsLocally(prior);
    return false;
  }
}

export async function pauseCareerPost(postId: string): Promise<boolean> {
  const posts = readCareerPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post || post.status !== "active") return false;

  const prior = posts;
  const updated: CareerJobPost = { ...post, status: "paused", updatedAt: Date.now() };
  const next = posts.map((p) => (p.id === postId ? updated : p));

  if (!commitCareerPostsLocally(next, prior)) return false;

  const ok = await dualWritePostUpdate(updated, prior);
  if (!ok) return false;

  pushCareerActivity({
    postId,
    kind: "post_paused",
    title: "Post paused",
    body: `${post.jobTitle} is no longer visible to applicants.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  return true;
}

export async function resumeCareerPost(postId: string): Promise<boolean> {
  const posts = readCareerPosts();
  const post = posts.find((p) => p.id === postId);
  const now = Date.now();

  if (!post || post.status !== "paused") return false;
  if (post.closingDate > 0 && post.closingDate <= now) return false;

  const prior = posts;
  const updated: CareerJobPost = { ...post, status: "active", updatedAt: now };
  const next = posts.map((p) => (p.id === postId ? updated : p));

  if (!commitCareerPostsLocally(next, prior)) return false;

  const ok = await dualWritePostUpdate(updated, prior);
  if (!ok) return false;

  pushCareerActivity({
    postId,
    kind: "post_resumed",
    title: "Post resumed",
    body: `${post.jobTitle} is visible to applicants again.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  return true;
}

export async function closeCareerPost(postId: string): Promise<boolean> {
  const posts = readCareerPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post || (post.status !== "active" && post.status !== "paused")) return false;

  const now = Date.now();
  const prior = posts;
  const updated: CareerJobPost = { ...post, status: "closed", updatedAt: now };
  const next = posts.map((p) => (p.id === postId ? updated : p));

  if (!commitCareerPostsLocally(next, prior)) return false;

  const ok = await dualWritePostUpdate(updated, prior);
  if (!ok) return false;

  pushCareerActivity({
    postId,
    kind: "post_closed",
    title: "Post closed",
    body: `${post.jobTitle} has been closed. No new applications accepted.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  const cascade = await cascadeRejectOpenCareerApplications({
    postId,
    jobTitle: post.jobTitle,
    companyName: post.companyName,
    reason: "This job posting was closed by the employer.",
  });

  // Post is already closed (AUTH dual-write succeeded). Cascade failure means
  // open apps may remain on server — surface as close failure so UI can retry.
  if (!cascade.ok && cascade.reason === "api_error") {
    return false;
  }

  return true;
}

/** Close an active/paused post whose closing date has passed (C-POST-1). */
export async function expireCareerPost(postId: string): Promise<boolean> {
  const posts = readCareerPosts();
  const post = posts.find((p) => p.id === postId);
  const now = Date.now();
  if (!post || (post.status !== "active" && post.status !== "paused")) return false;
  if (!(post.closingDate > 0 && post.closingDate < now)) return false;
  return closeCareerPost(postId);
}

/** Minimal post edit: extend closing date by N days from max(now, current). */
export async function extendCareerPostClosingDate(postId: string, days = 30): Promise<boolean> {
  const posts = readCareerPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post || (post.status !== "active" && post.status !== "paused")) return false;
  if (!Number.isFinite(days) || days <= 0) return false;

  const now = Date.now();
  const base = Math.max(now, post.closingDate > 0 ? post.closingDate : now);
  const prior = posts;
  const updated: CareerJobPost = {
    ...post,
    closingDate: base + days * 24 * 60 * 60 * 1000,
    updatedAt: now,
  };
  const next = posts.map((p) => (p.id === postId ? updated : p));

  if (!commitCareerPostsLocally(next, prior)) return false;

  const ok = await dualWritePostUpdate(updated, prior);
  if (!ok) return false;

  pushCareerActivity({
    postId,
    kind: "post_updated",
    title: "Closing date extended",
    body: `${post.jobTitle} closing date extended by ${days} day(s).`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  return true;
}

export async function deleteCareerPost(postId: string): Promise<boolean> {
  const posts = readCareerPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return false;

  const prior = posts;
  const next = posts.filter((p) => p.id !== postId);

  if (!commitCareerPostsLocally(next, prior)) return false;

  if (isCareerApiSyncEnabled()) {
    const serverPostId = resolveCareerGatePostId(postId);
    if (!serverPostId) {
      restoreCareerPostsLocally(prior);
      return false;
    }

    try {
      await careerGateApi.deleteCareerPost(serverPostId);
      return true;
    } catch {
      restoreCareerPostsLocally(prior);
      return false;
    }
  }

  return true;
}
