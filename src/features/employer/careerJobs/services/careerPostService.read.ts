// careerPostService.read.ts — Read operations for career posts

import { hydrateCareerPostsFromServer } from "../../../career/services/careerPostDbTruth.service";
import { hydrateCareerApplicationsForPostFromServer } from "../../../career/services/careerDbTruth.service";
import { isCareerApiSyncEnabled } from "../../../career/services/careerGateApi.service";
import type {
  CareerJobPost,
  CareerApplication,
  EmployerCareerActivityEntry,
} from "../types/careerTypes";
import {
  readCareerPosts,
  readCareerApps,
  readCareerActivityAll,
} from "../helpers/careerNormalizers";
import { recomputePostAnalytics } from "../helpers/careerValidation";

export function getCareerPosts(): CareerJobPost[] {
  if (isCareerApiSyncEnabled()) {
    void hydrateCareerPostsFromServer();
  }

  const posts = readCareerPosts();
  const apps = readCareerApps();
  // Analytics only — do not write search index on every read (Wave 2 P1-7).
  return posts.map((p) => recomputePostAnalytics(p, apps));
}

export async function loadCareerPosts(): Promise<CareerJobPost[]> {
  if (isCareerApiSyncEnabled()) {
    await hydrateCareerPostsFromServer();
  }
  return getCareerPosts();
}

export function getCareerPost(postId: string): CareerJobPost | null {
  return getCareerPosts().find((p) => p.id === postId) ?? null;
}

export function getCareerApplicationsForPost(postId: string): CareerApplication[] {
  if (isCareerApiSyncEnabled()) {
    void hydrateCareerApplicationsForPostFromServer(postId);
  }
  return readCareerApps().filter((a) => a.jobId === postId);
}

export function getCareerApplication(appId: string): CareerApplication | null {
  return readCareerApps().find((a) => a.id === appId) ?? null;
}

export function getCareerActivityForPost(postId: string): EmployerCareerActivityEntry[] {
  return readCareerActivityAll()
    .filter((a) => a.postId === postId)
    .slice(0, 50);
}

export function getCareerTemplates(): CareerJobPost[] {
  return readCareerPosts().filter((p) => p.isTemplate);
}
