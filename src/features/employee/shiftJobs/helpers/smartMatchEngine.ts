// src/features/employee/shiftJobs/helpers/smartMatchEngine.ts
//
// Smart Match Engine — scores shift posts against worker profile.
// Higher score = better match. Used to show "Best Matches" section in search.
//
// Scoring factors:
//   Category match (past applications)  → +40
//   Experience level match              → +25
//   Availability match (weekday/weekend)→ +15
//   Availability broadcast active       → +10
//   Pay above median                    → +10

import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import type { ExperienceLevel } from "../../profile/storage/employeeProfile.storage";
import { workerPointsStorage } from "../../../../shared/rating/workerPointsStorage";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type MatchablePost = {
  id: string;
  companyName: string;
  jobName: string;
  category: string;
  experience: "helper" | "fresher_ok" | "experienced";
  payPerDay: number;
  locationName: string;
  distanceKm: number;
  startAt: number;
  endAt: number;
  isHiddenFromSearch?: boolean;
  mustHave?: string[];
  goodToHave?: string[];
};

export type MatchResult = {
  post: MatchablePost;
  score: number;
  reasons: string[];
};

/* ------------------------------------------------ */
/* Experience compatibility                         */
/* ------------------------------------------------ */
const EXP_COMPAT: Record<ExperienceLevel, ("helper" | "fresher_ok" | "experienced")[]> = {
  "fresher": ["helper", "fresher_ok"],
  "1-3":     ["helper", "fresher_ok", "experienced"],
  "3-7":     ["helper", "fresher_ok", "experienced"],
  "7+":      ["helper", "fresher_ok", "experienced"],
};

/* ------------------------------------------------ */
/* Applied categories from history                  */
/* ------------------------------------------------ */
function getAppliedCategorySet(): Set<string> {
  try {
    const appsRaw  = localStorage.getItem("wm_employee_shift_applications_v1");
    const postsRaw = localStorage.getItem("wm_employee_shift_posts_demo_v1");
    if (!appsRaw || !postsRaw) return new Set();

    const apps  = JSON.parse(appsRaw)  as Record<string, unknown>[];
    const posts = JSON.parse(postsRaw) as Record<string, unknown>[];

    const postCatMap = new Map<string, string>();
    for (const p of posts) {
      if (typeof p["id"] === "string" && typeof p["category"] === "string") {
        postCatMap.set(p["id"], p["category"]);
      }
    }

    const cats = new Set<string>();
    for (const a of apps) {
      const pid = a["postId"];
      if (typeof pid === "string") {
        const cat = postCatMap.get(pid);
        if (cat) cats.add(cat);
      }
    }
    return cats;
  } catch { return new Set(); }
}

/* ------------------------------------------------ */
/* Availability broadcast check                     */
/* ------------------------------------------------ */
function hasActiveBroadcast(): boolean {
  try {
    const raw = localStorage.getItem("wm_employee_availability_broadcast_v1");
    if (!raw) return false;
    const b = JSON.parse(raw) as { expiresAt?: number };
    return typeof b.expiresAt === "number" && Date.now() < b.expiresAt;
  } catch { return false; }
}

/* ------------------------------------------------ */
/* Score a single post                              */
/* ------------------------------------------------ */
export function scorePost(post: MatchablePost, medianPay: number): MatchResult {
  const profile       = employeeProfileStorage.get();
  const appliedCats   = getAppliedCategorySet();
  const broadcastOn   = hasActiveBroadcast();

  let score = 0;
  const reasons: string[] = [];

  /* Category match */
  if (appliedCats.has(post.category)) {
    score += 40;
    reasons.push(`Matches your ${post.category} experience`);
  } else if (post.category) {
    /* Partial: skills contain category keyword */
    const catLower = post.category.toLowerCase();
    const skillMatch = profile.skills.some((s) => s.toLowerCase().includes(catLower) || catLower.includes(s.toLowerCase()));
    if (skillMatch) { score += 20; reasons.push("Matches your skills"); }
  }

  /* Experience match */
  const compatList = EXP_COMPAT[profile.experience] ?? [];
  if (compatList.includes(post.experience)) {
    score += 25;
    reasons.push("Experience level matches");
  }

  /* Availability match */
  const startDay = new Date(post.startAt).getDay();
  const isWeekend = startDay === 0 || startDay === 6;
  if (isWeekend && profile.availability.weekends) {
    score += 15; reasons.push("Available on weekends");
  } else if (!isWeekend && profile.availability.weekdays) {
    score += 15; reasons.push("Available on weekdays");
  }

  /* Availability broadcast active */
  if (broadcastOn) {
    score += 10;
    reasons.push("You are broadcasting availability");
  }

  /* Pay above median */
  if (medianPay > 0 && post.payPerDay >= medianPay) {
    score += 10;
    reasons.push(`Pay ${post.payPerDay}/day (above average)`);
  }

  /* Worker rating boost */
  try {
    const wmId  = profile.uniqueId ?? "";
    const pts   = wmId ? workerPointsStorage.getByWmId(wmId) : null;
    const stars = pts ? (pts.total >= 300 ? 4.5 : pts.total >= 100 ? 4.0 : pts.total >= 50 ? 3.5 : 0) : 0;
    if (stars >= 4.5) { score += 20; reasons.push("Top-rated worker"); }
    else if (stars >= 4.0) { score += 12; reasons.push("Highly rated"); }
    else if (stars >= 3.5) { score += 6;  reasons.push("Good rating"); }
  } catch { /* safe */ }

  return { post, score, reasons };
}

/* ------------------------------------------------ */
/* Get top N matches from a list of posts           */
/* ------------------------------------------------ */
export function getTopMatches(posts: MatchablePost[], topN = 4): MatchResult[] {
  if (posts.length === 0) return [];

  /* Compute median pay */
  const pays  = posts.map((p) => p.payPerDay).sort((a, b) => a - b);
  const mid   = Math.floor(pays.length / 2);
  const median = pays.length % 2 === 0 ? (pays[mid - 1] + pays[mid]) / 2 : pays[mid];

  const results = posts
    .filter((p) => !p.isHiddenFromSearch)
    .map((p) => scorePost(p, median))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return results;
}

/* ------------------------------------------------ */
/* Standalone — reads posts directly from storage   */
/* (no React dependency — avoids render loops)      */
/* ------------------------------------------------ */
export function getTopMatchesFromStorage(topN = 4): MatchResult[] {
  try {
    const raw = localStorage.getItem("wm_employee_shift_posts_demo_v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MatchablePost[];
    if (!Array.isArray(parsed)) return [];
    const posts = parsed.filter(
      (p): p is MatchablePost =>
        !!p && typeof p === "object" &&
        typeof p.id === "string" &&
        typeof p.payPerDay === "number",
    );
    return getTopMatches(posts, topN);
  } catch { return []; }
}

/* ------------------------------------------------ */
/* Profile completeness check for match quality     */
/* ------------------------------------------------ */
export function getMatchQuality(): "high" | "medium" | "low" {
  const profile = employeeProfileStorage.get();
  let score = 0;
  if (profile.fullName.trim()) score++;
  if (profile.city.trim()) score++;
  if (profile.skills.length > 0) score++;
  if (profile.experience !== "fresher") score++;
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}