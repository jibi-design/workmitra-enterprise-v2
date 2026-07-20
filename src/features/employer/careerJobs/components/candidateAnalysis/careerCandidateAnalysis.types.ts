// App name: Job Mitra
// File name: careerCandidateAnalysis.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\candidateAnalysis\careerCandidateAnalysis.types.ts

import type { CareerApplication } from "../../types/careerTypes";

export type AnalyzedCandidate = {
  app: CareerApplication;
  score: number;
  skillMatch: string;
  screening: string;
  salary: string;
  coverNote: string;
  notice: string;
  reason: string;
};

export type CandidateAnalysisResult = {
  shortlist: AnalyzedCandidate[];
  backup: AnalyzedCandidate[];
  remaining: AnalyzedCandidate[];
};
