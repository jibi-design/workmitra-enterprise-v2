// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnouncePage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\pages\EmployerWorkforceAnnouncePage.tsx

import { useCallback, useState } from "react";
import type { AnnounceFormData } from "../types/announceForm.types";
import { AnnounceStepCategories } from "../components/AnnounceStepCategories";
import { AnnounceStepDetails } from "../components/AnnounceStepDetails";
import { AnnounceStepPreview } from "../components/AnnounceStepPreview";
import { AnnounceStepShifts } from "../components/AnnounceStepShifts";
import { AnnounceStepVacancy } from "../components/AnnounceStepVacancy";
import { EmployerWorkforceAnnounceHeader } from "../components/EmployerWorkforceAnnounceHeader";
import { EmployerWorkforceAnnounceStepper } from "../components/EmployerWorkforceAnnounceStepper";
import { workforceAnnouncementService } from "../services/workforceAnnouncementService";
import type { CreateAnnouncementPayload } from "../services/workforceAnnouncementService";

export type { AnnounceFormData } from "../types/announceForm.types";

const INITIAL_FORM: AnnounceFormData = {
  targetCategories: [],
  shifts: [],
  vacancyPerCategoryPerShift: {},
  waitingBuffer: 2,
  autoReplace: true,
  title: "",
  date: "",
  time: "",
  location: "",
  description: "",
};

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<Step, string> = {
  1: "Select Categories",
  2: "Define Shifts",
  3: "Set Vacancies",
  4: "Announcement Details",
  5: "Preview & Send",
};

type Props = {
  onBack: () => void;
  onCreated?: (announcementId: string) => void;
};

export function EmployerWorkforceAnnouncePage({ onBack, onCreated }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<AnnounceFormData>({ ...INITIAL_FORM });
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = useCallback((patch: Partial<AnnounceFormData>) => {
    setForm((previous) => ({ ...previous, ...patch }));
    setSubmitErrors([]);
  }, []);

  const loadTemplate = useCallback((templateData: Partial<AnnounceFormData>) => {
    setForm((previous) => ({ ...previous, ...templateData }));
  }, []);

  const goNext = useCallback(() => {
    setStep((currentStep) => Math.min(currentStep + 1, 5) as Step);
  }, []);

  const goBack = useCallback(() => {
    if (step === 1) {
      onBack();
      return;
    }

    setStep((currentStep) => Math.max(currentStep - 1, 1) as Step);
  }, [onBack, step]);

  const goToStep = useCallback((target: Step) => {
    setStep(target);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    setSubmitErrors([]);

    const payload: CreateAnnouncementPayload = {
      title: form.title,
      date: form.date,
      time: form.time,
      location: form.location,
      description: form.description,
      targetCategories: form.targetCategories,
      shifts: form.shifts,
      vacancyPerCategoryPerShift: form.vacancyPerCategoryPerShift,
      waitingBuffer: form.waitingBuffer,
      autoReplace: form.autoReplace,
    };

    const result = workforceAnnouncementService.create(payload);
    setIsSubmitting(false);

    if (result.success && result.id) {
      onCreated?.(result.id);
      onBack();
      return;
    }

    setSubmitErrors(result.errors ?? ["Failed to create announcement."]);
  }, [form, onBack, onCreated]);

  const progress = (step / 5) * 100;

  return (
    <div className="wm-er-vWorkforce">
      <EmployerWorkforceAnnounceHeader step={step} stepLabels={STEP_LABELS} onBack={goBack} />

      <EmployerWorkforceAnnounceStepper step={step} progress={progress} onStepClick={goToStep} />

      <div style={{ marginTop: 10, marginBottom: 24 }}>
        {step === 1 && (
          <AnnounceStepCategories
            selected={form.targetCategories}
            onChange={(categories) => updateForm({ targetCategories: categories })}
            onLoadTemplate={loadTemplate}
            onNext={goNext}
          />
        )}

        {step === 2 && (
          <AnnounceStepShifts
            shifts={form.shifts}
            onChange={(shifts) => updateForm({ shifts })}
            onNext={goNext}
          />
        )}

        {step === 3 && (
          <AnnounceStepVacancy
            targetCategories={form.targetCategories}
            shifts={form.shifts}
            vacancyMap={form.vacancyPerCategoryPerShift}
            waitingBuffer={form.waitingBuffer}
            onChange={(vacancyMap, waitingBuffer) =>
              updateForm({ vacancyPerCategoryPerShift: vacancyMap, waitingBuffer })
            }
            onNext={goNext}
          />
        )}

        {step === 4 && (
          <AnnounceStepDetails
            title={form.title}
            date={form.date}
            time={form.time}
            location={form.location}
            description={form.description}
            autoReplace={form.autoReplace}
            onChange={(patch) => updateForm(patch)}
            onNext={goNext}
          />
        )}

        {step === 5 && (
          <AnnounceStepPreview
            form={form}
            onSubmit={handleSubmit}
            onEdit={goToStep}
            isSubmitting={isSubmitting}
            errors={submitErrors}
          />
        )}
      </div>
    </div>
  );
}
