// App name: Job Mitra
// File name: careerCreateStepRequirements.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\types\careerCreateStepRequirements.types.ts

import type { CareerSalaryPeriod } from "./careerTypes";

export type CareerNoticePeriodValue = "0" | "7" | "15" | "30" | "45" | "60" | "custom";

export type StepRequirementsData = {
  salaryMin: string;
  salaryMax: string;
  salaryPeriod: CareerSalaryPeriod;
  experienceMin: string;
  experienceMax: string;
  noticePeriodDays: CareerNoticePeriodValue;
  noticePeriodCustomDays: string;
  qualifications: string;
  skills: string;
  description: string;
  responsibilities: string;
  closingDate: number;
};

export type CareerCreateStepRequirementsProps = {
  data: StepRequirementsData;
  onChange: (updates: Partial<StepRequirementsData>) => void;
};
