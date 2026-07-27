// App name: Job Mitra
// File name: reviewCenter.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\shared\reviewCenter\types\reviewCenter.types.ts

export type ReviewDomain = "shift" | "career" | "planner";

export type ReviewRole = "employee" | "employer";

export type ReviewRequestAction =
  "employee_request_employer_rating" | "employer_request_employee_review";

export type ReviewRequestStatus = "active" | "resolved";

export type ReviewCenterRequest = {
  id: string;
  domain: ReviewDomain;
  sourceId: string;
  sourceTitle: string;
  fromRole: ReviewRole;
  toRole: ReviewRole;
  action: ReviewRequestAction;
  status: ReviewRequestStatus;
  createdAt: number;
  seenAt?: number;
  resolvedAt?: number;
};

export type ReviewCenterTheme = {
  domain: ReviewDomain;
  label: string;
  accent: string;
  softBg: string;
  border: string;
};
