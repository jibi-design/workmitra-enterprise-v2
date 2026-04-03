// src/features/admin/oversight/helpers/adminDataHelpers.ts
//
// Reads employer/employee profile data + post/application counts
// for Admin User Management page. Phase-0 localStorage only.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type UserStatus = "active" | "suspended" | "blocked";

export type AdminEmployerRecord = {
  id: string;
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  industryType: string;
  companySize: string;
  location: string;
  totalShiftPosts: number;
  totalCareerPosts: number;
  totalHires: number;
  registeredAt: number;
  status: UserStatus;
  statusReason?: string;
  statusChangedAt?: number;
};

export type AdminEmployeeRecord = {
  id: string;
  uniqueId: string;
  fullName: string;
  city: string;
  experience: string;
  skills: string[];
  languages: string[];
  totalApplications: number;
  shiftApplications: number;
  careerApplications: number;
  profileCompletion: number;
  registeredAt: number;
  status: UserStatus;
  statusReason?: string;
  statusChangedAt?: number;
};

export type AdminUserStatusEntry = {
  id: string;
  userId: string;
  role: "employer" | "employee";
  status: UserStatus;
  reason: string;
  changedAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Keys
// ─────────────────────────────────────────────────────────────────────────────

const EMPLOYER_PROFILE_KEY = "wm:employer-profile";
const EMPLOYEE_PROFILE_KEY = "wm_employee_profile_v1";
const SHIFT_POSTS_KEY = "wm_employer_shift_posts_v1";
const CAREER_POSTS_KEY = "wm_employer_career_posts_v1";
const SHIFT_APPS_KEY = "wm_employee_shift_applications_v1";
const CAREER_APPS_KEY = "wm_employee_career_applications_v1";
const USER_STATUS_KEY = "wm_admin_user_status_v1";

// ─────────────────────────────────────────────────────────────────────────────
// Safe Helpers
// ─────────────────────────────────────────────────────────────────────────────

type Rec = Record<string, unknown>;

function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function safeArr(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function safeObj(key: string): Rec | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw) as unknown;
    return isRec(p) ? p : null;
  } catch {
    return null;
  }
}

function str(r: Rec, k: string): string {
  const v = r[k];
  return typeof v === "string" ? v : "";
}

