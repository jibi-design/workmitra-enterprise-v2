/** Job Mitra | demandPlanner.migrate.ts | Hybrid A2 P1.1 v1 → v2 migrator */

import {
  buildPlannerSlotId,
  DEFAULT_PLANNER_EPOCH_DAYS,
  DEMAND_PLAN_SCHEMA_VERSION,
  type DaySlot,
  type DemandPlan,
  type DemandPlanStatus,
  type ExperienceLabel,
  type PlanRoleGroup,
  type PublishStatus,
  type WorkingDay,
} from "./demandPlanner.schema";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asWorkingDays(value: unknown): WorkingDay[] {
  if (!Array.isArray(value)) return [];
  return value.filter((d): d is WorkingDay => typeof d === "number" && d >= 0 && d <= 6);
}

function asExperience(value: unknown): ExperienceLabel {
  if (value === "helper" || value === "fresher_ok" || value === "experienced") return value;
  return "experienced";
}

function asStatus(value: unknown): DemandPlanStatus {
  if (value === "draft" || value === "active" || value === "completed" || value === "cancelled") {
    return value;
  }
  return "draft";
}

function asPublishStatus(value: unknown): PublishStatus | undefined {
  if (value === "idle" || value === "publishing" || value === "published" || value === "failed") {
    return value;
  }
  return undefined;
}

function asRoleGroups(value: unknown): PlanRoleGroup[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const groups: PlanRoleGroup[] = [];
  for (const item of value) {
    const rec = asRecord(item);
    if (!rec) continue;
    const id = asString(rec.id).trim();
    const label = asString(rec.label).trim();
    if (!id || !label) continue;
    const workerMlIds = Array.isArray(rec.workerMlIds)
      ? rec.workerMlIds.filter((w): w is string => typeof w === "string" && Boolean(w.trim()))
      : [];
    groups.push({
      id,
      label,
      color: asString(rec.color) || undefined,
      workerMlIds,
    });
  }
  return groups;
}

function migrateDaySlot(raw: unknown, planId: string): DaySlot | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const date = asString(rec.date).trim();
  if (!date) return null;

  const existingSlotId = asString(rec.slotId).trim();
  return {
    date,
    workers: Math.max(0, Math.floor(asNumber(rec.workers, 0))),
    payPerDay: Math.max(0, asNumber(rec.payPerDay, 0)),
    category: asString(rec.category) || undefined,
    postId: asString(rec.postId) || undefined,
    slotId: existingSlotId || buildPlannerSlotId(planId, date),
    assignmentId: asString(rec.assignmentId) || undefined,
  };
}

/**
 * Normalize any stored plan payload to DemandPlan schema v2.
 * Idempotent — already-v2 plans only fill missing defaults / slotIds.
 */
export function migrateDemandPlanToV2(raw: unknown): DemandPlan | null {
  const rec = asRecord(raw);
  if (!rec) return null;

  const id = asString(rec.id).trim();
  if (!id) return null;

  const slotsRaw = Array.isArray(rec.slots) ? rec.slots : [];
  const slots = slotsRaw
    .map((slot) => migrateDaySlot(slot, id))
    .filter((slot): slot is DaySlot => slot !== null);

  const epochDaysRaw = asNumber(rec.epochDays, DEFAULT_PLANNER_EPOCH_DAYS);
  const epochDays = epochDaysRaw > 0 ? Math.floor(epochDaysRaw) : DEFAULT_PLANNER_EPOCH_DAYS;

  return {
    id,
    name: asString(rec.name),
    companyName: asString(rec.companyName),
    locationName: asString(rec.locationName),
    category: asString(rec.category),
    experience: asExperience(rec.experience),
    startDate: asString(rec.startDate),
    endDate: asString(rec.endDate),
    workingDays: asWorkingDays(rec.workingDays),
    slots,
    status: asStatus(rec.status),
    createdAt: asNumber(rec.createdAt, Date.now()),
    updatedAt: asNumber(rec.updatedAt, Date.now()),
    submittedAt: asOptionalNumber(rec.submittedAt),
    description: asString(rec.description) || undefined,
    draftStep:
      rec.draftStep === 1 || rec.draftStep === 2 || rec.draftStep === 3 ? rec.draftStep : undefined,
    publishStatus: asPublishStatus(rec.publishStatus),
    publishRequestId: asString(rec.publishRequestId) || undefined,
    publishError: asString(rec.publishError) || undefined,
    cancelledAt: asOptionalNumber(rec.cancelledAt),
    cancelReason: asString(rec.cancelReason) || undefined,
    schemaVersion: DEMAND_PLAN_SCHEMA_VERSION,
    legalEntityMlId: asString(rec.legalEntityMlId),
    siteId: asString(rec.siteId) || undefined,
    siteManagerId: asString(rec.siteManagerId) || undefined,
    waitingBuffer: Math.max(0, Math.floor(asNumber(rec.waitingBuffer, 0))),
    roleGroups: asRoleGroups(rec.roleGroups),
    epochDays,
    milestoneCursor: Math.max(0, Math.floor(asNumber(rec.milestoneCursor, 0))),
    offboardedAt: asOptionalNumber(rec.offboardedAt),
    completedAt: asOptionalNumber(rec.completedAt),
  };
}

export type DemandPlanMigrationResult = {
  readonly plans: DemandPlan[];
  readonly changed: boolean;
  readonly migratedCount: number;
};

/** Migrate a full storage list. Skips unparseable entries. */
export function migrateDemandPlanList(rawList: unknown): DemandPlanMigrationResult {
  if (!Array.isArray(rawList)) {
    return { plans: [], changed: false, migratedCount: 0 };
  }

  const plans: DemandPlan[] = [];
  let migratedCount = 0;
  let changed = false;

  for (const item of rawList) {
    const beforeVersion = asRecord(item)?.schemaVersion === DEMAND_PLAN_SCHEMA_VERSION ? 2 : 1;
    const migrated = migrateDemandPlanToV2(item);
    if (!migrated) {
      changed = true;
      continue;
    }
    plans.push(migrated);
    if (beforeVersion !== 2) {
      migratedCount += 1;
      changed = true;
    } else {
      // Detect slotId backfill on already-v2 rows
      const rawSlots = Array.isArray(asRecord(item)?.slots)
        ? (asRecord(item)?.slots as unknown[])
        : [];
      const missingSlotId = rawSlots.some((s) => !asString(asRecord(s)?.slotId).trim());
      if (missingSlotId) changed = true;
    }
  }

  if (plans.length !== rawList.length) changed = true;

  return { plans, changed, migratedCount };
}

/** Ensure every slot has a stable slotId (used on create / slot updates). */
export function ensureDaySlotIdentities(planId: string, slots: DaySlot[]): DaySlot[] {
  return slots.map((slot) => ({
    ...slot,
    slotId: slot.slotId?.trim() || buildPlannerSlotId(planId, slot.date),
  }));
}
