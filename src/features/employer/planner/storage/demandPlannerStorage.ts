// Job Mitra | demandPlannerStorage.ts | Demand Planner storage (schema v2 + migrate-on-read)

import { ensureDaySlotIdentities, migrateDemandPlanList } from "./demandPlanner.migrate";
import {
  DEFAULT_PLANNER_EPOCH_DAYS,
  DEMAND_PLAN_SCHEMA_VERSION,
  DEMAND_PLANS_CHANGED_EVENT,
  DEMAND_PLANS_STORAGE_KEY,
  type DaySlot,
  type DemandPlan,
  type DemandPlanCreateInput,
} from "./demandPlanner.schema";
import { plannerDispatchChanged, plannerReadJson, plannerWriteJson } from "./plannerSafeStorage";

export type {
  DaySlot,
  DemandPlan,
  DemandPlanCreateInput,
  DemandPlanStatus,
  ExperienceLabel,
  PublishStatus,
  WorkingDay,
} from "./demandPlanner.schema";
export {
  DEMAND_PLAN_SCHEMA_VERSION,
  DEFAULT_PLANNER_EPOCH_DAYS,
  DEMAND_PLANS_STORAGE_KEY,
  buildPlannerSlotId,
} from "./demandPlanner.schema";
export {
  migrateDemandPlanToV2,
  migrateDemandPlanList,
  ensureDaySlotIdentities,
} from "./demandPlanner.migrate";

const KEY = DEMAND_PLANS_STORAGE_KEY;
const CHANGED = DEMAND_PLANS_CHANGED_EVENT;

function read(): DemandPlan[] {
  const raw = plannerReadJson<unknown>(KEY, []);
  const { plans, changed } = migrateDemandPlanList(raw);
  if (changed) {
    plannerWriteJson(KEY, plans);
    invalidateSortedCache();
  }
  return plans;
}

let sortedPlansCache: DemandPlan[] = [];
let sortedPlansCacheKey = "";

function invalidateSortedCache(): void {
  sortedPlansCacheKey = "";
  byIdCacheKey = "";
}

let byIdCacheKey = "";
let byIdCacheId = "";
let byIdCachePlan: DemandPlan | null = null;

function getSortedPlans(): DemandPlan[] {
  const raw = read();
  const cacheKey = JSON.stringify(raw);
  if (
    cacheKey === sortedPlansCacheKey &&
    sortedPlansCache.length >= 0 &&
    sortedPlansCacheKey !== ""
  ) {
    return sortedPlansCache;
  }
  sortedPlansCacheKey = cacheKey;
  sortedPlansCache = [...raw].sort((a, b) => b.createdAt - a.createdAt);
  return sortedPlansCache;
}

function write(list: DemandPlan[]): void {
  if (plannerWriteJson(KEY, list)) {
    invalidateSortedCache();
    plannerDispatchChanged(CHANGED);
  }
}

