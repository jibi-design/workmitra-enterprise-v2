// Job Mitra | EmployerDemandPlannerHeader.tsx

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
    <div className="wm-pageHead">
      <div>
        <div className="wm-pageTitle">Gig Projects</div>
        <div className="wm-pageSub">Agency-mode multi-day demand planning</div>
        {draftSavedAt ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              color: "var(--wm-planner-accent-strong)",
              fontWeight: 700,
            }}
          >
            Draft saved
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {onSaveDraft && (
          <button
            type="button"
            className="wm-planner-btnGhost"
            style={{ fontSize: 12, minHeight: 38, padding: "8px 12px" }}
            onClick={onSaveDraft}
            disabled={isPublishing}
          >
            Save Draft
          </button>
        )}
        {showCancel && (
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={onCancel}
            style={{ fontSize: 12 }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
