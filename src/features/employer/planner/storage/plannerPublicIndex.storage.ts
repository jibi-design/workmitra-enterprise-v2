// Job Mitra | plannerPublicIndex.storage.ts | Employee-visible plan discoverability
// Hybrid A2 S8 — index from plan slots (slotId/pay/workers); postIds optional (legacy only).

import type { DemandPlan, ExperienceLabel } from "./demandPlannerStorage";
import { demandPlannerStorage } from "./demandPlannerStorage";
import { getEmployerShiftPosts } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { countConfirmedPlannerAppsForTarget } from "../../../shared/planner/services/plannerNativeApplication.helpers";
import { buildPlannerSlotId } from "./demandPlanner.schema";
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
  /** Legacy dual-write child post ids only (may be empty after P1.7). */
  postIdsByDate: Record<string, string>;
  /** Planner-owned slot identities (apply target when no postId). */
  slotIdsByDate: Record<string, string>;
  payByDate: Record<string, number>;
  workersByDate: Record<string, number>;
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
  allEntriesCache = raw.map(normalizeIndexEntry);
  activeEntriesCacheKey = "";
  return allEntriesCache;
}

function normalizeIndexEntry(entry: PlannerPublicIndexEntry): PlannerPublicIndexEntry {
  const slotIdsByDate = { ...(entry.slotIdsByDate ?? {}) };
  const payByDate = { ...(entry.payByDate ?? {}) };
  const workersByDate = { ...(entry.workersByDate ?? {}) };
  const postIdsByDate = { ...(entry.postIdsByDate ?? {}) };

  for (const date of entry.slotDates ?? []) {
    if (!slotIdsByDate[date]) {
      slotIdsByDate[date] = buildPlannerSlotId(entry.planId, date);
    }
    if (payByDate[date] == null) {
      payByDate[date] = entry.payMin ?? 0;
    }
    if (workersByDate[date] == null) {
      workersByDate[date] = 1;
    }
  }

  return {
    ...entry,
    postIdsByDate,
    slotIdsByDate,
    payByDate,
    workersByDate,
  };
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
    if (slot.workers <= 0) continue;

    if (slot.postId) {
      const post = getEmployerShiftPosts().find((p) => p.id === slot.postId);
      if (!post) {
        // Native / missing post: use planner app counts against slot capacity.
        const targetId = slot.slotId ?? buildPlannerSlotId(plan.id, slot.date);
        const confirmed = countConfirmedPlannerAppsForTarget({
          planId: plan.id,
          targetId,
        });
        if (confirmed < slot.workers) open += 1;
        continue;
      }
      if (post.confirmedIds.length < post.vacancies) open += 1;
      continue;
    }

    const targetId = slot.slotId ?? buildPlannerSlotId(plan.id, slot.date);
    const confirmed = countConfirmedPlannerAppsForTarget({
      planId: plan.id,
      targetId,
    });
    if (confirmed < slot.workers) open += 1;
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
    const slotIdsByDate: Record<string, string> = {};
    const payByDate: Record<string, number> = {};
    const workersByDate: Record<string, number> = {};
    const slotDates: string[] = [];

    for (const slot of plan.slots) {
      if (slot.workers <= 0) continue;
      const slotId = slot.slotId ?? buildPlannerSlotId(plan.id, slot.date);
      slotDates.push(slot.date);
      slotIdsByDate[slot.date] = slotId;
      payByDate[slot.date] = slot.payPerDay;
      workersByDate[slot.date] = slot.workers;
      if (slot.postId) {
        postIdsByDate[slot.date] = slot.postId;
      }
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
      slotIdsByDate,
      payByDate,
      workersByDate,
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

    const plan = demandPlannerStorage.getById(planId);
    if (!plan) return;

    all[idx] = { ...all[idx]!, openDayCount: countOpenDays(plan) };
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
