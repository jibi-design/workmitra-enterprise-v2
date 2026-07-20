// Job Mitra | plannerPublicIndex.storage.ts | Employee-visible plan discoverability

import type { ExperienceLabel } from "../../shiftJobs/storage/employerShift.types";
import type { DemandPlan } from "./demandPlannerStorage";
import { getEmployerShiftPosts } from "../../shiftJobs/storage/employerShift.postActions";
import { plannerDispatchChanged, plannerReadJson, plannerWriteJson } from "./plannerSafeStorage";

export type PlannerPublicIndexEntry = {
  planId: string;
  planName: string;
  companyName: string;
  locationName: string;
  category: string;
  experience: ExperienceLabel;
  dayCount: number;
  openDayCount: number;
  payMin: number;
  payMax: number;
  slotDates: string[];
  postIdsByDate: Record<string, string>;
  publishedAt: number;
  status: "active" | "cancelled";
  schemaVersion: 1;
};

const KEY = "wm_planner_public_index_v1";
const CHANGED = "wm:planner-public-index-changed";

function writeAll(entries: PlannerPublicIndexEntry[]): void {
  if (plannerWriteJson(KEY, entries)) {
    allEntriesCacheKey = "";
    activeEntriesCacheKey = "";
    byPlanIdCacheKey = "";
    plannerDispatchChanged(CHANGED);
  }
}

let activeEntriesCache: PlannerPublicIndexEntry[] = [];
let activeEntriesCacheKey = "";
let allEntriesCache: PlannerPublicIndexEntry[] = [];
let allEntriesCacheKey = "";
let byPlanIdCacheId = "";
let byPlanIdCacheKey = "";
let byPlanIdCacheEntry: PlannerPublicIndexEntry | null = null;

function readAllCached(): PlannerPublicIndexEntry[] {
  const raw = plannerReadJson<PlannerPublicIndexEntry[]>(KEY, []);
  const cacheKey = JSON.stringify(raw);
  if (cacheKey === allEntriesCacheKey && allEntriesCacheKey !== "") {
    return allEntriesCache;
  }
  allEntriesCacheKey = cacheKey;
  allEntriesCache = raw;
  activeEntriesCacheKey = "";
  return allEntriesCache;
}

function getActiveEntriesCached(): PlannerPublicIndexEntry[] {
  const all = readAllCached();
  const cacheKey = JSON.stringify(all);
  if (cacheKey === activeEntriesCacheKey && activeEntriesCacheKey !== "") {
    return activeEntriesCache;
  }
  activeEntriesCacheKey = cacheKey;
  activeEntriesCache = all.filter((e) => e.status === "active" && e.openDayCount > 0);
  return activeEntriesCache;
}

function countOpenDays(plan: DemandPlan): number {
  let open = 0;
  for (const slot of plan.slots) {
    if (!slot.postId || slot.workers <= 0) continue;
    const post = getEmployerShiftPosts().find((p) => p.id === slot.postId);
    if (!post) continue;
    if (post.confirmedIds.length < post.vacancies) open += 1;
  }
  return open;
}

export const plannerPublicIndex = {
  CHANGED_EVENT: CHANGED,

  getActiveEntries(): PlannerPublicIndexEntry[] {
    return getActiveEntriesCached();
  },

  getByPlanId(planId: string): PlannerPublicIndexEntry | null {
    const all = readAllCached();
    const cacheKey = allEntriesCacheKey;
    if (byPlanIdCacheId === planId && byPlanIdCacheKey === cacheKey && cacheKey !== "") {
      return byPlanIdCacheEntry;
    }
    const entry = all.find((e) => e.planId === planId) ?? null;
    byPlanIdCacheId = planId;
    byPlanIdCacheKey = cacheKey;
    byPlanIdCacheEntry = entry;
    return entry;
  },

  publishFromPlan(plan: DemandPlan): void {
    const pays = plan.slots.map((s) => s.payPerDay).filter((p) => p > 0);
    const payMin = pays.length > 0 ? Math.min(...pays) : 0;
    const payMax = pays.length > 0 ? Math.max(...pays) : 0;
    const postIdsByDate: Record<string, string> = {};
    const slotDates: string[] = [];

    for (const slot of plan.slots) {
      if (!slot.postId) continue;
      postIdsByDate[slot.date] = slot.postId;
      slotDates.push(slot.date);
    }

    const entry: PlannerPublicIndexEntry = {
      planId: plan.id,
      planName: plan.name,
      companyName: plan.companyName,
      locationName: plan.locationName,
      category: plan.category,
      experience: plan.experience,
      dayCount: slotDates.length,
      openDayCount: countOpenDays(plan),
      payMin,
      payMax,
      slotDates,
      postIdsByDate,
      publishedAt: Date.now(),
      status: "active",
      schemaVersion: 1,
    };

    const rest = readAllCached().filter((e) => e.planId !== plan.id);
    writeAll([entry, ...rest]);
  },

  refreshOpenCounts(planId: string): void {
    const all = readAllCached();
    const idx = all.findIndex((e) => e.planId === planId);
    if (idx < 0) return;

    const plan = { id: planId, slots: [] as DemandPlan["slots"] } as DemandPlan;
    const stored = all[idx];
    for (const date of stored.slotDates) {
      const postId = stored.postIdsByDate[date];
      if (postId) plan.slots.push({ date, workers: 1, payPerDay: 0, postId });
    }

    all[idx] = { ...stored, openDayCount: countOpenDays(plan) };
    writeAll(all);
  },

  cancel(planId: string): void {
    writeAll(
      readAllCached().map((e) =>
        e.planId === planId ? { ...e, status: "cancelled" as const } : e,
      ),
    );
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(CHANGED, handler);
    return () => {
      window.removeEventListener(CHANGED, handler);
    };
  },
} as const;
