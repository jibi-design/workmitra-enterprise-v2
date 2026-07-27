// Job Mitra | useEmployerDemandPlannerState.submit.ts
// Hybrid A2 S8 — publish DemandPlan + public index WITHOUT creating hidden ShiftPosts.
// Hybrid A2 P2.2 — publish lock token + optimistic updatedAt.

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
import { appendPlannerAudit } from "../storage/plannerAuditLog.storage";
import {
  acquirePublishLock,
  releasePublishLock,
} from "../../../shared/planner/services/plannerConcurrency.service";
import { notifyPublishFailed } from "../../../shared/planner/services/plannerEscalationTriggers.service";

export async function submitDemandPlannerPlan(input: {
  nav: NavigateFunction;
  planId: string | null;
  setPlanId: (id: string) => void;
  step1: Step1Data;
  slots: DaySlot[];
  setSubmitting: (value: boolean) => void;
  setNotice: (notice: NoticeData | null) => void;
  setSubmitResults: (results: SlotResult[] | null) => void;
  expectedUpdatedAt?: number | null;
  onBaselineUpdatedAt?: (updatedAt: number) => void;
}): Promise<void> {
  const {
    nav,
    planId,
    setPlanId,
    step1,
    slots,
    setSubmitting,
    setNotice,
    setSubmitResults,
    expectedUpdatedAt,
    onBaselineUpdatedAt,
  } = input;

  const hasWorkers = slots.some((s) => s.workers > 0 && s.payPerDay > 0);
  if (!hasWorkers) {
    setNotice({
      title: "Workers & pay required",
      message: "Set workers and pay for at least one day before publishing.",
    });
    return;
  }

  setSubmitting(true);
  let lockPlanId: string | null = null;
  let lockToken: string | null = null;

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
        waitingBuffer: Math.max(0, Math.floor(step1.waitingBuffer || 0)),
      });
      setPlanId(activePlanId);
      const created = demandPlannerStorage.getById(activePlanId);
      if (created) onBaselineUpdatedAt?.(created.updatedAt);
    }

    const existing = demandPlannerStorage.getById(activePlanId);
    if (existing?.status === "active") {
      nav(ROUTE_PATHS.employerPlannerDetail.replace(":planId", activePlanId));
      return;
    }

    const lock = acquirePublishLock(activePlanId);
    if (!lock.ok) {
      setNotice({
        title: "Publish in progress elsewhere",
        message: "Another tab is publishing this plan. Wait or reload, then try again.",
      });
      return;
    }
    lockPlanId = activePlanId;
    lockToken = lock.token;

    const publishRequestId = `${activePlanId}:${Date.now()}`;
    const prePublish = demandPlannerStorage.updatePlan(
      activePlanId,
      {
        publishStatus: "publishing",
        publishRequestId,
        slots,
        name: step1.name.trim(),
        companyName: step1.companyName.trim(),
        locationName: step1.locationName.trim(),
        category: step1.category,
        experience: step1.experience,
        startDate: step1.startDate,
        endDate: step1.endDate,
        workingDays: step1.workingDays,
        description: step1.description.trim(),
        waitingBuffer: Math.max(0, Math.floor(step1.waitingBuffer || 0)),
      },
      {
        expectedUpdatedAt:
          typeof expectedUpdatedAt === "number" ? expectedUpdatedAt : existing?.updatedAt,
      },
    );
    if (!prePublish.ok) {
      if (prePublish.reason === "stale") {
        setNotice({
          title: "This plan was updated elsewhere",
          message: "Reload the draft before publishing to avoid overwriting newer changes.",
          tone: "warn",
          confirmLabel: "Reload",
        });
      }
      return;
    }
    onBaselineUpdatedAt?.(prePublish.plan.updatedAt);

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
      const childPostCount = submitted.slots.filter((s) => Boolean(s.postId)).length;
      appendPlannerAudit({
        planId: activePlanId,
        actor: "employer",
        actorMlId: submitted.legalEntityMlId,
        siteManagerId: submitted.siteManagerId,
        action: "published",
        summary: `Published plan “${submitted.name}” · ${submitted.slots.filter((s) => s.workers > 0).length} days · ${childPostCount} legacy child posts`,
        meta: {
          dayCount: submitted.slots.filter((s) => s.workers > 0).length,
          childPostCount,
          windDownNative: childPostCount === 0,
          publishRequestId: publishRequestId,
        },
      });
      onBaselineUpdatedAt?.(submitted.updatedAt);
    }

    setSubmitResults(results);
    nav(ROUTE_PATHS.employerPlannerDetail.replace(":planId", activePlanId));
  } catch {
    if (planId) {
      demandPlannerStorage.updatePlan(planId, {
        publishStatus: "failed",
        publishError: "Publish failed",
      });
      const failed = demandPlannerStorage.getById(planId);
      appendPlannerAudit({
        planId,
        actor: "system",
        actorMlId: failed?.legalEntityMlId,
        siteManagerId: failed?.siteManagerId,
        action: "publish_failed",
        summary: `Publish failed for plan “${failed?.name ?? planId}”`,
        meta: { reason: "exception" },
      });
      notifyPublishFailed(planId, failed?.name);
    }
    setNotice({
      title: "Publish failed",
      message: "Something went wrong. Please try again.",
    });
  } finally {
    if (lockPlanId && lockToken) {
      releasePublishLock(lockPlanId, lockToken);
    }
    setSubmitting(false);
  }
}
