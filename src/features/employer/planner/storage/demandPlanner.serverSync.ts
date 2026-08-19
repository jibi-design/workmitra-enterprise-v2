/** Fire-and-forget planner dual-write (avoids storage ↔ dbTruth import cycle). */

import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";

export function queuePlannerServerSync(planId: string, op: "upsert" | "delete" = "upsert"): void {
  if (!AUTH_BACKEND_ENABLED || !planId.trim()) return;
  void import("../services/plannerDbTruth.service").then((mod) => {
    mod.syncDemandPlanToServer(planId, op);
  });
}
