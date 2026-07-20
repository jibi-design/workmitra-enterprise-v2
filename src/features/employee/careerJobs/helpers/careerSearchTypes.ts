// App name: Job Mitra
// File name: careerSearchTypes.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerSearchTypes.ts

export type CareerSearchPost = {
  id: string;
  companyName: string;
  jobTitle: string;
  department: string;
  jobType: "full-time" | "part-time" | "contract";
  workMode: "on-site" | "remote" | "hybrid";
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: "monthly" | "yearly";
  experienceMin: number;
  experienceMax: number;
  noticePeriodDays?: number;
  qualifications: string[];
  skills: string[];
  description: string;
  responsibilities: string[];
  interviewRounds: number;
  closingDate: number;
  createdAt: number;
  screeningQuestions?: { id: string; text: string }[];
};

export type CareerApplicationStageLite =
  | "applied"
  | "shortlisted"
  | "interview"
  | "offered"
  | "offer_accepted"
  | "hired"
  | "rejected"
  | "withdrawn";

export type CareerSearchApplicationState = {
  id: string;
  jobId: string;
  stage: CareerApplicationStageLite;
  appliedAt: number;
  updatedAt: number;
};

export type JobTypeFilter = "any" | "full-time" | "part-time" | "contract";
export type WorkModeFilter = "any" | "on-site" | "remote" | "hybrid";
export type ExperienceFilter = "any" | "0-1" | "1-3" | "3-7" | "7+";
