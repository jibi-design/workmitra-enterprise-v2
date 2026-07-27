// App name: Job Mitra
// File name: MyShiftApplicationsList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\MyShiftApplicationsList.tsx

import { usePulseStore } from "../../../pulse/pulseStore";
import { PlannerMyWorkPlanBundle } from "../../planner/components/PlannerMyWorkPlanBundle";
import { groupApplicationsForMyWork } from "../../planner/helpers/plannerApplicationBundles";
import type {
  ShiftApplicationData,
  ShiftPostData,
} from "../../shiftJobs/types/shiftApplicationTypes";
import { getShiftApplicationPulseTarget, MUTED } from "./myShiftApplicationsList.helpers";
import { MyShiftApplicationCard } from "./MyShiftApplicationCard";
import { MyShiftApplicationsEmptyState } from "./MyShiftApplicationsEmptyState";

type MyShiftApplicationsListProps = {
  domain?: "shift" | "planner";
  applications: ShiftApplicationData[];
  postMap: Map<string, ShiftPostData>;
  onFindShifts: () => void;
  onOpenApplication: (application: ShiftApplicationData) => void;
  onWithdrawApplication: (application: ShiftApplicationData) => void;
  onConfirmAttendanceApplication: (application: ShiftApplicationData) => void;
};

export function MyShiftApplicationsList({
  domain = "shift",
  applications,
  postMap,
  onFindShifts,
  onOpenApplication,
  onWithdrawApplication,
  onConfirmAttendanceApplication,
}: MyShiftApplicationsListProps) {
  const activePulseNodeId = usePulseStore((state) => state.chain[0] ?? null);

  if (applications.length === 0) {
    return <MyShiftApplicationsEmptyState domain={domain} onFindShifts={onFindShifts} />;
  }

  const entries = groupApplicationsForMyWork(applications).filter((entry) =>
    domain === "planner" ? entry.kind === "plan" : entry.kind === "single",
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <section
        className={
          domain === "planner"
            ? "wm-shift-surface-glass"
            : "wm-shift-surface-glass wm-shift-surface-glass--shift"
        }
        style={{
          padding: "10px 12px",
          fontSize: 12,
          fontWeight: 750,
          lineHeight: 1.45,
          color: MUTED,
        }}
      >
        {domain === "planner"
          ? "Track multi-day project bundles — per-day status and plan breakdown live here."
          : "Track employer review, shortlist, backup-list, confirmation, and closed status here. Open an application to review the shift again."}
      </section>

      {entries.map((entry) => {
        if (entry.kind === "plan") {
          return (
            <div key={entry.planApplyBatchId} className="wm-ee-vPlanner wm-planner-page">
              <PlannerMyWorkPlanBundle
                planId={entry.planId}
                applications={entry.applications}
                postMap={postMap}
                onOpenApplication={onOpenApplication}
              />
            </div>
          );
        }

        const application = entry.application;
        const pulseTarget = getShiftApplicationPulseTarget(application);
        const isPulseActive = Boolean(pulseTarget && pulseTarget.pulseId === activePulseNodeId);

        return (
          <MyShiftApplicationCard
            key={application.id}
            application={application}
            post={postMap.get(application.postId)}
            isPulseActive={isPulseActive}
            onTap={() => onOpenApplication(application)}
            onFindShifts={onFindShifts}
            onWithdraw={() => onWithdrawApplication(application)}
            onConfirmAttendance={() => onConfirmAttendanceApplication(application)}
          />
        );
      })}
    </div>
  );
}
