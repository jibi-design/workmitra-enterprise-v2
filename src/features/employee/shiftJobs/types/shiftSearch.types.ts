/** Job Mitra | shiftSearch.types.ts | C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\types\shiftSearch.types.ts */

export type ExperienceLabel = "helper" | "fresher_ok" | "experienced";

export type ShiftPayBasis = "per_hour" | "per_day" | "fixed_total" | "not_listed";

export type ShiftPostDemo = {
  id: string;
  companyName: string;
  jobName: string;
  category: string;
  experience: ExperienceLabel;
  payPerDay: number;
  payBasis?: ShiftPayBasis;
  locationName: string;
  distanceKm: number;
  startAt: number;
  endAt: number;
  description?: string;
  shiftTiming?: string;
  mapsLink?: string;
  vacancies?: number;
  isHiddenFromSearch?: boolean;
  mustHave?: string[];
  goodToHave?: string[];
  whatWeProvide?: string[];
  quickQuestions?: { id: string; text: string }[];
  dressCode?: string;
  jobType?: "one-time" | "weekly" | "custom";
};

export type ShiftApplicationStatus =
  | "applied"
  | "shortlisted"
  | "waiting"
  | "confirmed"
  | "rejected"
  | "withdrawn"
  | "replaced"
  | "exited";

export type ShiftApplicationRecord = {
  id: string;
  postId: string;
  createdAt: number;
  status: ShiftApplicationStatus;
};

export type ShiftWorkspaceStatus =
  "active" | "upcoming" | "completed" | "left" | "replaced" | "cancelled";

export type ShiftWorkspaceRecord = {
  id: string;
  postId: string;
  status: ShiftWorkspaceStatus;
};

export type TimeOpt = "any" | "today" | "next3" | "week" | "weekend";
export type ExpOpt = "any" | ExperienceLabel;
export type DurOpt = "any" | "oneday" | "multiday";
