/** Job Mitra | dailyOs.activity.helpers.ts | Merge domain events into a read-only feed */

import type { AppLite } from "../../careerJobs/types/careerApplicationTypes";
import type { EmployeeNotification } from "../../notifications/storage/employeeNotifications.storage";
import { isPlannerApplication } from "../../planner/helpers/plannerDomainFilters";
import type { ShiftApplicationData, ShiftPostData } from "../../shiftJobs/types/shiftApplicationTypes";
import { mapApplicationStatus } from "./candidateDashboard.helpers";
import {
  activityLaneFallback,
  careerActivityRoute,
  sanitizeEmployeeRoute,
  shiftActivityRoute,
} from "./dailyOs.routes.helpers";
import type { DailyOsActivityItem, DailyOsLane } from "./dailyOs.types";

function laneFromNotification(note: EmployeeNotification): DailyOsLane {
  const route = (note.route ?? "").toLowerCase();
  if (route.includes("/planner") || route.includes("gig")) return "planner";
  if (note.domain === "career" || note.domain === "employment") return "career";
  return "shift";
}

export function buildDailyOsActivity(args: {
  readonly notes: readonly EmployeeNotification[];
  readonly careerApps: readonly AppLite[];
  readonly shiftApps: readonly ShiftApplicationData[];
  readonly posts: readonly ShiftPostData[];
  readonly limit?: number;
}): DailyOsActivityItem[] {
  const items: DailyOsActivityItem[] = [];
  const postMap = new Map(args.posts.map((p) => [p.id, p]));

  for (const note of args.notes) {
    const lane = laneFromNotification(note);
    items.push({
      id: `note:${note.id}`,
      lane,
      title: note.title,
      detail: (note.body ?? "").trim() || note.domain,
      at: note.createdAt,
      route: sanitizeEmployeeRoute(note.route, activityLaneFallback(lane)),
    });
  }

  for (const app of args.careerApps) {
    const status = mapApplicationStatus(String(app.stage));
    items.push({
      id: `career:${app.id}:${app.updatedAt}`,
      lane: "career",
      title: `Career · ${status}`,
      detail: app.offerDetails?.jobTitle?.trim() || "Application updated",
      at: app.updatedAt || app.appliedAt,
      route: careerActivityRoute(),
    });
  }

  for (const app of args.shiftApps) {
    const planner = isPlannerApplication(app);
    const post = postMap.get(app.postId);
    items.push({
      id: `${planner ? "planner" : "shift"}:${app.id}:${app.status}`,
      lane: planner ? "planner" : "shift",
      title: planner ? `Planner · ${app.status}` : `Shift · ${app.status}`,
      detail: post?.jobName?.trim() || (planner ? "Demand plan update" : "Shift update"),
      at: app.createdAt,
      route: shiftActivityRoute({ planner, planId: app.planId, postId: app.postId }),
    });
  }

  return items
    .filter((item) => item.at > 0 && item.title.trim().length > 0)
    .sort((a, b) => b.at - a.at)
    .slice(0, args.limit ?? 6);
}
