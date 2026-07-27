/** Launch-safe employer home KPIs — career + shift keys only (no vault/HR parse). */

import { CAREER_POSTS_KEY, CAREER_APPS_KEY } from "../../careerJobs/helpers/careerStorageUtils";
import { type DashboardData, isRec, safeParseArray } from "./employerHomeDashboard.types";

const PHASE2_ZEROS = {
  hrTotal: 0,
  hrActive: 0,
  hrPending: 0,
  hrExited: 0,
  consolePresentToday: 0,
  consoleAbsentToday: 0,
  consoleActiveTasks: 0,
  consoleAlerts: 0,
} as const;

/** Fingerprint keys for launch dashboard (5 keys — was 11). */
export const LAUNCH_STORAGE_KEYS = [
  "wm_employer_shift_posts_v1",
  "wm_employee_shift_workspaces_v1",
  "wm_employee_shift_applications_v1",
  CAREER_POSTS_KEY,
  CAREER_APPS_KEY,
] as const;

export function computeLaunchDashboard(): DashboardData {
  const shiftPosts = safeParseArray("wm_employer_shift_posts_v1");
  const workspaces = safeParseArray("wm_employee_shift_workspaces_v1");
  const employeeApps = safeParseArray("wm_employee_shift_applications_v1");
  const careerPosts = safeParseArray(CAREER_POSTS_KEY);
  const careerApps = safeParseArray(CAREER_APPS_KEY);

  let careerActive = 0;
  for (const post of careerPosts) {
    if (isRec(post) && post["status"] === "active") careerActive++;
  }

  let careerApplications = 0;
  let careerInterviews = 0;
  let careerOffered = 0;
  let careerHired = 0;
  for (const application of careerApps) {
    if (!isRec(application)) continue;
    const stage = application["stage"];
    if (stage === "applied" || stage === "shortlisted") careerApplications++;
    if (stage === "interview") careerInterviews++;
    if (stage === "offered") careerOffered++;
    if (stage === "hired") careerHired++;
  }

  let shiftActive = 0;
  let shiftConfirmed = 0;
  for (const item of shiftPosts) {
    if (!isRec(item)) continue;
    const confirmedIds = item["confirmedIds"];
    const status = item["status"];
    shiftConfirmed += Array.isArray(confirmedIds) ? confirmedIds.length : 0;
    if (status === "completed" || status === "cancelled") continue;
    shiftActive++;
  }

  const shiftPending = shiftPosts.filter((post) => {
    if (!isRec(post)) return false;
    const status = post["status"];
    return status !== "completed" && status !== "cancelled";
  }).length;

  const shiftApplications = employeeApps.filter(
    (application) => isRec(application) && application["status"] === "applied",
  ).length;

  let shiftGroups = 0;
  let broadcastMessages = 0;
  for (const workspace of workspaces) {
    if (!isRec(workspace)) continue;
    const status = workspace["status"];
    if (status === "active" || status === "upcoming") shiftGroups++;
    const unread = workspace["unreadCount"];
    if (typeof unread === "number" && unread > 0) broadcastMessages += unread;
  }

  return {
    activeHiring: careerActive + shiftActive,
    newApplications: careerApplications + shiftApplications,
    workVaultActivity: 0,
    totalPosts: careerPosts.length + shiftPosts.length,
    applicationsActivity: careerApplications + shiftApplications,
    hiringActivity: careerInterviews + careerOffered + careerHired + shiftConfirmed,
    workVaultDocumentRecords: 0,
    pendingShifts: shiftPending,
    openJobs: careerActive,
    broadcastMessages,
    shiftActive,
    shiftPending,
    shiftApplications,
    shiftConfirmed,
    shiftGroups,
    careerActive,
    careerApplications,
    careerInterviews,
    careerOffered,
    careerHired,
    upcomingWorkforce: 0,
    ...PHASE2_ZEROS,
    shiftTotalPosts: shiftPosts.length,
    shiftPostsExist: shiftPosts.length > 0,
  };
}
