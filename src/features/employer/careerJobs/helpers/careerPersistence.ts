// App name: Job Mitra
// File name: careerPersistence.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerPersistence.ts

import type {
  CareerApplication,
  CareerJobPost,
  CareerWorkspace,
  EmployerCareerActivityEntry,
} from "../types/careerTypes";
import {
  CAREER_APPS_KEY,
  CAREER_WORKSPACES_KEY,
  notifyCareerActivityChanged,
  notifyCareerAppsChanged,
  notifyCareerPostsChanged,
  notifyCareerWorkspacesChanged,
  safeParse,
  safeWrite,
  type CareerStorageWriteResult,
} from "./careerStorageUtils";
import { resolveCareerEmployerScopedKey } from "../../../shared/career/careerEmployerScope";
import { normalizeCareerActivity } from "./careerActivityNormalizers";
import { normalizeCareerApplication } from "./careerApplicationNormalizers";
import { normalizeCareerPost } from "./careerPostNormalizers";
import { normalizeCareerWorkspace } from "./careerWorkspaceNormalizers";

function careerPostsKey(): string {
  return resolveCareerEmployerScopedKey("career_posts_v1");
}

function careerActivityKey(): string {
  return resolveCareerEmployerScopedKey("career_activity_log_v1");
}

export function readCareerPosts(): CareerJobPost[] {
  const raw = localStorage.getItem(careerPostsKey());

  return safeParse<unknown>(raw)
    .map(normalizeCareerPost)
    .filter((item): item is CareerJobPost => item !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function readCareerApps(): CareerApplication[] {
  const raw = localStorage.getItem(CAREER_APPS_KEY);

  return safeParse<unknown>(raw)
    .map(normalizeCareerApplication)
    .filter((item): item is CareerApplication => item !== null)
    .sort((a, b) => b.appliedAt - a.appliedAt);
}

export function readCareerWorkspaces(): CareerWorkspace[] {
  const raw = localStorage.getItem(CAREER_WORKSPACES_KEY);

  return safeParse<unknown>(raw)
    .map(normalizeCareerWorkspace)
    .filter((item): item is CareerWorkspace => item !== null);
}

export function readCareerActivityAll(): EmployerCareerActivityEntry[] {
  const raw = localStorage.getItem(careerActivityKey());

  return safeParse<unknown>(raw)
    .map(normalizeCareerActivity)
    .filter((item): item is EmployerCareerActivityEntry => item !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export type { CareerStorageWriteResult };

export function writeCareerPosts(posts: CareerJobPost[]): CareerStorageWriteResult {
  const result = safeWrite(careerPostsKey(), posts);
  if (!result.ok) return result;
  notifyCareerPostsChanged();
  return { ok: true };
}

export function writeCareerApps(apps: CareerApplication[]): CareerStorageWriteResult {
  const result = safeWrite(CAREER_APPS_KEY, apps);
  if (!result.ok) return result;
  notifyCareerAppsChanged();
  return { ok: true };
}

export function writeCareerWorkspaces(list: CareerWorkspace[]): CareerStorageWriteResult {
  const result = safeWrite(CAREER_WORKSPACES_KEY, list);
  if (!result.ok) return result;
  notifyCareerWorkspacesChanged();
  return { ok: true };
}

export function writeCareerActivityAll(
  list: EmployerCareerActivityEntry[],
): CareerStorageWriteResult {
  const result = safeWrite(careerActivityKey(), list);
  if (!result.ok) return result;
  notifyCareerActivityChanged();
  return { ok: true };
}
