/** Job Mitra | PlannerApplicationsList.tsx | Native plan-bundle list (no Shift soft-wrap) */

import type {
  ShiftApplicationData,
  ShiftPostData,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { groupApplicationsForMyWork } from "../helpers/plannerApplicationBundles";
import { PlannerMyWorkPlanBundle } from "./PlannerMyWorkPlanBundle";
import { PlannerApplicationsEmptyState } from "./PlannerApplicationsEmptyState";

type Props = {
  applications: ShiftApplicationData[];
  postMap: Map<string, ShiftPostData>;
  pipelineHint?: string | null;
  onBrowseProjects: () => void;
  onOpenApplication: (application: ShiftApplicationData) => void;
};

export function PlannerApplicationsList({
  applications,
  postMap,
  pipelineHint,
  onBrowseProjects,
  onOpenApplication,
}: Props) {
  if (applications.length === 0) {
    return (
      <PlannerApplicationsEmptyState
        onBrowseProjects={onBrowseProjects}
        pipelineHint={pipelineHint}
      />
    );
  }

  const entries = groupApplicationsForMyWork(applications).filter((entry) => entry.kind === "plan");

  if (entries.length === 0) {
    return <PlannerApplicationsEmptyState onBrowseProjects={onBrowseProjects} />;
  }

  return (
    <div data-testid="planner-applications-list" style={{ display: "grid", gap: 12 }}>
      <section
        style={{
          padding: "10px 12px",
          borderRadius: 16,
          border: "1px solid rgba(8,145,178,0.18)",
          background: "linear-gradient(180deg, rgba(236,254,255,0.72), rgba(255,255,255,0.98))",
          color: "#94a3b8",
          fontSize: 12,
          fontWeight: 750,
          lineHeight: 1.45,
        }}
      >
        Track multi-day project bundles — per-day status and plan breakdown live here.
      </section>

      {entries.map((entry) => {
        if (entry.kind !== "plan") return null;
        return (
          <div
            key={entry.planApplyBatchId}
            data-testid="planner-application-bundle"
            data-plan-id={entry.planId}
            data-batch-id={entry.planApplyBatchId}
          >
            <PlannerMyWorkPlanBundle
              planId={entry.planId}
              applications={entry.applications}
              postMap={postMap}
              onOpenApplication={onOpenApplication}
            />
          </div>
        );
      })}
    </div>
  );
}
