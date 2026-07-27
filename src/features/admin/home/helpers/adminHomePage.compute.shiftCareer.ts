import type { AdminHomeActivityItem } from "../components/AdminHomeSharedUi";
import {
  ADMIN_HOME_STORAGE_KEYS,
  isRec,
  safeArr,
  safeNum,
  safeStr,
} from "./adminHomePage.storage.utils";

const K = ADMIN_HOME_STORAGE_KEYS;

export type ShiftCareerComputeResult = {
  sp: unknown[];
  sa: unknown[];
  sw: unknown[];
  cp: unknown[];
  ca: unknown[];
  cw: unknown[];
  shiftActive: number;
  shiftCompleted: number;
  shiftCancelled: number;
  shiftTotalVacancies: number;
  shiftTotalConfirmed: number;
  shiftAppsApplied: number;
  shiftShortlisted: number;
  shiftConfirmed: number;
  shiftRejected: number;
  shiftWorkspacesActive: number;
  shiftFillRate: number;
  careerActive: number;
  careerPaused: number;
  careerClosed: number;
  careerAppsApplied: number;
  careerShortlisted: number;
  careerInterview: number;
  careerOffered: number;
  careerHired: number;
  careerRejected: number;
  careerWorkspacesActive: number;
  careerConversion: number;
  employeeIdSet: Set<string>;
  activity: AdminHomeActivityItem[];
};

export function computeShiftCareerMetrics(): ShiftCareerComputeResult {
  const sp = safeArr(K.shiftPosts);
  const sa = safeArr(K.shiftApps);
  const sw = safeArr(K.shiftWorkspaces);
  const sLog = safeArr(K.shiftLog);
  const cp = safeArr(K.careerPosts);
  const ca = safeArr(K.careerApps);
  const cw = safeArr(K.careerWorkspaces);
  const cLog = safeArr(K.careerLog);

  let shiftActive = 0;
  let shiftCompleted = 0;
  const shiftCancelled = 0;
  let shiftTotalVacancies = 0;
  let shiftTotalConfirmed = 0;

  for (const post of sp) {
    if (!isRec(post)) continue;

    const status = safeStr(post, "status");

    if (status === "completed") {
      shiftCompleted += 1;
    } else if (status !== "cancelled") {
      shiftActive += 1;
    }

    shiftTotalVacancies += safeNum(post, "vacancies") || 1;

    if (Array.isArray(post.confirmedIds)) {
      shiftTotalConfirmed += post.confirmedIds.length;
    }
  }

  let shiftAppsApplied = 0;
  let shiftShortlisted = 0;
  let shiftConfirmed = 0;
  let shiftRejected = 0;
  const employeeIdSet = new Set<string>();

  for (const application of sa) {
    if (!isRec(application)) continue;

    const status = safeStr(application, "status");

    if (status === "applied") {
      shiftAppsApplied += 1;
    } else if (status === "shortlisted" || status === "waiting") {
      shiftShortlisted += 1;
    } else if (status === "confirmed") {
      shiftConfirmed += 1;
    } else if (status === "rejected") {
      shiftRejected += 1;
    }

    const employeeId = safeStr(application, "id");
    if (employeeId) employeeIdSet.add(employeeId);
  }

  let shiftWorkspacesActive = 0;

  for (const workspace of sw) {
    if (!isRec(workspace)) continue;

    const status = safeStr(workspace, "status");
    if (status === "active" || status === "upcoming") shiftWorkspacesActive += 1;
  }

  const shiftFillRate =
    shiftTotalVacancies > 0 ? Math.round((shiftTotalConfirmed / shiftTotalVacancies) * 100) : 0;

  let careerActive = 0;
  let careerPaused = 0;
  let careerClosed = 0;

  for (const post of cp) {
    if (!isRec(post)) continue;

    const status = safeStr(post, "status");

    if (status === "active") {
      careerActive += 1;
    } else if (status === "paused") {
      careerPaused += 1;
    } else if (status === "closed" || status === "filled") {
      careerClosed += 1;
    }
  }

  let careerAppsApplied = 0;
  let careerShortlisted = 0;
  let careerInterview = 0;
  let careerOffered = 0;
  let careerHired = 0;
  let careerRejected = 0;

  for (const application of ca) {
    if (!isRec(application)) continue;

    const status = safeStr(application, "stage") || safeStr(application, "status");

    if (status === "applied") {
      careerAppsApplied += 1;
    } else if (status === "shortlisted") {
      careerShortlisted += 1;
    } else if (status === "interview") {
      careerInterview += 1;
    } else if (status === "offered") {
      careerOffered += 1;
    } else if (status === "hired") {
      careerHired += 1;
    } else if (status === "rejected") {
      careerRejected += 1;
    }

    const employeeId = safeStr(application, "employeeId");
    if (employeeId) employeeIdSet.add(employeeId);
  }

  const totalCareerApps =
    careerAppsApplied +
    careerShortlisted +
    careerInterview +
    careerOffered +
    careerHired +
    careerRejected;
  const careerConversion =
    totalCareerApps > 0 ? Math.round((careerHired / totalCareerApps) * 100) : 0;

  let careerWorkspacesActive = 0;

  for (const workspace of cw) {
    if (!isRec(workspace)) continue;

    const status = safeStr(workspace, "status");
    if (status === "active" || status === "onboarding") careerWorkspacesActive += 1;
  }

  const activity: AdminHomeActivityItem[] = [];

  for (const item of sLog) {
    if (!isRec(item)) continue;

    const id = safeStr(item, "id");
    const title = safeStr(item, "title");
    const createdAt = safeNum(item, "createdAt");

    if (id && title && createdAt) {
      activity.push({
        id,
        domain: "shift",
        kind: safeStr(item, "kind"),
        title,
        body: safeStr(item, "body") || undefined,
        createdAt,
      });
    }
  }

  for (const item of cLog) {
    if (!isRec(item)) continue;

    const id = safeStr(item, "id");
    const title = safeStr(item, "title");
    const createdAt = safeNum(item, "createdAt");

    if (id && title && createdAt) {
      activity.push({
        id,
        domain: "career",
        kind: safeStr(item, "kind"),
        title,
        body: safeStr(item, "body") || undefined,
        createdAt,
      });
    }
  }

  activity.sort((a, b) => b.createdAt - a.createdAt);

  return {
    sp,
    sa,
    sw,
    cp,
    ca,
    cw,
    shiftActive,
    shiftCompleted,
    shiftCancelled,
    shiftTotalVacancies,
    shiftTotalConfirmed,
    shiftAppsApplied,
    shiftShortlisted,
    shiftConfirmed,
    shiftRejected,
    shiftWorkspacesActive,
    shiftFillRate,
    careerActive,
    careerPaused,
    careerClosed,
    careerAppsApplied,
    careerShortlisted,
    careerInterview,
    careerOffered,
    careerHired,
    careerRejected,
    careerWorkspacesActive,
    careerConversion,
    employeeIdSet,
    activity,
  };
}
