// App name: Job Mitra
// File name: shiftSearchFilters.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\helpers\shiftSearchFilters.ts

import type { DurOpt, ExpOpt, ShiftPostDemo, TimeOpt } from "../types/shiftSearch.types";

export function isWithinTime(post: ShiftPostDemo, timeOpt: TimeOpt): boolean {
  if (timeOpt === "any") return true;

  const now = Date.now();
  const dayMs = 86400000;

  if (timeOpt === "today") {
    return new Date(post.startAt).toDateString() === new Date(now).toDateString();
  }

  if (timeOpt === "next3") {
    return post.startAt <= now + dayMs * 3;
  }

  if (timeOpt === "week") {
    return post.startAt <= now + dayMs * 7;
  }

  if (timeOpt === "weekend") {
    const day = new Date(post.startAt).getDay();
    return day === 0 || day === 6;
  }

  return true;
}

export function isDuration(post: ShiftPostDemo, durOpt: DurOpt): boolean {
  if (durOpt === "any") return true;

  const days = Math.round((post.endAt - post.startAt) / 86400000) + 1;
  return durOpt === "oneday" ? days <= 1 : days >= 2;
}

export function filterShiftPosts(params: {
  posts: ShiftPostDemo[];
  searchQuery: string;
  timeOpt: TimeOpt;
  exp: ExpOpt;
  catFilter: string;
  dur: DurOpt;
}): ShiftPostDemo[] {
  const q = params.searchQuery.trim().toLowerCase();

  return params.posts
    .filter((post) => {
      if (!q) return true;
      return `${post.jobName} ${post.companyName} ${post.locationName} ${post.category}`
        .toLowerCase()
        .includes(q);
    })
    .filter((post) => isWithinTime(post, params.timeOpt))
    .filter((post) => (params.exp === "any" ? true : post.experience === params.exp))
    .filter((post) => (params.catFilter === "any" ? true : post.category === params.catFilter))
    .filter((post) => isDuration(post, params.dur))
    .sort((a, b) => a.startAt - b.startAt);
}

export function hasActiveShiftSearchFilters(params: {
  timeOpt: TimeOpt;
  exp: ExpOpt;
  catFilter: string;
  dur: DurOpt;
  searchQuery: string;
}): boolean {
  return (
    params.timeOpt !== "any" ||
    params.exp !== "any" ||
    params.catFilter !== "any" ||
    params.dur !== "any" ||
    params.searchQuery.trim().length > 0
  );
}
