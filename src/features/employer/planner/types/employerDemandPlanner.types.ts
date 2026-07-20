// App name: Job Mitra
// File name: employerDemandPlanner.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\types\employerDemandPlanner.types.ts

export type DemandPlannerStep = 1 | 2 | 3;

export type FillStatus = "filled" | "filling" | "needs_attention" | "posted";

export type SlotResult = {
  date: string;
  postId: string;
  workers: number;
  confirmed: number;
  status: FillStatus;
};

export type FillStatusConfig = {
  label: string;
  color: string;
  bg: string;
};
