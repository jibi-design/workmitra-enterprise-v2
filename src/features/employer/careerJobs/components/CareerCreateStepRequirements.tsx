// App name: Job Mitra
// File name: CareerCreateStepRequirements.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCreateStepRequirements.tsx

import { useMemo } from "react";
import { normalizeCareerCreateTagInput } from "../helpers/careerCreateStepRequirements.helpers";
import type {
  CareerCreateStepRequirementsProps,
  StepRequirementsData,
} from "../types/careerCreateStepRequirements.types";
import { CareerCreateCompensationSection } from "./CareerCreateCompensationSection";
import { CareerCreateDescriptionSection } from "./CareerCreateDescriptionSection";
import { CareerCreateRequirementsSection } from "./CareerCreateRequirementsSection";

export type { StepRequirementsData };

export function CareerCreateStepRequirements({
  data,
  onChange,
}: CareerCreateStepRequirementsProps) {
  const qualificationList = useMemo(
    () => normalizeCareerCreateTagInput(data.qualifications, 15),
    [data.qualifications],
  );

  const skillList = useMemo(() => normalizeCareerCreateTagInput(data.skills, 20), [data.skills]);

  const responsibilityList = useMemo(
    () => normalizeCareerCreateTagInput(data.responsibilities, 15),
    [data.responsibilities],
  );

  return (
    <>
      <CareerCreateCompensationSection data={data} onChange={onChange} />

      <CareerCreateRequirementsSection
        data={data}
        qualificationCount={qualificationList.length}
        skillCount={skillList.length}
        onChange={onChange}
      />

      <CareerCreateDescriptionSection
        data={data}
        responsibilityCount={responsibilityList.length}
        onChange={onChange}
      />
    </>
  );
}
