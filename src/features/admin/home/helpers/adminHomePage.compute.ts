import type { AdminHomeData } from "../components/AdminHomeSharedUi";
import {
  ADMIN_HOME_STORAGE_KEYS,
  isRec,
  safeArr,
  safeNum,
  safeStr,
} from "./adminHomePage.storage.utils";
import { computeShiftCareerMetrics } from "./adminHomePage.compute.shiftCareer";

const K = ADMIN_HOME_STORAGE_KEYS;

export function computeAdminHomeData(): AdminHomeData {
  const metrics = computeShiftCareerMetrics();
  const activity = [...metrics.activity];

  let storageBytes = 0;
  let storageKeys = 0;
  let lastActivityTs = 0;

  try {
    storageKeys = localStorage.length;

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (key) {
        const value = localStorage.getItem(key);
        if (value) storageBytes += key.length + value.length;
      }
    }
  } catch {
    /* ignore */
  }

  if (activity.length > 0) {
    lastActivityTs = activity[0].createdAt;
  }

  const wfStaffArr = safeArr(K.wfStaff);
  const wfAnnArr = safeArr(K.wfAnnouncements);
  const wfGrpArr = safeArr(K.wfGroups);
  const wfAttArr = safeArr(K.wfAttendance);
  const wfActArr = safeArr(K.wfActivity);

  let wfStaffActive = 0;

  for (const staff of wfStaffArr) {
    if (isRec(staff) && safeStr(staff, "status") === "active") {
      wfStaffActive += 1;
    }
  }

  let wfAnnOpen = 0;
  let wfAnnConfirmed = 0;

  for (const announcement of wfAnnArr) {
    if (!isRec(announcement)) continue;

    const status = safeStr(announcement, "status");

    if (status === "open") {
      wfAnnOpen += 1;
    } else if (status === "confirmed") {
      wfAnnConfirmed += 1;
    }
  }

  let wfGroupsActive = 0;

  for (const group of wfGrpArr) {
    if (isRec(group) && safeStr(group, "status") === "active") {
      wfGroupsActive += 1;
    }
  }

  const wfAttendanceTotal = wfAttArr.length;

  for (const item of wfActArr) {
    if (!isRec(item)) continue;

    const id = safeStr(item, "id");
    const title = safeStr(item, "title");
    const createdAt = safeNum(item, "createdAt");

    if (id && title && createdAt) {
      activity.push({
        id,
        domain: "shift",
        kind: safeStr(item, "kind"),
        title: `[WF] ${title}`,
        body: safeStr(item, "body") || undefined,
        createdAt,
      });
    }
  }

  activity.sort((a, b) => b.createdAt - a.createdAt);

  const employers = metrics.sp.length > 0 || metrics.cp.length > 0 ? 1 : 0;
  const employees =
    metrics.employeeIdSet.size || (metrics.sa.length + metrics.ca.length > 0 ? 1 : 0);

  return {
    employers,
    employees,
    shiftTotal: metrics.sp.length,
    shiftActive: metrics.shiftActive,
    shiftCompleted: metrics.shiftCompleted,
    shiftCancelled: metrics.shiftCancelled,
    shiftAppsApplied: metrics.shiftAppsApplied,
    shiftShortlisted: metrics.shiftShortlisted,
    shiftConfirmed: metrics.shiftConfirmed,
    shiftRejected: metrics.shiftRejected,
    shiftWorkspacesActive: metrics.shiftWorkspacesActive,
    shiftFillRate: metrics.shiftFillRate,
    careerTotal: metrics.cp.length,
    careerActive: metrics.careerActive,
    careerPaused: metrics.careerPaused,
    careerClosed: metrics.careerClosed,
    careerAppsApplied: metrics.careerAppsApplied,
    careerShortlisted: metrics.careerShortlisted,
    careerInterview: metrics.careerInterview,
    careerOffered: metrics.careerOffered,
    careerHired: metrics.careerHired,
    careerRejected: metrics.careerRejected,
    careerWorkspacesActive: metrics.careerWorkspacesActive,
    careerConversion: metrics.careerConversion,
    activity: activity.slice(0, 30),
    totalEvents: activity.length,
    storageBytes,
    storageKeys,
    lastActivityTs,
    wfStaffActive,
    wfAnnOpen,
    wfAnnConfirmed,
    wfGroupsActive,
    wfAttendanceTotal,
  };
}
