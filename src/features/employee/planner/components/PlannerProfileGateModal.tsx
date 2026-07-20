// Job Mitra | PlannerProfileGateModal.tsx | Profile incomplete gate (P1)

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PlannerProfileGateModal({ open, onClose }: Props) {
  const nav = useNavigate();

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="wm-planner-card"
        style={{ width: "100%", maxWidth: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 16, fontWeight: 800 }}>Complete your profile first</div>
        <p style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginTop: 8, lineHeight: 1.5 }}>
          Add your name and basic details before applying to multi-day project plans.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            type="button"
            className="wm-planner-btnGhost"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="wm-planner-btnPrimary"
            style={{ flex: 1 }}
            onClick={() => {
              onClose();
              nav(ROUTE_PATHS.employeeProfile);
            }}
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}
