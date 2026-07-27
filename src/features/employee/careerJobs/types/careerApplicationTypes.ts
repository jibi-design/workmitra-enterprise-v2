// src/features/employee/careerJobs/types/careerApplicationTypes.ts
//
// Types for My Career Applications page.

import type { CareerApplicationStage } from "../../../career/types/careerDomainTypes";

export type Tab = "active" | "interview" | "offers" | "closed" | "all";
export type BadgeTone = "neutral" | "good" | "info" | "warn" | "bad";

export type KpiCounts = {
  applied: number;
  shortlisted: number;
  confirmed: number;
};

export type TabCounts = Record<Tab, number>;

export type ScheduledInterviewSummary = {
  round: number;
  label: string;
  mode: string;
  scheduledDate: string;
  scheduledTime: string;
  location?: string;
  meetingLink?: string;
  rsvpStatus?: "pending" | "accepted" | "declined";
};

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
  nextScheduledInterview?: ScheduledInterviewSummary;
};

export type ExplanationResult = {
  title: string;
  body: string;
  tone: BadgeTone;
};
