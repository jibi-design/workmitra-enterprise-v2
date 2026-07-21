// Job Mitra | useEmployerDemandPlannerState.submit.ts
// Hybrid A2 S8 — publish DemandPlan + public index WITHOUT creating hidden ShiftPosts.

import type { NavigateFunction } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { getFillStatus } from "../helpers/employerDemandPlanner.helpers";
import {
  buildPlannerSlotId,
  demandPlannerStorage,
  type DaySlot,
} from "../storage/demandPlannerStorage";
import type { Step1Data } from "../components/wizard/DemandPlannerStep1.types";
import type { SlotResult } from "../types/employerDemandPlanner.types";
import { ensurePlanBroadcastGroup } from "../services/planBroadcast.service";
import { plannerPublicIndex } from "../storage/plannerPublicIndex.storage";

export async function submitDemandPlannerPlan(input: {
  nav: NavigateFunction;
  planId: string | null;
  setPlanId: (id: string) => void;
  step1: Step1Data;
  slots: DaySlot[];
  setSubmitting: (value: boolean) => void;
  setNotice: (notice: NoticeData | null) => void;
  setSubmitResults: (results: SlotResult[] | null) => void;
}): Promise<void> {
  const { nav, planId, setPlanId, step1, slots, setSubmitting, setNotice, setSubmitResults } =
    input;

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

    /** Legacy dual-write only: reuse existing child post ids; never create new ones (P1.7). */
    const postIds: Record<string, string> = {};
    const results: SlotResult[] = [];

    for (const slot of slots) {
      if (slot.workers <= 0) continue;

      const existingSlot = existing?.slots.find((s) => s.date === slot.date);
      const legacyPostId = existingSlot?.postId?.trim();
      if (legacyPostId) {
        postIds[slot.date] = legacyPostId;
      }

      results.push({
        date: slot.date,
        postId: legacyPostId ?? buildPlannerSlotId(activePlanId, slot.date),
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
