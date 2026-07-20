// App: Job Mitra / WorkMitra_Enterprise_v2
// File: TransferLetterModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\TransferLetterModal.tsx

import { useState } from "react";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { letterTemplatesStorage } from "../storage/letterTemplates.storage";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { TransferLetterData } from "../types/letterTemplates.types";
import { TransferLetterFormStep } from "./transferLetter/TransferLetterFormStep";
import { TransferLetterModalShell } from "./transferLetter/TransferLetterModalShell";
import { TransferLetterPreviewStep } from "./transferLetter/TransferLetterPreviewStep";

type Props = {
  open: boolean;
  onClose: () => void;
  record: HRCandidateRecord;
};

type FormState = {
  toLocation: string;
  toDepartment: string;
  effectiveDate: string;
  reason: string;
  reportingManager: string;
  remarks: string;
};

const INITIAL_FORM: FormState = {
  toLocation: "",
  toDepartment: "",
  effectiveDate: "",
  reason: "",
  reportingManager: "",
  remarks: "",
};

export function TransferLetterModal({ open, onClose, record }: Props) {
  const [step, setStep] = useState<"form" | "preview">("form");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  if (!open) return null;

  const set = (key: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const canPreview =
    (form.toLocation.trim() || form.toDepartment.trim()) &&
    form.effectiveDate &&
    form.reason.trim();

  const effectiveTs = form.effectiveDate ? new Date(`${form.effectiveDate}T00:00:00`).getTime() : 0;

  const fmtDate = (timestamp: number) =>
    timestamp
      ? new Date(timestamp).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const handleSend = () => {
    const newLocation = form.toLocation.trim() || record.location || "—";
    const newDepartment = form.toDepartment.trim() || record.department || "—";

    const letterData: TransferLetterData = {
      employeeName: record.employeeName,
      jobTitle: record.jobTitle,
      fromLocation: record.location || "—",
      toLocation: newLocation,
      fromDepartment: record.department || "—",
      toDepartment: newDepartment,
      effectiveDate: effectiveTs,
      reason: form.reason.trim(),
    };

    letterTemplatesStorage.createLetter({
      hrCandidateId: record.id,
      employeeUniqueId: record.employeeUniqueId,
      employeeName: record.employeeName,
      kind: "transfer",
      letterData: { kind: "transfer", data: letterData },
    });

    hrManagementStorage.applyTransfer(record.id, {
      newLocation: form.toLocation.trim() || undefined,
      newDepartment: form.toDepartment.trim() || undefined,
    });

    setForm(INITIAL_FORM);
    setStep("form");
    onClose();
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setStep("form");
    onClose();
  };

  return (
    <TransferLetterModalShell
      title={step === "form" ? "Transfer Letter" : "Preview & Send"}
      onClose={handleClose}
    >
      {step === "form" && (
        <TransferLetterFormStep
          record={record}
          form={form}
          canPreview={canPreview}
          onFieldChange={set}
          onPreview={() => setStep("preview")}
        />
      )}

      {step === "preview" && (
        <TransferLetterPreviewStep
          record={record}
          form={form}
          effectiveTs={effectiveTs}
          formatDate={fmtDate}
          onEdit={() => setStep("form")}
          onSend={handleSend}
        />
      )}
    </TransferLetterModalShell>
  );
}
