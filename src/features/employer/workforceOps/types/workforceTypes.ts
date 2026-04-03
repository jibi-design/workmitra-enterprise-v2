// src/features/employer/workforceOps/types/workforceTypes.ts
//
// Workforce Ops Hub — All type definitions.
// Pure types only — no logic, no imports, no side effects.

// ─────────────────────────────────────────────────────────────────────────────
// Category
// ─────────────────────────────────────────────────────────────────────────────

export type WorkforceCategory = {
  id: string;
  name: string;
  createdAt: number;
  sortOrder: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Staff
// ─────────────────────────────────────────────────────────────────────────────

export type WorkforceStaff = {
  id: string;
  employeeUniqueId: string;
  employeeName: string;
  employeeCity: string;
  employeeSkills: string[];
  categories: string[];
  rating: number | null;
  ratingCount: number;
  ratingComment: string;
  plusPoints: string;
  bio: string;
  addedAt: number;
  status: "active" | "removed";
  removedAt?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Template (IMP-2)
// ─────────────────────────────────────────────────────────────────────────────

export type WorkforceTemplate = {
  id: string;
  name: string;
  targetCategories: string[];
  shifts: AnnouncementShift[];
  vacancyPerCategoryPerShift: Record<string, Record<string, number>>;
  waitingBuffer: number;
  titlePattern: string;
  description: string;
  location: string;
  createdAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Announcement Shift
// ─────────────────────────────────────────────────────────────────────────────

export type AnnouncementShift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  hasBreak: boolean;
  breakStartTime: string;
  breakEndTime: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Announcement
// ─────────────────────────────────────────────────────────────────────────────

export type AnnouncementStatus = "open" | "analyzing" | "confirmed" | "completed" | "cancelled";

export type WorkforceAnnouncement = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  targetCategories: string[];
  shifts: AnnouncementShift[];
  vacancyPerCategoryPerShift: Record<string, Record<string, number>>;
  waitingBuffer: number;
  autoReplace: boolean;
  status: AnnouncementStatus;
  createdAt: number;
  confirmedAt?: number;
  completedAt?: number;
  isTemplate: boolean;
  templateName?: string;
  clonedFrom?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Application
// ─────────────────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "applied"
  | "selected"
  | "waiting"
  | "not_selected"
  | "confirmed"
  | "cancelled";

export type CancelReason = "sick" | "emergency" | "travel" | "other";

export type WorkforceApplication = {
  id: string;
  announcementId: string;
  staffId: string;
  employeeUniqueId: string;
  employeeName: string;
  categoryId: string;
  shiftIds: string[];
  rating: number | null;
  hasDateConflict: boolean;
  status: ApplicationStatus;
  appliedAt: number;
  confirmedAt?: number;
  cancelledAt?: number;
  cancelReason?: CancelReason;
  cancelNote?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Group
// ─────────────────────────────────────────────────────────────────────────────

export type GroupStatus = "active" | "completed";
export type GroupType = "announcement" | "quick";

export type WorkforceGroup = {
  id: string;
  announcementId: string | null;
  name: string;
  date: string;
  time: string;
  location: string;
  groupType: GroupType;
  shifts: AnnouncementShift[];
  autoReplace: boolean;
  autoDeleteHours: number;
  status: GroupStatus;
  createdAt: number;
  completedAt?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Group Member
// ─────────────────────────────────────────────────────────────────────────────

export type MemberStatus = "active" | "exited" | "replaced";

export type WorkforceGroupMember = {
  id: string;
  groupId: string;
  staffId: string;
  employeeUniqueId: string;
  employeeName: string;
  categoryId: string;
  assignedShiftIds: string[];
  status: MemberStatus;
  exitedAt?: number;
  exitReason?: CancelReason;
  exitNote?: string;
  postEventRating?: number;
  postEventComment?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Attendance (Sign In / Sign Out per shift)
// ─────────────────────────────────────────────────────────────────────────────

export type AttendanceRecord = {
  id: string;
  groupId: string;
  memberId: string;
  employeeUniqueId: string;
  shiftId: string;
  signInAt: number;
  signOutAt: number | null;
  signOutType: "manual" | "auto" | "employer_set" | null;
  hoursWorked: number | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Message
// ─────────────────────────────────────────────────────────────────────────────

export type WorkforceMessage = {
  id: string;
  groupId: string;
  senderType: "employer" | "employee";
  senderName: string;
  senderId: string;
  text: string;
  createdAt: number;
  isUrgent: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Employee Preferences (IMP-5)
// ─────────────────────────────────────────────────────────────────────────────

export type EmployeeWorkforcePreferences = {
  preferredCompanyIds: string[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Activity Log
// ─────────────────────────────────────────────────────────────────────────────

export type WorkforceActivityKind =
  | "category_created"
  | "category_deleted"
  | "staff_added"
  | "staff_removed"
  | "staff_rated"
  | "announcement_created"
  | "announcement_confirmed"
  | "announcement_completed"
  | "announcement_cancelled"
  | "group_created"
  | "group_completed"
  | "quick_group_created"
  | "member_exited"
  | "member_replaced"
  | "urgent_broadcast"
  | "attendance_signed_in"
  | "attendance_signed_out";

export type WorkforceActivityEntry = {
  id: string;
  kind: WorkforceActivityKind;
  title: string;
  body?: string;
  createdAt: number;
  route?: string;
};