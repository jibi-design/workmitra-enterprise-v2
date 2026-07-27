// Job Mitra | EmployerDemandPlannerHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../../shared/components/layout/DomainHero";

type EmployerDemandPlannerHeaderProps = {
  showCancel: boolean;
  onCancel: () => void;
  onSaveDraft?: () => void;
  draftSavedAt?: number | null;
  isPublishing?: boolean;
};

export function EmployerDemandPlannerHeader({
  showCancel,
  onCancel,
  onSaveDraft,
  draftSavedAt,
  isPublishing = false,
}: EmployerDemandPlannerHeaderProps) {
  return (
    <DomainHero
      variant="planner"
      audience="employer"
      title="Gig Projects"
      subtitle="Agency-mode multi-day demand planning"
      description={draftSavedAt ? "Draft saved" : "Plan multi-day gig demand for agency staffing."}
      trailing={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {onSaveDraft ? (
            <button
              type="button"
              className="wm-planner-btnGhost"
              style={{ fontSize: 12, minHeight: 38, padding: "8px 12px" }}
              onClick={onSaveDraft}
              disabled={isPublishing}
            >
              Save Draft
            </button>
          ) : null}
          {showCancel ? (
            <button
              className="wm-outlineBtn"
              type="button"
              onClick={onCancel}
              style={{ fontSize: 12 }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      }
    />
  );
}
