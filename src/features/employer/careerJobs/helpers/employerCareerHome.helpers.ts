// App name: Job Mitra
// File name: employerCareerHome.helpers.ts
// Home KPI snapshot — posts + apps reactive (Wave 2)

import type { CareerJobPost } from "../types/careerTypes";
import { CAREER_APPS_CHANGED } from "./careerStorageUtils";
import { resolveCareerEmployerScopedKey } from "../../../shared/career/careerEmployerScope";
import { readCareerApps, readCareerPosts } from "./careerNormalizers";
import { getCareerEmployerAppsStorageKey } from "./careerPersistence";
import { recomputePostAnalytics } from "./careerValidation";
import { CAREER_EVENTS } from "../services/careerPipelineService";

export type CareerPostStatusDisplay = {
  label: string;
  color: string;
};

let cachedPostsRaw: string | null = "__init__";
let cachedAppsRaw: string | null = "__init__";
let cachedPosts: CareerJobPost[] = [];

function recomputeHomePosts(): CareerJobPost[] {
  const posts = readCareerPosts();
  const apps = readCareerApps();
  return posts.map((post) => recomputePostAnalytics(post, apps));
}

export function getCareerHomePostsSnapshot(): CareerJobPost[] {
  const postsRaw = localStorage.getItem(resolveCareerEmployerScopedKey("career_posts_v1"));
  const appsRaw = localStorage.getItem(getCareerEmployerAppsStorageKey());

  if (postsRaw !== cachedPostsRaw || appsRaw !== cachedAppsRaw) {
    cachedPostsRaw = postsRaw;
    cachedAppsRaw = appsRaw;
    cachedPosts = recomputeHomePosts();
  }

  return cachedPosts;
}

export function subscribeCareerHomePosts(callback: () => void): () => void {
  const handler = () => callback();

  window.addEventListener(CAREER_EVENTS.careerPostsChanged, handler);
  window.addEventListener(CAREER_APPS_CHANGED, handler);
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);

  return () => {
    window.removeEventListener(CAREER_EVENTS.careerPostsChanged, handler);
    window.removeEventListener(CAREER_APPS_CHANGED, handler);
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

  if (post.status === "active" && post.closingDate > 0 && post.closingDate < Date.now()) {
    return { label: "Expired", color: "var(--wm-warning)" };
  }

  return { label: "Active", color: "var(--wm-er-accent-career)" };
}

export const CAREER_HOME_HOW_IT_WORKS = [
  { n: "1", text: "Create a career post with job details and requirements" },
  { n: "2", text: "Applicants find your post and apply with their profile" },
  { n: "3", text: "Shortlist candidates and schedule interviews" },
  { n: "4", text: "Send offers and hire - a workspace is created automatically" },
] as const;
