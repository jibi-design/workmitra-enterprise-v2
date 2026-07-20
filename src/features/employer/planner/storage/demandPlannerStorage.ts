// src/features/employer/shiftJobs/storage/demandPlannerStorage.ts
//
// Shift Demand Planner storage — crash-safe localStorage (authStore pattern).

import { plannerDispatchChanged, plannerReadJson, plannerWriteJson } from "./plannerSafeStorage";
import type { ExperienceLabel } from "../../shiftJobs/storage/employerShift.types";

export type WorkingDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DaySlot = {
  date: string;
  workers: number;
  payPerDay: number;
  category?: string;
  postId?: string;
};

export type DemandPlanStatus = "draft" | "active" | "completed" | "cancelled";
export type PublishStatus = "idle" | "publishing" | "published" | "failed";

export type DemandPlan = {
  id: string;
  name: string;
  companyName: string;
  locationName: string;
  category: string;
  experience: ExperienceLabel;
  startDate: string;
  endDate: string;
  workingDays: WorkingDay[];
  slots: DaySlot[];
  status: DemandPlanStatus;
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  description?: string;
  draftStep?: 1 | 2 | 3;
  publishStatus?: PublishStatus;
  publishRequestId?: string;
  publishError?: string;
  cancelledAt?: number;
  cancelReason?: string;
  schemaVersion?: 1;
};

const KEY = "wm_employer_demand_plans_v1";
const CHANGED = "wm:employer-demand-plans-changed";

function read(): DemandPlan[] {
  return plannerReadJson<DemandPlan[]>(KEY, []);
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

export function generateDates(
  startDate: string,
  endDate: string,
  workingDays: WorkingDay[],
): string[] {
  const dates: string[] = [];
  if (!startDate || !endDate || workingDays.length === 0) return dates;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return dates;
  const cur = new Date(start);
  while (cur <= end && dates.length < 90) {
    if (workingDays.includes(cur.getDay() as WorkingDay)) {
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

  create(data: Omit<DemandPlan, "id" | "createdAt" | "updatedAt" | "status">): string {
    const now = Date.now();
    const id = genId();
    const plan: DemandPlan = {
      ...data,
      id,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      publishStatus: "idle",
      schemaVersion: 1,
    };
    write([plan, ...read()].slice(0, 50));
    return id;
  },

  updatePlan(id: string, patch: Partial<DemandPlan>): DemandPlan | null {
    let updated: DemandPlan | null = null;
    write(
      read().map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, ...patch, updatedAt: Date.now() };
        return updated;
      }),
    );
    return updated;
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
        const slots = p.slots.map((s) => ({
          ...s,
          postId: postIds[s.date] ?? s.postId,
        }));
        result = {
          ...p,
          slots,
          status: "active" as const,
          submittedAt: now,
          updatedAt: now,
          publishStatus: "published" as const,
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

  subscribe(cb: () => void): () => void {
    const h = () => cb();
    window.addEventListener(CHANGED, h);
    return () => window.removeEventListener(CHANGED, h);
  },

  CHANGED_EVENT: CHANGED,
} as const;
