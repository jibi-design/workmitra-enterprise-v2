// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AcceptResignationModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\AcceptResignationModal.tsx

import { useState } from "react";
import { AcceptResignationStepOne } from "./acceptResignation/AcceptResignationStepOne";
import { AcceptResignationStepThree } from "./acceptResignation/AcceptResignationStepThree";

type Props = {
  employeeName: string;
  jobTitle: string;
  onComplete: (exitedAt: number, rating: number, comment: string) => void;
  onClose: () => void;
};

function formatDateInput(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function AcceptResignationModal({ employeeName, jobTitle, onComplete, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [nowMs] = useState(() => Date.now());
  const [dateStr, setDateStr] = useState(() => formatDateInput(Date.now()));

  const todayStr = formatDateInput(nowMs);
  const parsedDate = new Date(`${dateStr}T00:00:00`).getTime();
  const dateValid = !Number.isNaN(parsedDate);

  if (step === 1) {
    return (
      <AcceptResignationStepOne
        employeeName={employeeName}
        jobTitle={jobTitle}
        dateStr={dateStr}
        todayStr={todayStr}
        dateValid={dateValid}
        onDateChange={setDateStr}
        onClose={onClose}
        onNext={() => {
          if (dateValid) {
            setStep(2);
          }
        }}
      />
    );
  }

  return (
    <AcceptResignationStepThree
      employeeName={employeeName}
      onDone={() => onComplete(parsedDate, 0, "")}
    />
  );
}
