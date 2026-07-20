// App name: Job Mitra
// File name: myShiftWorkspaces.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\types\myShiftWorkspaces.types.ts

export type MyShiftWorkspaceTab = "active" | "upcoming" | "completed" | "closed" | "all";

export type MyShiftWorkspaceCounts = Record<MyShiftWorkspaceTab, number>;
