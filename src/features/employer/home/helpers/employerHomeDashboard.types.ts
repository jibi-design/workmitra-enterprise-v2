/** Employer home dashboard types — shared by launch + phase2 compute. */

export type DashboardData = {
  activeHiring: number;
  newApplications: number;
  workVaultActivity: number;

  totalPosts: number;
  applicationsActivity: number;
  hiringActivity: number;
  workVaultDocumentRecords: number;

  pendingShifts: number;
  openJobs: number;
  broadcastMessages: number;

  shiftActive: number;
  shiftPending: number;
  shiftApplications: number;
  shiftConfirmed: number;
  shiftGroups: number;

  careerActive: number;
  careerApplications: number;
  careerInterviews: number;
  careerOffered: number;
  careerHired: number;

  upcomingWorkforce: number;

  hrTotal: number;
  hrActive: number;
  hrPending: number;
  hrExited: number;

  consolePresentToday: number;
  consoleAbsentToday: number;
  consoleActiveTasks: number;
  consoleAlerts: number;

  shiftTotalPosts: number;
  shiftPostsExist: boolean;
};

export type Rec = Record<string, unknown>;

export function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null;
}

export function safeParseArray(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
