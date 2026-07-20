// App name: Job Mitra
// File name: employerCareerHome.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\employerCareerHome.helpers.ts

import type { CareerJobPost } from "../types/careerTypes";
import { CAREER_POSTS_KEY } from "./careerStorageUtils";
import { getCareerPosts } from "../services/careerPostService";
import { CAREER_EVENTS } from "../services/careerPipelineService";

export type CareerPostStatusDisplay = {
  label: string;
  color: string;
};

let cachedRaw: string | null = "__init__";
let cachedPosts: CareerJobPost[] = [];

export function getCareerHomePostsSnapshot(): CareerJobPost[] {
  const raw = localStorage.getItem(CAREER_POSTS_KEY);

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedPosts = getCareerPosts();
  }

  return cachedPosts;
}

export function subscribeCareerHomePosts(callback: () => void): () => void {
  const handler = () => callback();

  window.addEventListener(CAREER_EVENTS.careerPostsChanged, handler);
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);

  return () => {
    window.removeEventListener(CAREER_EVENTS.careerPostsChanged, handler);
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

export function getCareerHomeStatusDisplay(post: CareerJobPost): CareerPostStatusDisplay {
  if (post.status === "filled") return { label: "Filled", color: "var(--wm-success)" };
  if (post.status === "closed") return { label: "Closed", color: "var(--wm-er-muted)" };
  if (post.status === "paused") return { label: "Paused", color: "var(--wm-warning)" };
  if (post.status === "draft") return { label: "Draft", color: "var(--wm-er-muted)" };

  return { label: "Active", color: "var(--wm-er-accent-career)" };
}

export const CAREER_HOME_HOW_IT_WORKS = [
  { n: "1", text: "Create a career post with job details and requirements" },
  { n: "2", text: "Applicants find your post and apply with their profile" },
  { n: "3", text: "Shortlist candidates and schedule interviews" },
  { n: "4", text: "Send offers and hire - a workspace is created automatically" },
] as const;
