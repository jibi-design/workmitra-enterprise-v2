// App name: Job Mitra
// File name: shiftSearchViewHelpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\helpers\shiftSearchViewHelpers.ts

import type { ShiftCardData } from "../components/ShiftSearchSections";
import type {
  ExperienceLabel,
  ShiftApplicationRecord,
  ShiftApplicationStatus,
  ShiftPostDemo,
  ShiftWorkspaceRecord,
  ShiftWorkspaceStatus,
} from "../types/shiftSearch.types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function formatShiftDateRange(startAt: number, endAt: number): string {
  try {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const sameDay = start.toDateString() === end.toDateString();
    const startText = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const endText = end.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return sameDay ? startText : `${startText} - ${endText}`;
  } catch {
    return "Date not specified";
  }
}

export function formatShiftDayLabel(startAt: number): string {
  try {
    return new Date(startAt).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Date not specified";
  }
}

export function formatShiftTiming(startAt: number, endAt: number): string {
  try {
    const start = new Date(startAt);
    const end = new Date(endAt);

    const startText = start.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    const endText = end.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${startText} - ${endText}`;
  } catch {
    return "Timing not specified";
  }
}

export function formatShiftDuration(startAt: number, endAt: number): string {
  if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || endAt <= startAt) {
    return "Duration not specified";
  }

  const dayCount = Math.max(1, Math.ceil((endAt - startAt) / DAY_MS));
  return dayCount === 1 ? "1 day" : `${dayCount} days`;
}

export function experienceLabel(value: ExperienceLabel): string {
  if (value === "fresher_ok") return "No experience needed";
  if (value === "helper") return "Helper friendly";
  return "Experienced";
}

export function isApplicationBlockingDiscovery(status: ShiftApplicationStatus): boolean {
  return (
    status === "applied" ||
    status === "shortlisted" ||
    status === "waiting" ||
    status === "confirmed" ||
    status === "exited"
  );
}

export function isWorkspaceBlockingDiscovery(status: ShiftWorkspaceStatus): boolean {
  return (
    status === "active" ||
    status === "upcoming" ||
    status === "completed" ||
    status === "left" ||
    status === "replaced" ||
    status === "cancelled"
  );
}

export function isShiftOpenForDiscovery(post: ShiftPostDemo, now = Date.now()): boolean {
  if (post.isHiddenFromSearch) return false;
  if (!Number.isFinite(post.endAt)) return false;
  return post.endAt >= now;
}

export function getBlockedPostIds(
  applications: ShiftApplicationRecord[],
  workspaces: ShiftWorkspaceRecord[],
): Set<string> {
  const ids = new Set<string>();

  for (const app of applications) {
    if (isApplicationBlockingDiscovery(app.status)) {
      ids.add(app.postId);
    }
  }

  for (const workspace of workspaces) {
    if (isWorkspaceBlockingDiscovery(workspace.status)) {
      ids.add(workspace.postId);
    }
  }

  return ids;
}

export function toShiftCardData(post: ShiftPostDemo): ShiftCardData {
  return {
    id: post.id,
    jobName: post.jobName,
    companyName: post.companyName,
    payPerDay: post.payPerDay,
    locationName: post.locationName,
    distanceKm: post.distanceKm,
    category: post.category,
    dateLabel: formatShiftDateRange(post.startAt, post.endAt),
    timingLabel: formatShiftTiming(post.startAt, post.endAt),
    durationLabel: formatShiftDuration(post.startAt, post.endAt),
    workerTypeLabel: experienceLabel(post.experience),
  };
}

export function getShiftCategories(posts: ShiftPostDemo[]): string[] {
  const categories = new Set<string>();
  for (const post of posts) {
    if (post.category) categories.add(post.category);
  }
  return Array.from(categories).sort();
}
