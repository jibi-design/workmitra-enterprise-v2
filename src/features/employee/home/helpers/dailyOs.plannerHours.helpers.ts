/** Job Mitra | dailyOs.plannerHours.helpers.ts | Planner-lane week hours (not Shift). */

import { isPlannerApplication } from "../../planner/helpers/plannerDomainFilters";
import type { ShiftApplicationData, ShiftPostData } from "../../shiftJobs/types/shiftApplicationTypes";
import { addDays, dateFromKey, toDateKey } from "./dailyOs.helpers";
import type { DailyOsPlannerHours } from "./dailyOs.types";

const ACTIVE = new Set(["applied", "shortlisted", "waiting", "confirmed"]);

function hoursFromPost(post: ShiftPostData | undefined): number {
  if (!post) return 8;
  const span = (post.endAt - post.startAt) / 3_600_000;
  if (span >= 1 && span <= 16) return Math.round(span * 10) / 10;
  return 8;
}

function dateKeyFromTs(ts: number): string {
  return toDateKey(new Date(ts));
}

function appDayKeys(app: ShiftApplicationData, post: ShiftPostData | undefined): string[] {
  if (app.selectedDates && app.selectedDates.length > 0) return app.selectedDates;
  if (post) return [dateKeyFromTs(post.startAt)];
  return [];
}

export function computePlannerWeekHours(
  apps: readonly ShiftApplicationData[],
  posts: readonly ShiftPostData[],
  todayKey: string,
): DailyOsPlannerHours {
  const postMap = new Map(posts.map((p) => [p.id, p]));
  const endKey = toDateKey(addDays(dateFromKey(todayKey), 6));
  let scheduledHours = 0;
  let plannedHours = 0;
  let confirmedDays = 0;
  let plannedDays = 0;

  for (const app of apps) {
    if (!isPlannerApplication(app) || !ACTIVE.has(app.status)) continue;
    const post = postMap.get(app.postId);
    const hours = hoursFromPost(post);
    for (const day of appDayKeys(app, post)) {
      if (day < todayKey || day > endKey) continue;
      plannedHours += hours;
      plannedDays += 1;
      if (app.status === "confirmed") {
        scheduledHours += hours;
        confirmedDays += 1;
      }
    }
  }

  return { scheduledHours, plannedHours, confirmedDays, plannedDays };
}
