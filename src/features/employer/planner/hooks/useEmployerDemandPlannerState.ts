// Job Mitra | useEmployerDemandPlannerState.ts | 3-step Gig Projects wizard

import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { DEFAULT_STEP1_DATA, type Step1Data } from "../components/wizard/DemandPlannerStep1.types";
import {
  validateDemandPlannerIdentity,
  validateDemandPlannerSchedule,
  validateDemandPlannerDaySlots,
} from "../helpers/employerDemandPlanner.helpers";
import { getAutoFillData } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { demandPlannerStorage, generateDates, type DaySlot } from "../storage/demandPlannerStorage";
import type { DemandPlannerStep, SlotResult } from "../types/employerDemandPlanner.types";
import { buildStep1FromDraft } from "./useEmployerDemandPlannerState.helpers";
import { submitDemandPlannerPlan } from "./useEmployerDemandPlannerState.submit";

export function useEmployerDemandPlannerState() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const autoFill = useMemo(() => getAutoFillData(), []);

  const resumePlanId = searchParams.get("planId");
  const resumeStep = Number(searchParams.get("step") ?? "1");

  const [planId, setPlanId] = useState<string | null>(resumePlanId);
  const [step, setStep] = useState<DemandPlannerStep>(
    (resumeStep >= 1 && resumeStep <= 3 ? resumeStep : 1) as DemandPlannerStep,
  );
  const [isSubmitting, setSubmitting] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [step1Errors, setStep1Errors] = useState<string[]>([]);
  const [submitResults, setSubmitResults] = useState<SlotResult[] | null>(null);

  const [step1, setStep1] = useState<Step1Data>(() => {
    if (resumePlanId) {
      const draft = demandPlannerStorage.getById(resumePlanId);
      if (draft) return buildStep1FromDraft(draft);
    }
    return {
      ...DEFAULT_STEP1_DATA,
      companyName: autoFill.companyName,
      locationName: autoFill.locationCity,
      category: autoFill.industryType || DEFAULT_STEP1_DATA.category,
    };
  });

  const [slots, setSlots] = useState<DaySlot[]>(() => {
    if (resumePlanId) {
      const draft = demandPlannerStorage.getById(resumePlanId);
      if (draft?.slots.length) return draft.slots;
    }
    return [];
  });

  function persistDraft(nextStep?: DemandPlannerStep) {
    const payload = {
      name: step1.name.trim(),
      companyName: step1.companyName.trim(),
      locationName: step1.locationName.trim(),
      category: step1.category,
      experience: step1.experience,
      startDate: step1.startDate,
      endDate: step1.endDate,
      workingDays: step1.workingDays,
      slots,
      description: step1.description.trim(),
      draftStep: nextStep ?? step,
    };

    if (planId) {
      demandPlannerStorage.updatePlan(planId, payload);
    } else {
      const id = demandPlannerStorage.create(payload);
      setPlanId(id);
    }
    setDraftSavedAt(Date.now());
  }

  function handleSaveDraft() {
    persistDraft(step);
  }

  function handleStep1Next() {
    const errors = validateDemandPlannerIdentity(step1);
    if (errors.length > 0) {
      setStep1Errors(errors);
      return;
    }
    setStep1Errors([]);
    setStep(2);
    persistDraft(2);
  }

  function handleStep2ScheduleNext() {
    const errors = validateDemandPlannerSchedule(step1);
    if (errors.length > 0) {
      setStep1Errors(errors);
      return;
    }

    const dates = generateDates(step1.startDate, step1.endDate, step1.workingDays);
    if (dates.length === 0) {
      setStep1Errors(["No working days found in the selected date range."]);
      return;
    }
    if (dates.length > 90) {
      setStep1Errors(["Maximum 90 days per plan."]);
      return;
    }

    const existingMap = new Map(slots.map((slot) => [slot.date, slot]));
    const nextSlots: DaySlot[] = dates.map((date) => {
      const existing = existingMap.get(date);
      if (existing) return existing;
      return { date, workers: step1.defaultWorkers, payPerDay: 0 };
    });

    setSlots(nextSlots);

    const slotErrors = validateDemandPlannerDaySlots(nextSlots);
    if (slotErrors.length > 0) {
      setStep1Errors(slotErrors);
      return;
    }

    setStep1Errors([]);
    setStep(3);
    persistDraft(3);
  }

  function handleSubmit() {
    void submitDemandPlannerPlan({
      nav,
      planId,
      setPlanId,
      step1,
      slots,
      setSubmitting,
      setNotice,
      setSubmitResults,
    });
  }

  function goToPlannerHome() {
    nav(ROUTE_PATHS.employerPlannerHome);
  }

  return {
    step,
    setStep,
    isSubmitting,
    draftSavedAt,
    notice,
    setNotice,
    step1Errors,
    submitResults,
    step1,
    setStep1,
    slots,
    setSlots,
    handleStep1Next,
    handleStep2ScheduleNext,
    handleSaveDraft,
    handleSubmit,
    goToPlannerHome,
    persistDraft,
  };
}
