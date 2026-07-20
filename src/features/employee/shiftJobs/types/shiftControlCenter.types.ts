// App name: Job Mitra
// File name: shiftControlCenter.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\types\shiftControlCenter.types.ts

export type ShiftControlRecord = Record<string, unknown>;

export type ShiftControlCenterSnapshot = {
  posts: ShiftControlRecord[];
  apps: ShiftControlRecord[];
  workspaces: ShiftControlRecord[];
};

export type ShiftControlCenterCounts = {
  availableShifts: number;
  totalApps: number;
  pending: number;
  confirmed: number;
  activeWs: number;
  blockedPostIds: Set<string>;
  discoverablePosts: ShiftControlRecord[];
};
