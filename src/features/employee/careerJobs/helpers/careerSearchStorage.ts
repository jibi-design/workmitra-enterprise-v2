// App name: Job Mitra
// File name: careerSearchStorage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerSearchStorage.ts
// P1: read merged employer-scoped search index (no unscoped global SoT).

import {
  CAREER_APPS_CHANGED,
  EMPLOYEE_CAREER_SEARCH_CHANGED,
} from "../../../career/helpers/careerStoragePublic";
import {
  getCareerSearchIndexFingerprint,
  mirrorCareerSearchIndexToCurrentEmployee,
  readMergedCareerSearchIndexRaw,
} from "../../../shared/career/careerSearchIndex.scope";
import { isFutureClosingDate, parseSearchPosts } from "./careerSearchSanitizers";
import type { CareerSearchPost } from "./careerSearchTypes";

const CAREER_POSTS_CHANGED = "wm:employer-career-posts-changed";

let cacheFingerprint: string | null = null;
let cacheList: CareerSearchPost[] = [];

export function getCareerSearchSnapshot(): CareerSearchPost[] {
  const fingerprint = getCareerSearchIndexFingerprint();
  if (fingerprint === cacheFingerprint) return cacheList;

  const raw = readMergedCareerSearchIndexRaw();
  cacheFingerprint = fingerprint;
  cacheList = parseSearchPosts(raw);

  // Keep worker-scoped mirror in sync for diagnostics / offline fingerprint.
  mirrorCareerSearchIndexToCurrentEmployee(raw);

  return cacheList;
}

export function getDiscoverableCareerPosts(posts: CareerSearchPost[]): CareerSearchPost[] {
  const now = Date.now();

  return posts.filter(
    (post) =>
      post.id && post.companyName && post.jobTitle && isFutureClosingDate(post.closingDate, now),
  );
}

export function subscribeCareerSearch(cb: () => void): () => void {
  const handler = () => cb();
  const events = [
    "storage",
    "focus",
    CAREER_POSTS_CHANGED,
    CAREER_APPS_CHANGED,
    EMPLOYEE_CAREER_SEARCH_CHANGED,
  ];

  for (const ev of events) {
    window.addEventListener(ev, handler);
  }

  document.addEventListener("visibilitychange", handler);

  return () => {
    for (const ev of events) {
      window.removeEventListener(ev, handler);
    }

    document.removeEventListener("visibilitychange", handler);
  };
}
