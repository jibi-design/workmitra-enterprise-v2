// Job Mitra | plannerPublicIndex.read.ts — read-only index access (breaks storage cycles)

import { plannerReadJson } from "./plannerSafeStorage";

const PUBLIC_INDEX_KEY = "wm_planner_public_index_v1";

type PlannerPublicIndexRow = {
  planId: string;
  planName: string;
};

export function readPlannerPublicPlanName(planId: string): string | null {
  const entries = plannerReadJson<PlannerPublicIndexRow[]>(PUBLIC_INDEX_KEY, []);
  return entries.find((entry) => entry.planId === planId)?.planName ?? null;
}
