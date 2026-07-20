// App name: Job Mitra
// File name: careerPostDashboard.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\types\careerPostDashboard.types.ts

import type { CareerApplication } from "./careerTypes";

export type CareerScheduleTarget = {
  appId: string;
  roundNumber: number;
  roundLabel: string;
};

export type CareerResultTarget = {
  appId: string;
  roundNumber: number;
  roundLabel: string;
  candidateName: string;
  candidateWorkerId: string;
};

export type CareerRejectTarget = {
  appId: string;
  candidateName: string;
  currentStage: CareerApplication["stage"];
};

export type CareerOfferTarget = {
  appId: string;
  candidateName: string;
  candidateWorkerId: string;
};

export type CareerNotesTarget = {
  appId: string;
  currentNotes: string;
};

export type CareerActivityLogEntry = {
  id: string;
  title: string;
  body?: string;
  createdAt: number;
};
