// Job Mitra | EmployeePlannerBrowsePage.tsx | Browse multi-day project plans (P-UI-1)

import { useState } from "react";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { PlannerMegaProjectSection } from "../components/PlannerMegaProjectSection";
import { PlannerProfileGateModal } from "../components/PlannerProfileGateModal";
import { isProfileComplete } from "../../../shared/planner/services/plannerEmployeeProfile.helpers";

export function EmployeePlannerBrowsePage() {
  const [profileGateOpen, setProfileGateOpen] = useState(false);
  const [toast, setToast] = useState("");

  return (
    <div className="wm-ee-vPlanner wm-planner-page" data-testid="planner-employee-browse">
      <DomainHero
        variant="planner"
        audience="employee"
        eyebrow="Discover"
        title="Browse Projects"
        subtitle="Multi-day Gig Projects — pick your available days per plan."
      />

      <div
        className="wm-planner-card"
        style={{ marginTop: 14 }}
        data-testid="planner-browse-open-plans"
      >
        <div className="wm-planner-sectionLabel">Open plans</div>
        <div className="wm-planner-sectionTitle">Project plans near you</div>
        <PlannerMegaProjectSection
          onToast={setToast}
          onNeedProfile={() => setProfileGateOpen(true)}
          isProfileComplete={isProfileComplete()}
        />
      </div>

      <PlannerProfileGateModal open={profileGateOpen} onClose={() => setProfileGateOpen(false)} />

      {toast ? (
        <div
          role="status"
          data-testid="planner-browse-toast"
          onClick={() => setToast("")}
          className="wm-planner-card"
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 24,
            zIndex: 40,
            margin: "0 auto",
            maxWidth: 420,
            background: "#0f172a",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            border: "none",
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
