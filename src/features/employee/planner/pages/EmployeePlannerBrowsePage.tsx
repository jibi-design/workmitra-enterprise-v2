// Job Mitra | EmployeePlannerBrowsePage.tsx | Browse multi-day project plans

import { useState } from "react";
import { PageHeader, Section } from "../../../../shared/components/layout/EnterpriseLayout";
import { PlannerMegaProjectSection } from "../components/PlannerMegaProjectSection";
import { PlannerProfileGateModal } from "../components/PlannerProfileGateModal";
import { isProfileComplete } from "../../../shared/planner/ports/plannerLegacyShiftBridge";

export function EmployeePlannerBrowsePage() {
  const [profileGateOpen, setProfileGateOpen] = useState(false);
  const [toast, setToast] = useState("");

  return (
    <div className="wm-ee-vPlanner wm-planner-page">
      <PageHeader
        title="Browse Projects"
        subtitle="Multi-day Gig Projects — pick your available days per plan."
      />

      <Section eyebrow="Gig Projects" title="Open Project Plans">
        <div style={{ marginTop: 0 }}>
          <PlannerMegaProjectSection
            onToast={setToast}
            onNeedProfile={() => setProfileGateOpen(true)}
            isProfileComplete={isProfileComplete()}
          />
        </div>
      </Section>

      <PlannerProfileGateModal open={profileGateOpen} onClose={() => setProfileGateOpen(false)} />

      {toast ? (
        <div
          role="status"
          data-testid="planner-browse-toast"
          onClick={() => setToast("")}
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 24,
            zIndex: 40,
            margin: "0 auto",
            maxWidth: 420,
            padding: "12px 14px",
            borderRadius: 14,
            background: "#0f172a",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
