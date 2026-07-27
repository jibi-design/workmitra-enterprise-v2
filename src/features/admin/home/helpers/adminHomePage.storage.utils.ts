type Rec = Record<string, unknown>;

export function isRec(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function safeArr(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function safeStr(record: Rec, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

export function safeNum(record: Rec, key: string): number {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export const ADMIN_HOME_STORAGE_KEYS = {
  shiftPosts: "wm_employer_shift_posts_v1",
  shiftApps: "wm_employee_shift_applications_v1",
  shiftWorkspaces: "wm_employee_shift_workspaces_v1",
  shiftLog: "wm_employer_shift_activity_log_v1",
  careerPosts: "wm_employer_career_posts_v1",
  careerApps: "wm_employee_career_applications_v1",
  careerWorkspaces: "wm_employee_career_workspaces_v1",
  careerLog: "wm_employer_career_activity_log_v1",
  wfStaff: "wm_workforce_staff_v1",
  wfAnnouncements: "wm_workforce_announcements_v1",
  wfGroups: "wm_workforce_groups_v1",
  wfAttendance: "wm_workforce_attendance_v1",
  wfActivity: "wm_workforce_activity_v1",
} as const;

export const ADMIN_HOME_EVENTS = [
  "wm:employer-shift-posts-changed",
  "wm:employee-shift-applications-changed",
  "wm:employee-shift-workspaces-changed",
  "wm:employer-shift-activity-changed",
  "wm:employer-career-posts-changed",
  "wm:employee-career-applications-changed",
  "wm:employee-career-workspaces-changed",
  "wm:employer-career-activity-changed",
  "wm:workforce-staff-changed",
  "wm:workforce-announcements-changed",
  "wm:workforce-groups-changed",
  "wm:workforce-attendance-changed",
  "wm:workforce-activity-changed",
  "storage",
  "focus",
] as const;
