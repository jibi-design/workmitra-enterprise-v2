// App name: Job Mitra
// File name: shiftWorkspace.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\types\shiftWorkspace.types.ts

export type ShiftWorkspaceCategory = "construction" | "kitchen" | "office" | "delivery" | "other";

export type ShiftWorkspaceStatus =
  "active" | "upcoming" | "completed" | "left" | "replaced" | "cancelled";

export type ShiftWorkspaceUpdate = {
  id: string;
  createdAt: number;
  kind: "system" | "broadcast" | "direct";
  title: string;
  body?: string;
};

export type ShiftWorkspace = {
  id: string;
  postId: string;
  appId?: string;
  workerMlId?: string;
  workerName?: string;
  companyName: string;
  jobName: string;
  category: ShiftWorkspaceCategory;
  locationName: string;
  locationAddress?: string;
  mapsLink?: string;
  startAt: number;
  endAt: number;
  status: ShiftWorkspaceStatus;
  lastActivityAt: number;
  unreadCount: number;
  updates: ShiftWorkspaceUpdate[];
  exitedAt?: number;
  exitReason?: "emergency" | "sick" | "travel" | "other";
  exitNote?: string;
  replacedAt?: number;
  replacedReason?: "no_show" | "schedule_change" | "quality_issue" | "other";
  rating?: 1 | 2 | 3 | 4 | 5;
  ratingComment?: string;
  ratedAt?: number;
  employerRating?: number;
  employerRatingComment?: string;
  employerRatedAt?: number;
};

export type EmployerNote = {
  id: string;
  domain: "shift" | "career" | "workforce";
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
  route?: string;
};

export type UnknownRecord = Record<string, unknown>;
