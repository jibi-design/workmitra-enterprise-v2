// Job Mitra | plannerApplicationBundles.ts | My Work plan application bundles

import type { ShiftApplicationData } from "../../../shared/planner/ports/plannerLegacyShiftBridge";

export type PlannerApplicationBundle = {
  kind: "plan";
  planId: string;
  planApplyBatchId: string;
  applications: ShiftApplicationData[];
};

export type ApplicationListEntry =
  { kind: "single"; application: ShiftApplicationData } | PlannerApplicationBundle;

function bundleKey(app: ShiftApplicationData): string | null {
  if (app.planApplyBatchId) return app.planApplyBatchId;
  if (app.planId) return `plan_${app.planId}`;
  return null;
}

export function groupApplicationsForMyWork(
  applications: ShiftApplicationData[],
): ApplicationListEntry[] {
  const singles: ShiftApplicationData[] = [];
  const bundles = new Map<string, ShiftApplicationData[]>();

  for (const app of applications) {
    const key = bundleKey(app);
    if (!key) {
      singles.push(app);
      continue;
    }
    const list = bundles.get(key) ?? [];
    list.push(app);
    bundles.set(key, list);
  }

  const entries: ApplicationListEntry[] = [];

  for (const [, apps] of bundles) {
    if (apps.length === 1 && !apps[0]?.planApplyBatchId) {
      singles.push(apps[0]!);
      continue;
    }

    const planId = apps[0]?.planId ?? "unknown";
    const planApplyBatchId = apps[0]?.planApplyBatchId ?? `plan_${planId}`;

    entries.push({
      kind: "plan",
      planId,
      planApplyBatchId,
      applications: [...apps].sort((a, b) => a.createdAt - b.createdAt),
    });
  }

  for (const application of singles) {
    entries.push({ kind: "single", application });
  }

  entries.sort((a, b) => {
    const aTime =
      a.kind === "single"
        ? a.application.createdAt
        : Math.max(...a.applications.map((x) => x.createdAt));
    const bTime =
      b.kind === "single"
        ? b.application.createdAt
        : Math.max(...b.applications.map((x) => x.createdAt));
    return bTime - aTime;
  });

  return entries;
}
