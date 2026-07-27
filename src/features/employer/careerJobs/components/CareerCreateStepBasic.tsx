// App name: Job Mitra
// File name: CareerCreateStepBasic.tsx

export type { StepBasicData } from "./CareerCreateStepBasic.helpers";

import type { CareerCreateStepBasicProps } from "./CareerCreateStepBasic.helpers";
import { JobDetailsCard, LocationCard } from "./CareerCreateStepBasic.parts";

export function CareerCreateStepBasic({ data, onChange }: CareerCreateStepBasicProps) {
  return (
    <>
      <JobDetailsCard data={data} onChange={onChange} />
      <LocationCard data={data} onChange={onChange} />
    </>
  );
}
