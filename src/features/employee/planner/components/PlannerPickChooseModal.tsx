// Job Mitra | PlannerPickChooseModal.tsx

import { useState } from "react";
import type { PlannerPublicIndexEntry } from "../../../employer/planner/storage/plannerPublicIndex.storage";
import { PlannerPickChooseCalendar } from "./PlannerPickChooseCalendar";
import { PlannerProfileGateModal } from "./PlannerProfileGateModal";
import { usePlannerPickChooseState } from "../hooks/usePlannerPickChooseState";

type Props = {
  entry: PlannerPublicIndexEntry;
  onClose: () => void;
  onApplied: (count: number) => void;
  onNeedProfile: () => void;
  isProfileComplete: boolean;
};

export function PlannerPickChooseModal({ entry, onClose, onApplied, isProfileComplete }: Props) {
  const [profileGateOpen, setProfileGateOpen] = useState(false);

  const { availability, predictor, selectedOpenDays, toggleDay, selectAllOpen, submit } =
    usePlannerPickChooseState({
      entry,
      isProfileComplete,
      onNeedProfile: () => setProfileGateOpen(true),
      onApplied,
    });

  return (
    <>
      <PlannerProfileGateModal open={profileGateOpen} onClose={() => setProfileGateOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1200,
          background: "rgba(15,23,42,0.45)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          padding: 12,
        }}
        onClick={onClose}
      >
        <div
          className="wm-planner-card"
          style={{ width: "100%", maxWidth: 480, maxHeight: "85vh", overflow: "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: 16, fontWeight: 800 }}>{entry.planName}</div>

          <PlannerPickChooseCalendar
            availability={availability}
            predictor={predictor}
            onToggleDay={toggleDay}
            onSelectAllOpen={selectAllOpen}
          />

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
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
              disabled={selectedOpenDays.length === 0}
              onClick={submit}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