function genId(): string {
  return `dp_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export type UpdatePlanOptions = {
  /** When set, reject write if stored updatedAt differs (multi-tab stale guard). */
  expectedUpdatedAt?: number;
};

export type UpdatePlanResult =
  | { ok: true; plan: DemandPlan }
  | { ok: false; reason: "not_found" | "stale"; currentUpdatedAt?: number };

export function generateDates(
  startDate: string,
  endDate: string,
  workingDays: import("./demandPlanner.schema").WorkingDay[],
): string[] {
  const dates: string[] = [];
  if (!startDate || !endDate || workingDays.length === 0) return dates;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return dates;
  const cur = new Date(start);
  while (cur <= end && dates.length < 90) {
    if (workingDays.includes(cur.getDay() as import("./demandPlanner.schema").WorkingDay)) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export { fmtPlanDate } from "../helpers/plannerDateFormat.helpers";

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const demandPlannerStorage = {
  getAll(): DemandPlan[] {
    return getSortedPlans();
  },

  getById(id: string): DemandPlan | null {
    const sorted = getSortedPlans();
    const cacheKey = sortedPlansCacheKey;
    if (byIdCacheId === id && byIdCacheKey === cacheKey && cacheKey !== "") {
      return byIdCachePlan;
    }
    const plan = sorted.find((p) => p.id === id) ?? null;
    byIdCacheId = id;
    byIdCacheKey = cacheKey;
    byIdCachePlan = plan;
    return plan;
  },

  create(data: DemandPlanCreateInput): string {
    const now = Date.now();
    const id = genId();
    const slots = ensureDaySlotIdentities(id, data.slots ?? []);
    const plan: DemandPlan = {
      ...data,
      id,
      slots,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      publishStatus: data.publishStatus ?? "idle",
      schemaVersion: DEMAND_PLAN_SCHEMA_VERSION,
      legalEntityMlId: data.legalEntityMlId?.trim() ?? "",
      siteId: data.siteId?.trim() || undefined,
      siteManagerId: data.siteManagerId?.trim() || undefined,
      epochDays:
        typeof data.epochDays === "number" && data.epochDays > 0
          ? Math.floor(data.epochDays)
          : DEFAULT_PLANNER_EPOCH_DAYS,
      milestoneCursor:
        typeof data.milestoneCursor === "number" && data.milestoneCursor >= 0
          ? Math.floor(data.milestoneCursor)
          : 0,
    };
    write([plan, ...read()].slice(0, 50));
    return id;
  },

  updatePlan(
    id: string,
    patch: Partial<DemandPlan>,
    options?: UpdatePlanOptions,
  ): UpdatePlanResult {
    const current = this.getById(id);
    if (!current) return { ok: false, reason: "not_found" };

    if (
      typeof options?.expectedUpdatedAt === "number" &&
      current.updatedAt !== options.expectedUpdatedAt
    ) {
      return {
        ok: false,
        reason: "stale",
        currentUpdatedAt: current.updatedAt,
      };
    }

    let updated: DemandPlan | null = null;
    write(
      read().map((p) => {
        if (p.id !== id) return p;
        const nextSlots = patch.slots ? ensureDaySlotIdentities(id, patch.slots) : p.slots;
        updated = {
          ...p,
          ...patch,
          id: p.id,
          slots: nextSlots,
          schemaVersion: DEMAND_PLAN_SCHEMA_VERSION,
          legalEntityMlId:
            patch.legalEntityMlId !== undefined ? patch.legalEntityMlId.trim() : p.legalEntityMlId,
          epochDays:
            typeof patch.epochDays === "number" && patch.epochDays > 0
              ? Math.floor(patch.epochDays)
              : p.epochDays,
          milestoneCursor:
            typeof patch.milestoneCursor === "number" && patch.milestoneCursor >= 0
              ? Math.floor(patch.milestoneCursor)
              : p.milestoneCursor,
          updatedAt: Date.now(),
        };
        return updated;
      }),
    );
    if (!updated) return { ok: false, reason: "not_found" };
    return { ok: true, plan: updated };
  },

  updateSlots(id: string, slots: DaySlot[]): void {
    this.updatePlan(id, { slots });
  },

  submit(id: string, postIds: Record<string, string>): DemandPlan | null {
    const now = Date.now();
    let result: DemandPlan | null = null;
    write(
      read().map((p) => {
        if (p.id !== id) return p;
        const slots = ensureDaySlotIdentities(
          id,
          p.slots.map((s) => ({
            ...s,
            postId: postIds[s.date] ?? s.postId,
          })),
        );
        result = {
          ...p,
          slots,
          status: "active" as const,
          submittedAt: now,
          updatedAt: now,
          publishStatus: "published" as const,
          schemaVersion: DEMAND_PLAN_SCHEMA_VERSION,
        };
        return result;
      }),
    );
    return result;
  },

  cancel(id: string, reason?: string): DemandPlan | null {
    const now = Date.now();
    let result: DemandPlan | null = null;
    write(
      read().map((p) => {
        if (p.id !== id) return p;
        result = {
          ...p,
          status: "cancelled" as const,
          cancelledAt: now,
          cancelReason: reason,
          updatedAt: now,
          schemaVersion: DEMAND_PLAN_SCHEMA_VERSION,
        };
        return result;
      }),
    );
    return result;
  },

  delete(id: string): void {
    const plan = this.getById(id);
    if (!plan || plan.status !== "draft") return;
    write(read().filter((p) => p.id !== id));
  },

  /** Force re-read + migrate (tests / ops). */
  migrateAllFromStorage(): { migratedCount: number } {
    const raw = plannerReadJson<unknown>(KEY, []);
    const { plans, migratedCount, changed } = migrateDemandPlanList(raw);
    if (changed) write(plans);
    return { migratedCount };
  },

  subscribe(cb: () => void): () => void {
    const h = () => cb();
    window.addEventListener(CHANGED, h);
    return () => window.removeEventListener(CHANGED, h);
  },

  CHANGED_EVENT: CHANGED,
} as const;
