/** Job Mitra | employeeApplyTicker.ts | Home strip fallback from live applications */

import type { ShiftApplicationData, ShiftPostData } from "../../employee/shiftJobs/types/shiftApplicationTypes";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import type { InboxTickerItem } from "./latestUnreadInboxPreview";

function newest(
  apps: readonly ShiftApplicationData[],
  status: ShiftApplicationData["status"],
): ShiftApplicationData | null {
  let best: ShiftApplicationData | null = null;
  for (const app of apps) {
    if (app.status !== status) continue;
    if (!best || app.createdAt > best.createdAt) best = app;
  }
  return best;
}

function applyDetailLine(
  app: ShiftApplicationData,
  posts: readonly ShiftPostData[],
): string {
  const post = posts.find((row) => row.id === app.postId);
  const job = post?.jobName.trim() ?? "";
  const company = post?.companyName.trim() ?? "";
  const action = app.status === "shortlisted" ? "Shortlisted" : "Applied";
  const bits = [action, job, company].filter(Boolean);
  return bits.join(" · ");
}

export function listEmployeeApplyTicker(
  apps: readonly ShiftApplicationData[],
  posts: readonly ShiftPostData[] = [],
  limit = 5,
): InboxTickerItem[] {
  const ranked = [...apps]
    .filter((app) => app.status === "shortlisted" || app.status === "applied" || app.status === "waiting")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
  const rows: InboxTickerItem[] = [];
  for (const app of ranked) {
    const detail = applyDetailLine(app, posts);
    rows.push({
      id: `app:${app.id}`,
      domain: "shift",
      title:
        app.status === "shortlisted"
          ? "You have been shortlisted for a shift"
          : "Application submitted",
      body: detail,
      createdAt: app.createdAt,
      route: ROUTE_PATHS.employeeShiftApplications,
    });
  }
  return rows;
}

export function pickEmployeeApplyTicker(
  apps: readonly ShiftApplicationData[],
): InboxTickerItem | null {
  const shortlisted = newest(apps, "shortlisted");
  if (shortlisted) {
    return {
      id: `app:${shortlisted.id}`,
      domain: "shift",
      title: "You have been shortlisted for a shift",
      createdAt: shortlisted.createdAt,
      route: ROUTE_PATHS.employeeShiftApplications,
    };
  }
  const applied = newest(apps, "applied") ?? newest(apps, "waiting");
  if (!applied) return null;
  return {
    id: `app:${applied.id}`,
    domain: "shift",
    title: "Application submitted",
    createdAt: applied.createdAt,
    route: ROUTE_PATHS.employeeShiftApplications,
  };
}
