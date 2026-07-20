// App name: Job Mitra
// File name: careerCreateStepInterview.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\types\careerCreateStepInterview.types.ts

import type { InterviewRoundConfig } from "./careerTypes";
import type { StepBasicData } from "../components/CareerCreateStepBasic";
import type { StepRequirementsData } from "../components/CareerCreateStepRequirements";

export type StepInterviewData = {
  roundConfigs: InterviewRoundConfig[];
};

export type CareerCreateStepInterviewProps = {
  data: StepInterviewData;
  onChange: (updates: Partial<StepInterviewData>) => void;
  basicData: StepBasicData;
  reqData: StepRequirementsData;
};
