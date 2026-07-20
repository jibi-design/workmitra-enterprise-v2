// App: Job Mitra / WorkMitra_Enterprise_v2
// File: OfferLetterModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\OfferLetterModal.tsx

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import {
  OfferLetterFormStep,
  type OfferLetterSalaryFrequency,
} from "./offerLetter/OfferLetterFormStep";
import { OfferLetterModalHeader } from "./offerLetter/OfferLetterModalHeader";
import { OfferLetterPreviewStep } from "./offerLetter/OfferLetterPreviewStep";

type Props = {
  open: boolean;
  onClose: () => void;
  record: HRCandidateRecord;
  onSend: (data: {
    salaryAmount: string;
    salaryFrequency: "monthly" | "weekly" | "hourly" | "annual";
    joiningDate: number;
    workSchedule: string;
    additionalTerms: string;
  }) => void;
};

type SalaryFrequency = OfferLetterSalaryFrequency;

const FREQUENCY_OPTIONS: { value: SalaryFrequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "hourly", label: "Hourly" },
  { value: "annual", label: "Annual" },
];

function formatDateForInput(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateDisplay(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OfferLetterModal({ open, onClose, record, onSend }: Props) {
  const [step, setStep] = useState<1 | 2>(1);

  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryFrequency, setSalaryFrequency] = useState<SalaryFrequency>("monthly");
  const [joiningDateStr, setJoiningDateStr] = useState(() => {
    const future = Date.now() + 7 * 86400000;
    return formatDateForInput(future);
  });
  const [workSchedule, setWorkSchedule] = useState("Monday to Friday, 9:00 AM - 5:00 PM");
  const [additionalTerms, setAdditionalTerms] = useState("");

  const joiningDateTs = new Date(`${joiningDateStr}T00:00:00`).getTime();
  const isValid = salaryAmount.trim().length > 0 && joiningDateStr.length > 0;

  const handleSend = () => {
    onSend({
      salaryAmount: salaryAmount.trim(),
      salaryFrequency,
      joiningDate: joiningDateTs,
      workSchedule: workSchedule.trim(),
      additionalTerms: additionalTerms.trim(),
    });
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <CenterModal
      open={open}
      onBackdropClose={handleClose}
      ariaLabel="Send Offer Letter"
      maxWidth={480}
    >
      <div style={{ padding: 20 }}>
        <OfferLetterModalHeader step={step} />

        {step === 1 && (
          <OfferLetterFormStep
            record={record}
            salaryAmount={salaryAmount}
            salaryFrequency={salaryFrequency}
            joiningDateStr={joiningDateStr}
            workSchedule={workSchedule}
            additionalTerms={additionalTerms}
            frequencyOptions={FREQUENCY_OPTIONS}
            isValid={isValid}
            onSalaryAmountChange={setSalaryAmount}
            onSalaryFrequencyChange={setSalaryFrequency}
            onJoiningDateChange={setJoiningDateStr}
            onWorkScheduleChange={setWorkSchedule}
            onAdditionalTermsChange={setAdditionalTerms}
            onCancel={handleClose}
            onPreview={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <OfferLetterPreviewStep
            record={record}
            salaryAmount={salaryAmount}
            salaryFrequency={salaryFrequency}
            joiningDateTs={joiningDateTs}
            workSchedule={workSchedule}
            additionalTerms={additionalTerms}
            formatDateDisplay={formatDateDisplay}
            onEdit={() => setStep(1)}
            onSend={handleSend}
          />
        )}
      </div>
    </CenterModal>
  );
}
