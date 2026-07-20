// App name: Job Mitra
// File name: compareApplicantsModal.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\components\compareApplicantsModal\compareApplicantsModal.types.ts

export type ComparableApplicant = {
  id: string;
  name: string;
  wmId: string;
  appliedAt: number;
  status: string;
  skills?: string[];
  experience?: string;
  requiredSkills?: string[];
  priorityTag?: "priority" | "good" | "review";
  expectedSalary?: number;
  noticePeriod?: string;
  location?: string;
  screeningAnswered?: number;
  screeningTotal?: number;
};

export type CompareColumn = {
  applicant: ComparableApplicant;
  ratingText: string;
  experienceLevel: string;
  matchedSkillsText: string;
  skillsText: string;
  appliedDate: string;
  reviewOrderLabel: string;
};

export type DecisionSignal = {
  label: string;
  color: string;
  background: string;
  border: string;
  tone: "strong" | "warning" | "neutral";
};
