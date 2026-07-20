// Job Mitra | EmployeePlannerBrowsePage.tsx | Browse multi-day project plans

import { useState } from "react";
import { PageHeader, Section } from "../../../../shared/components/layout/EnterpriseLayout";
import { ShiftToast } from "../../shiftJobs/components/ShiftPostDetailSections";
import { PlannerMegaProjectSection } from "../components/PlannerMegaProjectSection";
import { PlannerProfileGateModal } from "../components/PlannerProfileGateModal";
import { isProfileComplete } from "../../shiftJobs/helpers/shiftSearchHelpers";

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
      <ShiftToast message={toast} />
    </div>
  );
}
