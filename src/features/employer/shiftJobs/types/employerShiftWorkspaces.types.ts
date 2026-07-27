// App name: Job Mitra
// File name: employerShiftWorkspaces.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\types\employerShiftWorkspaces.types.ts

export type EmployerWorkspaceStatus = "active" | "upcoming" | "completed" | "left" | "replaced";

export type EmployerWorkspaceFilter = "all" | EmployerWorkspaceStatus;

export type EmployerWorkspaceMode = "groups" | "broadcasts";

export type EmployerWorkspaceLite = {
  id: string;
  postId: string;
  companyName: string;
  jobName: string;
  locationName: string;
  startAt: number;
  endAt: number;
  status: EmployerWorkspaceStatus;
  lastActivityAt: number;
  workerMlId?: string;
  workerName?: string;
};

export type EmployerWorkspaceCounts = Record<EmployerWorkspaceFilter, number>;
