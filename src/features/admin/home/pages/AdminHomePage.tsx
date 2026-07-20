// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminHomePage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\pages\AdminHomePage.tsx

import { useCallback, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { AdminHomeActivityTimeline } from "../components/AdminHomeActivityTimeline";
import { AdminHomeDomainSections } from "../components/AdminHomeDomainSections";
import { AdminHomeHeader } from "../components/AdminHomeHeader";
import { AdminHomeKpiSection } from "../components/AdminHomeKpiSection";
import { AdminHomeQuickActions } from "../components/AdminHomeQuickActions";
import { AdminHomeResetModal } from "../components/AdminHomeResetModal";
import type { AdminHomeActivityItem, AdminHomeData } from "../components/AdminHomeSharedUi";
import { AdminHomeSystemStatus } from "../components/AdminHomeSystemStatus";

type Rec = Record<string, unknown>;

function isRec(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeArr(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeStr(record: Rec, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function safeNum(record: Rec, key: string): number {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

const K = {
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

function compute(): AdminHomeData {
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

  const employers = sp.length > 0 || cp.length > 0 ? 1 : 0;
  const employees = employeeIdSet.size || (sa.length + ca.length > 0 ? 1 : 0);

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

  return {
    employers,
    employees,
    shiftTotal: sp.length,
    shiftActive,
    shiftCompleted,
    shiftCancelled,
    shiftAppsApplied,
    shiftShortlisted,
    shiftConfirmed,
    shiftRejected,
    shiftWorkspacesActive,
    shiftFillRate,
    careerTotal: cp.length,
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

const EVS = [
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
];

let cacheKey = "";
let cacheData: AdminHomeData | null = null;

function snap(): AdminHomeData {
  const key = [
    localStorage.getItem(K.shiftPosts),
    localStorage.getItem(K.shiftApps),
    localStorage.getItem(K.careerPosts),
    localStorage.getItem(K.careerApps),
    localStorage.getItem(K.shiftLog),
    localStorage.getItem(K.careerLog),
    localStorage.getItem(K.shiftWorkspaces),
    localStorage.getItem(K.careerWorkspaces),
    localStorage.getItem(K.wfStaff),
    localStorage.getItem(K.wfAnnouncements),
    localStorage.getItem(K.wfGroups),
  ].join("|");

  if (key === cacheKey && cacheData) return cacheData;

  cacheKey = key;
  cacheData = compute();

  return cacheData;
}

function sub(callback: () => void): () => void {
  const handler = () => callback();

  for (const eventName of EVS) {
    window.addEventListener(eventName, handler);
  }

  document.addEventListener("visibilitychange", handler);

  return () => {
    for (const eventName of EVS) {
      window.removeEventListener(eventName, handler);
    }

    document.removeEventListener("visibilitychange", handler);
  };
}

function fmtDate(timestamp: number): string {
  if (!timestamp) return "—";

  try {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function relTime(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

function exportAllData() {
  try {
    const data: Record<string, unknown> = {};

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (!key) continue;

      try {
        data[key] = JSON.parse(localStorage.getItem(key) ?? "null");
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `job-mitra-export-${Date.now()}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  } catch {
    /* ignore */
  }
}

export function AdminHomePage() {
  const nav = useNavigate();
  const data = useSyncExternalStore(sub, snap, snap);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  return (
    <div className="wm-ad-fadeIn">
      <AdminHomeResetModal
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onReset={handleReset}
      />

      <AdminHomeHeader />

      <AdminHomeKpiSection data={data} />

      <AdminHomeDomainSections data={data} />

      <AdminHomeQuickActions
        onOpenAuditLog={() => nav(ROUTE_PATHS.adminAlerts)}
        onExportData={exportAllData}
        onResetAll={() => setShowResetConfirm(true)}
      />

      <AdminHomeSystemStatus data={data} formatBytes={fmtBytes} relativeTime={relTime} />

      <AdminHomeActivityTimeline
        activity={data.activity}
        showTimeline={showTimeline}
        onToggleTimeline={() => setShowTimeline((value) => !value)}
        onOpenFullAuditLog={() => nav(ROUTE_PATHS.adminAlerts)}
        formatDate={fmtDate}
      />
    </div>
  );
}
