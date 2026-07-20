// App name: Job Mitra
// File name: smartMatchEngine.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\helpers\smartMatchEngine.ts

import { workerPointsStorage } from "../../../../shared/rating/workerPointsStorage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import type { ExperienceLevel } from "../../profile/storage/employeeProfile.storage";

export type ShiftPayBasis = "per_hour" | "per_day" | "fixed_total" | "not_listed";

export type MatchablePost = {
  id: string;
  companyName: string;
  jobName: string;
  category: string;
  experience: "helper" | "fresher_ok" | "experienced";
  payPerDay: number;
  payBasis?: ShiftPayBasis;
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

export type MatchQuality = "high" | "medium" | "low" | "profile incomplete";

const EXP_COMPAT: Record<ExperienceLevel, ("helper" | "fresher_ok" | "experienced")[]> = {
  fresher: ["helper", "fresher_ok"],
  "1-3": ["helper", "fresher_ok", "experienced"],
  "3-7": ["helper", "fresher_ok", "experienced"],
  "7+": ["helper", "fresher_ok", "experienced"],
};

export function hasMinimumSmartMatchProfile(): boolean {
  const profile = employeeProfileStorage.get();

  return Boolean(profile.city.trim()) && profile.skills.length > 0;
}

function getAppliedCategorySet(): Set<string> {
  try {
    const appsRaw = localStorage.getItem("wm_employee_shift_applications_v1");
    const postsRaw = localStorage.getItem("wm_employer_shift_posts_v1");
    if (!appsRaw || !postsRaw) return new Set();

    const apps = JSON.parse(appsRaw) as Record<string, unknown>[];
    const posts = JSON.parse(postsRaw) as Record<string, unknown>[];

    const postCatMap = new Map<string, string>();
    for (const post of posts) {
      if (typeof post["id"] === "string" && typeof post["category"] === "string") {
        postCatMap.set(post["id"], post["category"]);
      }
    }

    const cats = new Set<string>();
    for (const app of apps) {
      const postId = app["postId"];
      if (typeof postId === "string") {
        const category = postCatMap.get(postId);
        if (category) cats.add(category);
      }
    }

    return cats;
  } catch {
    return new Set();
  }
}

function hasActiveBroadcast(): boolean {
  try {
    const raw = localStorage.getItem("wm_employee_availability_broadcast_v1");
    if (!raw) return false;

    const broadcast = JSON.parse(raw) as {
      expiresAt?: number;
      selectedDates?: string[];
      window?: string;
    };

    if (typeof broadcast.expiresAt !== "number" || Date.now() >= broadcast.expiresAt) {
      return false;
    }

    if (Array.isArray(broadcast.selectedDates) && broadcast.selectedDates.length > 0) {
      return true;
    }

    return broadcast.window === "today" || broadcast.window === "this_week";
  } catch {
    return false;
  }
}

function formatShiftPayReason(amount: number, payBasis: ShiftPayBasis | undefined): string | null {
  if (payBasis === "not_listed") return "Pay not listed";
  if (payBasis === "per_hour") return amount > 0 ? `Pay listed: ${amount} / hour` : null;
  if (payBasis === "fixed_total") return amount > 0 ? `Pay listed: ${amount} total` : null;

  return amount > 0 ? `Pay listed: ${amount} / day` : null;
}

export function scorePost(post: MatchablePost): MatchResult {
  const profile = employeeProfileStorage.get();
  const appliedCats = getAppliedCategorySet();
  const broadcastOn = hasActiveBroadcast();

  let score = 0;
  const reasons: string[] = [];

  if (!hasMinimumSmartMatchProfile()) {
    return { post, score: 0, reasons: ["Complete your profile to get accurate shift matches"] };
  }

  if (appliedCats.has(post.category)) {
    score += 40;
    reasons.push(`Matches your ${post.category} experience`);
  } else if (post.category) {
    const catLower = post.category.toLowerCase();
    const skillMatch = profile.skills.some(
      (skill) => skill.toLowerCase().includes(catLower) || catLower.includes(skill.toLowerCase()),
    );

    if (skillMatch) {
      score += 20;
      reasons.push("Matches your skills");
    }
  }

  const compatList = EXP_COMPAT[profile.experience] ?? [];
  if (compatList.includes(post.experience)) {
    score += 25;
    reasons.push("Experience level matches");
  }

  const startDay = new Date(post.startAt).getDay();
  const isWeekend = startDay === 0 || startDay === 6;

  if (isWeekend && profile.availability.weekends) {
    score += 15;
    reasons.push("Available on weekends");
  } else if (!isWeekend && profile.availability.weekdays) {
    score += 15;
    reasons.push("Available on weekdays");
  }

  if (broadcastOn) {
    score += 10;
    reasons.push("You are broadcasting availability");
  }

  const payReason = formatShiftPayReason(post.payPerDay, post.payBasis);
  if (payReason) {
    reasons.push(payReason);
  }

  try {
    const wmId = profile.uniqueId ?? "";
    const points = wmId ? workerPointsStorage.getByWmId(wmId) : null;
    const stars = points
      ? points.total >= 300
        ? 4.5
        : points.total >= 100
          ? 4.0
          : points.total >= 50
            ? 3.5
            : 0
      : 0;

    if (stars >= 4.5) {
      score += 20;
      reasons.push("Top-rated worker");
    } else if (stars >= 4.0) {
      score += 12;
      reasons.push("Highly rated");
    } else if (stars >= 3.5) {
      score += 6;
      reasons.push("Good rating");
    }
  } catch {
    /* demo-safe */
  }

  return { post, score, reasons };
}

export function getTopMatches(posts: MatchablePost[], topN = 4): MatchResult[] {
  if (posts.length === 0) return [];
  if (!hasMinimumSmartMatchProfile()) return [];

  return posts
    .filter((post) => !post.isHiddenFromSearch)
    .map((post) => scorePost(post))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

export function getMatchQuality(): MatchQuality {
  const profile = employeeProfileStorage.get();

  if (!hasMinimumSmartMatchProfile()) {
    return "profile incomplete";
  }

  let score = 0;

  if (profile.fullName.trim()) score += 1;
  if (profile.city.trim()) score += 1;
  if (profile.skills.length > 0) score += 1;
  if (profile.experience !== "fresher") score += 1;

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}
