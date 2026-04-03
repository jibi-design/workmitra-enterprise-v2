// src/features/employer/workforceOps/pages/EmployerWorkforceAnnouncePage.tsx
//
// Workforce Ops Hub — Create Announcement (Stepped Form).
// Orchestrates 4 steps: Categories → Shifts → Vacancy → Details → Preview & Send.

import { useState, useCallback } from "react";
import { workforceAnnouncementService } from "../services/workforceAnnouncementService";
import type { AnnouncementShift } from "../types/workforceTypes";
import type { CreateAnnouncementPayload } from "../services/workforceAnnouncementService";
import { AnnounceStepCategories } from "../components/AnnounceStepCategories";
import { AnnounceStepShifts } from "../components/AnnounceStepShifts";
import { AnnounceStepVacancy } from "../components/AnnounceStepVacancy";
import { AnnounceStepDetails } from "../components/AnnounceStepDetails";
import { AnnounceStepPreview } from "../components/AnnounceStepPreview";
import { IconBack } from "../components/workforceIcons";
import { AMBER } from "../components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Form State Type                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

export type AnnounceFormData = {
  targetCategories: string[];
  shifts: AnnouncementShift[];
  vacancyPerCategoryPerShift: Record<string, Record<string, number>>;
  waitingBuffer: number;
  autoReplace: boolean;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
};

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

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step Definition                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<Step, string> = {
  1: "Select Categories",
  2: "Define Shifts",
  3: "Set Vacancies",
  4: "Announcement Details",
  5: "Preview & Send",
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const progressBarBg: React.CSSProperties = {
  height: 4,
  borderRadius: 2,
  background: "var(--wm-er-border)",
  overflow: "hidden",
};

const stepIndicatorStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
  marginBottom: 4,
};

const backBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: AMBER,
  padding: 4,
  borderRadius: 6,
  display: "inline-flex",
  alignItems: "center",
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  onBack: () => void;
  onCreated?: (announcementId: string) => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployerWorkforceAnnouncePage({ onBack, onCreated }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<AnnounceFormData>({ ...INITIAL_FORM });
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Form updater ── */
  const updateForm = useCallback((patch: Partial<AnnounceFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setSubmitErrors([]);
  }, []);

  /* ── Load from template ── */
  const loadTemplate = useCallback((templateData: Partial<AnnounceFormData>) => {
    setForm((prev) => ({ ...prev, ...templateData }));
  }, []);

  /* ── Navigation ── */
  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, 5) as Step);
  }, []);

  const goBack = useCallback(() => {
    if (step === 1) {
      onBack();
    } else {
      setStep((s) => Math.max(s - 1, 1) as Step);
    }
  }, [step, onBack]);

  const goToStep = useCallback((target: Step) => {
    setStep(target);
  }, []);

  /* ── Submit ── */
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
    } else {
      setSubmitErrors(result.errors ?? ["Failed to create announcement."]);
    }
  }, [form, onCreated, onBack]);

  /* ── Progress ── */
  const progress = (step / 5) * 100;

  return (
    <div className="wm-er-vWorkforce">
      {/* ── Header ── */}
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button type="button" onClick={goBack} style={backBtnStyle}>
          <IconBack />
        </button>
        <div style={{ flex: 1 }}>
          <div className="wm-pageTitle">New Announcement</div>
          <div className="wm-pageSub">{STEP_LABELS[step]}</div>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div style={progressBarBg}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: AMBER,
            borderRadius: 2,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* ── Step Indicator ── */}
      <div style={stepIndicatorStyle}>
        {([1, 2, 3, 4, 5] as Step[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => s < step && goToStep(s)}
            disabled={s > step}
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              border: "none",
              background: s === step ? AMBER : s < step ? "rgba(180,83,9,0.15)" : "var(--wm-er-border)",
              color: s === step ? "#fff" : s < step ? AMBER : "var(--wm-er-muted)",
              fontSize: 12,
              fontWeight: 900,
              cursor: s < step ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {s < step ? "✓" : s}
          </button>
        ))}
        <span style={{ fontSize: 12, color: "var(--wm-er-muted)", marginLeft: 4 }}>
          Step {step} of 5
        </span>
      </div>

      {/* ── Step Content ── */}
      <div style={{ marginTop: 10, marginBottom: 24 }}>
        {step === 1 && (
          <AnnounceStepCategories
            selected={form.targetCategories}
            onChange={(cats) => updateForm({ targetCategories: cats })}
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
            onChange={(vacMap, buffer) => updateForm({ vacancyPerCategoryPerShift: vacMap, waitingBuffer: buffer })}
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