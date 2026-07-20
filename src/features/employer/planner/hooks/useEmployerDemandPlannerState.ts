// Job Mitra | useEmployerDemandPlannerState.ts | 3-step Gig Projects wizard

import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { DEFAULT_STEP1_DATA, type Step1Data } from "../components/wizard/DemandPlannerStep1.types";
import {
  getFillStatus,
  validateDemandPlannerIdentity,
  validateDemandPlannerSchedule,
  validateDemandPlannerDaySlots,
} from "../helpers/employerDemandPlanner.helpers";
import { getAutoFillData } from "../../shiftJobs/helpers/shiftCreateHelpers";
import { demandPlannerStorage, generateDates, type DaySlot } from "../storage/demandPlannerStorage";
import { employerShiftStorage } from "../../shiftJobs/storage/employerShift.storage";
import type { DemandPlannerStep, SlotResult } from "../types/employerDemandPlanner.types";
import { ensurePlanBroadcastGroup } from "../services/planBroadcast.service";
import { plannerPublicIndex } from "../storage/plannerPublicIndex.storage";

function buildStep1FromDraft(
  draft: NonNullable<ReturnType<typeof demandPlannerStorage.getById>>,
): Step1Data {
  return {
    name: draft.name,
    companyName: draft.companyName,
    locationName: draft.locationName,
    category: draft.category,
    experience: draft.experience,
    startDate: draft.startDate,
    endDate: draft.endDate,
    workingDays: draft.workingDays,
    description: draft.description ?? "",
    defaultWorkers: draft.slots[0]?.workers || 2,
    waitingBuffer: 2,
    shiftTiming: "",
    mapsLink: "",
  };
}

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
    const hasWorkers = slots.some((s) => s.workers > 0 && s.payPerDay > 0);
    if (!hasWorkers) {
      setNotice({
        title: "Workers & pay required",
        message: "Set workers and pay for at least one day before publishing.",
      });
      return;
    }

    setSubmitting(true);

    try {
      let activePlanId = planId;
      if (!activePlanId) {
        activePlanId = demandPlannerStorage.create({
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
        });
        setPlanId(activePlanId);
      }

      const existing = demandPlannerStorage.getById(activePlanId);
      if (existing?.status === "active") {
        nav(ROUTE_PATHS.employerPlannerDetail.replace(":planId", activePlanId));
        return;
      }

      const publishRequestId = `${activePlanId}:${Date.now()}`;
      demandPlannerStorage.updatePlan(activePlanId, {
        publishStatus: "publishing",
        publishRequestId,
        slots,
        ...step1,
        name: step1.name.trim(),
        companyName: step1.companyName.trim(),
        locationName: step1.locationName.trim(),
        description: step1.description.trim(),
      });

      const postIds: Record<string, string> = {};
      const results: SlotResult[] = [];

      for (const slot of slots) {
        if (slot.workers <= 0) continue;

        const existingSlotPostId = existing?.slots.find((s) => s.date === slot.date)?.postId;
        if (existingSlotPostId) {
          postIds[slot.date] = existingSlotPostId;
          results.push({
            date: slot.date,
            postId: existingSlotPostId,
            workers: slot.workers,
            confirmed: 0,
            status: getFillStatus(0, slot.workers),
          });
          continue;
        }

        const postId = employerShiftStorage.createPost({
          companyName: step1.companyName.trim() || "Company",
          jobName: step1.name.trim(),
          category: slot.category ?? step1.category,
          experience: step1.experience,
          payPerDay: slot.payPerDay,
          locationName: step1.locationName.trim(),
          distanceKm: 0,
          startAt: new Date(`${slot.date}T00:00:00`).getTime(),
          endAt: new Date(`${slot.date}T23:59:59`).getTime(),
          description: step1.description.trim(),
          shiftTiming: step1.shiftTiming.trim(),
          mapsLink: step1.mapsLink.trim(),
          isHiddenFromSearch: true,
          planId: activePlanId,
          planSlotDate: slot.date,
          source: "planner",
          mustHave: [],
          goodToHave: [],
          vacancies: slot.workers,
          waitingBuffer: step1.waitingBuffer,
          jobType: "one-time",
          settings: {
            backupSlots: step1.waitingBuffer,
            autoPromoteBackup: true,
            notifyBackup: true,
          },
        });

        postIds[slot.date] = postId;
        results.push({
          date: slot.date,
          postId,
          workers: slot.workers,
          confirmed: 0,
          status: getFillStatus(0, slot.workers),
        });
      }

      const submitted = demandPlannerStorage.submit(activePlanId, postIds);
      if (submitted) {
        ensurePlanBroadcastGroup(activePlanId, submitted.name, submitted.companyName);
        plannerPublicIndex.publishFromPlan(submitted);
      }

      setSubmitResults(results);
      nav(ROUTE_PATHS.employerPlannerDetail.replace(":planId", activePlanId));
    } catch {
      if (planId) {
        demandPlannerStorage.updatePlan(planId, {
          publishStatus: "failed",
          publishError: "Publish failed",
        });
      }
      setNotice({
        title: "Publish failed",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
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
