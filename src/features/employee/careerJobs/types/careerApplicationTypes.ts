// src/features/employee/careerJobs/types/careerApplicationTypes.ts
//
// Types for My Career Applications page.

import type { CareerApplicationStage } from "../../../employer/careerJobs/types/careerTypes";

export type Tab = "active" | "interview" | "offers" | "closed" | "all";
export type BadgeTone = "neutral" | "good" | "info" | "warn" | "bad";

export type KpiCounts = {
  applied: number;
  shortlisted: number;
  confirmed: number;
};

export type TabCounts = Record<Tab, number>;

export type AppLite = {
  id: string;
  jobId: string;
  stage: CareerApplicationStage;
  appliedAt: number;
  updatedAt: number;
  currentRound: number;
  totalPassed: number;
  totalScheduled: number;
  employeeName: string;
  coverNote: string;
  noticePeriod: string;
  expectedSalary: number;
  rejectionReason?: string;
  rejectedAt?: number;
  offeredAt?: number;
  hiredAt?: number;
  withdrawnAt?: number;
  offerDetails?: {
    jobTitle: string;
    salary: number;
    salaryPeriod: string;
    startDate: string;
    message?: string;
  };
};

export type ExplanationResult = {
  title: string;
  body: string;
  tone: BadgeTone;
};