function num(r: Rec, k: string): number {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function uid(): string {
  return `adm_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// User Status Storage
// ─────────────────────────────────────────────────────────────────────────────

function readStatusEntries(): AdminUserStatusEntry[] {
  return safeArr(USER_STATUS_KEY).filter(
    (x): x is AdminUserStatusEntry => isRec(x) && typeof (x as Rec)["userId"] === "string",
  ) as AdminUserStatusEntry[];
}

function writeStatusEntries(entries: AdminUserStatusEntry[]): void {
  try {
    localStorage.setItem(USER_STATUS_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

function getStatusForUser(userId: string, entries: AdminUserStatusEntry[]): { status: UserStatus; reason?: string; changedAt?: number } {
  const entry = entries.find((e) => e.userId === userId);
  if (!entry) return { status: "active" };
  return { status: entry.status, reason: entry.reason, changedAt: entry.changedAt };
}

// ─────────────────────────────────────────────────────────────────────────────
// Employer List
// ─────────────────────────────────────────────────────────────────────────────

export function getEmployerList(): AdminEmployerRecord[] {
  const profile = safeObj(EMPLOYER_PROFILE_KEY);
  if (!profile) return [];

  const companyName = str(profile, "companyName");
  if (!companyName) return [];

  const shiftPosts = safeArr(SHIFT_POSTS_KEY);
  const careerPosts = safeArr(CAREER_POSTS_KEY);

  let totalHires = 0;
  for (const p of shiftPosts) {
    if (isRec(p) && Array.isArray(p["confirmedIds"])) {
      totalHires += (p["confirmedIds"] as unknown[]).length;
    }
  }
  for (const a of safeArr(CAREER_APPS_KEY)) {
    if (isRec(a) && (str(a as Rec, "stage") === "hired" || str(a as Rec, "status") === "hired")) {
      totalHires++;
    }
  }

  const statusEntries = readStatusEntries();
  const userStatus = getStatusForUser("employer-1", statusEntries);

  const record: AdminEmployerRecord = {
    id: "employer-1",
    companyName,
    fullName: str(profile, "fullName"),
    email: str(profile, "email"),
    phone: str(profile, "phone"),
    industryType: str(profile, "industryType"),
    companySize: str(profile, "companySize"),
    location: [str(profile, "locationCity"), str(profile, "locationState")].filter(Boolean).join(", "),
    totalShiftPosts: shiftPosts.length,
    totalCareerPosts: careerPosts.length,
    totalHires,
    registeredAt: Date.now() - 86400000 * 7,
    status: userStatus.status,
    statusReason: userStatus.reason,
    statusChangedAt: userStatus.changedAt,
  };

  return [record];
}

// ─────────────────────────────────────────────────────────────────────────────
// Employee List
// ─────────────────────────────────────────────────────────────────────────────

export function getEmployeeList(): AdminEmployeeRecord[] {
  const profile = safeObj(EMPLOYEE_PROFILE_KEY);
  if (!profile) return [];

  const fullName = str(profile, "fullName");
  if (!fullName) return [];

  const shiftApps = safeArr(SHIFT_APPS_KEY);
  const careerApps = safeArr(CAREER_APPS_KEY);

  const skills = Array.isArray(profile["skills"])
    ? (profile["skills"] as unknown[]).filter((s): s is string => typeof s === "string")
    : [];
  const languages = Array.isArray(profile["languages"])
    ? (profile["languages"] as unknown[]).filter((s): s is string => typeof s === "string")
    : [];

  let profileCompletion = 20;
  if (fullName) profileCompletion += 20;
  if (str(profile, "city")) profileCompletion += 15;
  if (skills.length > 0) profileCompletion += 20;
  if (languages.length > 0) profileCompletion += 10;
  if (str(profile, "experience") && str(profile, "experience") !== "fresher") profileCompletion += 15;
  profileCompletion = Math.min(100, profileCompletion);

  const statusEntries = readStatusEntries();
  const uniqueId = str(profile, "uniqueId") || "EMP-0001";
  const userStatus = getStatusForUser(uniqueId, statusEntries);

  const record: AdminEmployeeRecord = {
    id: uniqueId,
    uniqueId,
    fullName,
    city: str(profile, "city"),
    experience: str(profile, "experience") || "fresher",
    skills,
    languages,
    totalApplications: shiftApps.length + careerApps.length,
    shiftApplications: shiftApps.length,
    careerApplications: careerApps.length,
    profileCompletion,
    registeredAt: Date.now() - 86400000 * 5,
    status: userStatus.status,
    statusReason: userStatus.reason,
    statusChangedAt: userStatus.changedAt,
  };

  return [record];
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Actions
// ─────────────────────────────────────────────────────────────────────────────

export function setUserStatus(userId: string, role: "employer" | "employee", status: UserStatus, reason: string): void {
  const entries = readStatusEntries();
  const filtered = entries.filter((e) => e.userId !== userId);
  if (status !== "active") {
    filtered.push({ id: uid(), userId, role, status, reason, changedAt: Date.now() });
  }
  writeStatusEntries(filtered);
  pushAdminAuditEntry(
    status === "active" ? "user_reactivated" : status === "suspended" ? "user_suspended" : "user_blocked",
    `${role === "employer" ? "Employer" : "Employee"} ${userId} — ${status === "active" ? "Reactivated" : status === "suspended" ? "Suspended" : "Blocked"}`,
    `Reason: ${reason || "No reason provided"}.`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Audit Entry (for admin-specific actions)
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_AUDIT_KEY = "wm_admin_audit_log_v1";
const ADMIN_AUDIT_CHANGED = "wm:admin-audit-changed";

export type AdminAuditEntry = {
  id: string;
  kind: string;
  title: string;
  body?: string;
  createdAt: number;
};

export function pushAdminAuditEntry(kind: string, title: string, body?: string): void {
  const entries = safeArr(ADMIN_AUDIT_KEY) as AdminAuditEntry[];
  const entry: AdminAuditEntry = { id: uid(), kind, title, body, createdAt: Date.now() };
  const next = [entry, ...entries].slice(0, 200);
  try {
    localStorage.setItem(ADMIN_AUDIT_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(ADMIN_AUDIT_CHANGED));
  } catch {
    /* ignore */
  }
}

export function getAdminAuditEntries(): AdminAuditEntry[] {
  return (safeArr(ADMIN_AUDIT_KEY) as AdminAuditEntry[]).sort(
    (a, b) => (num(b as unknown as Rec, "createdAt")) - (num(a as unknown as Rec, "createdAt")),
  );
}