// App name: Job Mitra
// File name: careerSearchStorage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerSearchStorage.ts

import {
  CAREER_APPS_CHANGED,
  EMPLOYEE_SEARCH_CAREER_KEY,
  EMPLOYEE_CAREER_SEARCH_CHANGED,
  safeRead,
} from "../../../career/helpers/careerStoragePublic";
import { isFutureClosingDate, parseSearchPosts } from "./careerSearchSanitizers";
import type { CareerSearchPost } from "./careerSearchTypes";

const SEARCH_KEY = EMPLOYEE_SEARCH_CAREER_KEY;
const CAREER_POSTS_CHANGED = "wm:employer-career-posts-changed";

let cacheRaw: string | null = null;
let cacheList: CareerSearchPost[] = [];

export function getCareerSearchSnapshot(): CareerSearchPost[] {
  const raw = safeRead(SEARCH_KEY);

  if (raw === cacheRaw) return cacheList;

  cacheRaw = raw;
  cacheList = parseSearchPosts(raw);
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
