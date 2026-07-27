// App name: Job Mitra
// File name: CareerCreateConfirmModal.tsx
// Employee-facing preview before publishing a Career Job post.

import { CenterModal } from "../../../../shared/components/CenterModal";
import type { CareerDuplicateWarning } from "../helpers/careerCreateHelpers";
import type { CareerSalaryPeriod, CareerWorkMode } from "../types/careerTypes";
import { CareerCreateConfirmBody } from "./CareerCreateConfirmModal.parts";

type Props = {
  open: boolean;
  jobTitle: string;
  companyName: string;
  department: string;
  jobType: string;
  workMode: CareerWorkMode;
  location: string;
  vacancies: number;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: CareerSalaryPeriod;
  noticePeriodText: string;
  interviewRounds: number;
  skillsCount: number;
  qualificationsCount: number;
  responsibilitiesCount: number;
  screeningQuestionCount: number;
  duplicateWarnings: CareerDuplicateWarning[];
  onConfirm: () => void;
  onCancel: () => void;
};

export function CareerCreateConfirmModal(props: Props) {
  if (!props.open) return null;

  return (
    <CenterModal
      open={props.open}
      onBackdropClose={props.onCancel}
      ariaLabel="Review career job before publishing"
      maxWidth={460}
    >
      <CareerCreateConfirmBody {...props} />
    </CenterModal>
  );
}
