// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AcceptResignationStepThree.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\acceptResignation\AcceptResignationStepThree.tsx

import { CARD, OVERLAY } from "./acceptResignationStyles";
import { StepIndicator } from "./acceptResignationUi";

type Props = {
  employeeName: string;
  onDone: () => void;
};

export function AcceptResignationStepThree({ employeeName, onDone }: Props) {
  return (
    <div role="dialog" aria-modal="true" style={OVERLAY}>
      <div style={CARD}>
        <StepIndicator step={2} />

        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#16a34a", marginTop: 10 }}>
            Employment Record Closed
          </div>

          <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 6, lineHeight: 1.5 }}>
            {employeeName}&apos;s resignation has been processed. Optional Employment Feedback can
            be added later.
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={onDone}
            style={{
              padding: "12px 28px",
              borderRadius: "var(--wm-radius-10)",
              border: "none",
              background: "#16a34a",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
