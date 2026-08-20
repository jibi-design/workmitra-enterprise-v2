/** Pull Shift / Career / Planner / HR feeds into local snapshots for the OS ribbon. */

import { isCareerApiSyncEnabled } from "../../../career/services/careerGateApi.bridge";
import { hydrateCareerApplicationsForPostFromServer } from "../../../career/services/careerDbTruth.service";
import { hydrateCareerPostsFromServer } from "../../../career/services/careerPostDbTruth.service";
import { getCareerPostsSnapshot } from "../../careerJobs/helpers/careerDashboardHelpers";
import { hydratePlannerPlansFromServer } from "../../planner/services/plannerDbTruth.service";
import { hrGateApi, isHrApiSyncEnabled } from "../../hrManagement/services/hrGateApi.service";
import { getPostsSnapshot } from "../../shiftJobs/helpers/dashboardHelpers.snapshots";
import {
  hydrateEmployerPostApplicationsFromServer,
  hydrateShiftPostsFromServer,
} from "../../../shift/services/shiftDbTruth.service";
import { isShiftApiSyncEnabled } from "../../../shift/services/shiftGateApi.service";
import { isLiveShiftOwnedPost } from "./employerDashboard.osShift";
import { countHrClockedInToday } from "./employerDashboard.osExtras";

const APP_HYDRATE_CAP = 12;

export type OsLiveHydrateResult = {
  readonly ok: boolean;
  readonly hrClockedIn: number;
};

async function hydrateShiftLane(): Promise<boolean> {
  if (!isShiftApiSyncEnabled()) return true;
  const postsOk = await hydrateShiftPostsFromServer();
  const posts = getPostsSnapshot().filter(isLiveShiftOwnedPost).slice(0, APP_HYDRATE_CAP);
  await Promise.all(posts.map((post) => hydrateEmployerPostApplicationsFromServer(post.id)));
  return postsOk;
}

async function hydrateCareerLane(): Promise<boolean> {
  if (!isCareerApiSyncEnabled()) return true;
  try {
    const posts = await hydrateCareerPostsFromServer();
    const ids = posts
      .filter((post) => post.status === "active" || post.status === "paused")
      .slice(0, APP_HYDRATE_CAP)
      .map((post) => post.id);
    const fallbackIds =
      ids.length > 0
        ? ids
        : getCareerPostsSnapshot()
            .slice(0, APP_HYDRATE_CAP)
            .map((post) => post.id);
    await Promise.all(fallbackIds.map((id) => hydrateCareerApplicationsForPostFromServer(id)));
    return true;
  } catch {
    return false;
  }
}

async function hydratePlannerLane(): Promise<boolean> {
  try {
    await hydratePlannerPlansFromServer();
    return true;
  } catch {
    return false;
  }
}

async function readHrClockedIn(): Promise<number> {
  if (!isHrApiSyncEnabled()) return 0;
  try {
    const logs = await hrGateApi.listAttendanceLogs();
    return countHrClockedInToday(logs);
  } catch {
    return 0;
  }
}

async function pingApiHealth(): Promise<boolean> {
  try {
    const res = await fetch("/v1/jobmitra/health", { credentials: "include" });
    if (!res.ok) return false;
    const body = (await res.json()) as { ok?: boolean; db?: { ok?: boolean } };
    return body.ok === true && body.db?.ok === true;
  } catch {
    return false;
  }
}

export async function hydrateEmployerOsLiveFeeds(): Promise<OsLiveHydrateResult> {
  const [, , , hrClockedIn, healthOk] = await Promise.all([
    hydrateShiftLane(),
    hydrateCareerLane(),
    hydratePlannerLane(),
    readHrClockedIn(),
    pingApiHealth(),
  ]);
  return {
    ok: healthOk,
    hrClockedIn,
  };
}
