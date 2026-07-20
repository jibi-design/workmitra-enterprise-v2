// App name: Job Mitra
// File name: CareerCreateStepInterview.tsx
import { CareerCreateInterviewSetup } from "./CareerCreateInterviewSetup";
import type { StepInterviewData } from "../types/careerCreateStepInterview.types";

export type { StepInterviewData };

type CareerCreateStepInterviewProps = {
  data: StepInterviewData;
  onChange: (updates: Partial<StepInterviewData>) => void;
};

export function CareerCreateStepInterview({ data, onChange }: CareerCreateStepInterviewProps) {
  // Fix: added fallback to empty array to prevent undefined error
  return (
    <CareerCreateInterviewSetup
      rounds={data?.roundConfigs ?? []}
      onChange={(roundConfigs) => onChange({ roundConfigs })}
    />
  );
}
