// Job Mitra | EmployeeProjectPickApplyPage.tsx | Section 7.7 full-page Pick & Choose

import { useState } from "react";
import { useSyncExternalStore } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { PlannerPublicIndexEntry } from "../../../shared/planner/plannerPublic";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { PlannerPickChooseCalendar } from "../components/PlannerPickChooseCalendar";
import { PlannerProfileGateModal } from "../components/PlannerProfileGateModal";
import { usePlannerPickChooseState } from "../hooks/usePlannerPickChooseState";
import { employeeProjectDetailPath } from "../../planner/helpers/plannerEmployeeRoutes";

function PickApplyBody({ entry }: { entry: PlannerPublicIndexEntry }) {
  const nav = useNavigate();
  const [profileGateOpen, setProfileGateOpen] = useState(false);
  const isProfileComplete = Boolean(employeeProfileStorage.get().fullName.trim());

  const pickState = usePlannerPickChooseState({
    entry,
    isProfileComplete,
    onNeedProfile: () => setProfileGateOpen(true),
    onApplied: (count) => {
      nav(employeeProjectDetailPath(entry.planId), {
        state: { toast: `Applied for ${count} day${count !== 1 ? "s" : ""}!` },
      });
    },
  });

  return (
    <>
      <PlannerProfileGateModal open={profileGateOpen} onClose={() => setProfileGateOpen(false)} />
      <section className="wm-planner-hero" style={{ marginTop: 12 }}>
        <div className="wm-planner-heroTitle">{entry.planName}</div>
        <div className="wm-planner-heroSub">Pick your available days</div>
      </section>

      <div className="wm-planner-card">
        <PlannerPickChooseCalendar
          availability={pickState.availability}
          predictor={pickState.predictor}
          onToggleDay={pickState.toggleDay}
          onSelectAllOpen={pickState.selectAllOpen}
        />
      </div>

      <div className="wm-planner-card" style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          className="wm-planner-btnGhost"
          style={{ flex: 1 }}
          onClick={() => nav(employeeProjectDetailPath(entry.planId))}
        >
          Back
        </button>
        <button
          type="button"
          className="wm-planner-btnPrimary"
          style={{ flex: 1 }}
          disabled={pickState.selectedOpenDays.length === 0}
          onClick={pickState.submit}
        >
          Submit Application
        </button>
      </div>
    </>
  );
}

export function EmployeeProjectPickApplyPage() {
  const { planId = "" } = useParams();

  const entry = useSyncExternalStore(
    plannerPublicIndex.subscribe,
    () => plannerPublicIndex.getByPlanId(planId),
    () => plannerPublicIndex.getByPlanId(planId),
  );

  if (!entry || entry.status === "cancelled") {
    return <Navigate to={ROUTE_PATHS.employeeHome} replace />;
  }

  return (
    <div className="wm-ee-vPlanner wm-planner-page">
      <PickApplyBody entry={entry} />
    </div>
  );
}
