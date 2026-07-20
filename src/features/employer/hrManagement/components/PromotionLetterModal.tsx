// App: Job Mitra / WorkMitra_Enterprise_v2
// File: PromotionLetterModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\PromotionLetterModal.tsx

import { useState } from "react";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { letterTemplatesStorage } from "../storage/letterTemplates.storage";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { PromotionLetterData } from "../types/letterTemplates.types";
import { PromotionLetterFormStep } from "./promotionLetter/PromotionLetterFormStep";
import { PromotionLetterModalShell } from "./promotionLetter/PromotionLetterModalShell";
import { PromotionLetterPreviewStep } from "./promotionLetter/PromotionLetterPreviewStep";

type Props = {
  open: boolean;
  onClose: () => void;
  record: HRCandidateRecord;
};

type FormState = {
  newTitle: string;
  newDepartment: string;
  effectiveDate: string;
  newSalary: string;
  reason: string;
};

const INITIAL_FORM: FormState = {
  newTitle: "",
  newDepartment: "",
  effectiveDate: "",
  newSalary: "",
  reason: "",
};

export function PromotionLetterModal({ open, onClose, record }: Props) {
  const [step, setStep] = useState<"form" | "preview">("form");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  if (!open) return null;

  const set = (key: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const canPreview = form.newTitle.trim() && form.effectiveDate && form.reason.trim();

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
    const letterData: PromotionLetterData = {
      employeeName: record.employeeName,
      previousTitle: record.jobTitle,
      newTitle: form.newTitle.trim(),
      previousDepartment: record.department || "—",
      newDepartment: form.newDepartment.trim() || record.department || "—",
      effectiveDate: effectiveTs,
      newSalary: form.newSalary.trim(),
      reason: form.reason.trim(),
    };

    letterTemplatesStorage.createLetter({
      hrCandidateId: record.id,
      employeeUniqueId: record.employeeUniqueId,
      employeeName: record.employeeName,
      kind: "promotion",
      letterData: { kind: "promotion", data: letterData },
    });

    hrManagementStorage.applyPromotion(record.id, {
      newTitle: form.newTitle.trim(),
      newDepartment: form.newDepartment.trim() || undefined,
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
    <PromotionLetterModalShell
      title={step === "form" ? "Promotion Letter" : "Preview & Send"}
      onClose={handleClose}
    >
      {step === "form" && (
        <PromotionLetterFormStep
          record={record}
          form={form}
          canPreview={canPreview}
          onFieldChange={set}
          onPreview={() => setStep("preview")}
        />
      )}

      {step === "preview" && (
        <PromotionLetterPreviewStep
          record={record}
          form={form}
          effectiveTs={effectiveTs}
          formatDate={fmtDate}
          onEdit={() => setStep("form")}
          onSend={handleSend}
        />
      )}
    </PromotionLetterModalShell>
  );
}
