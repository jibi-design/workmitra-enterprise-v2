// App name: Job Mitra
// File name: ShiftPostNotFound.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftPostNotFound.tsx

import { ShiftIcon } from "./ShiftPostDetailSections";

type ShiftPostNotFoundProps = {
  onFindShifts: () => void;
};

export function ShiftPostNotFound({ onFindShifts }: ShiftPostNotFoundProps) {
  return (
    <div>
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f0fdf4",
            }}
          >
            <ShiftIcon />
          </div>
          <div>
            <div className="wm-pageTitle">Shift details</div>
            <div className="wm-pageSub">This shift is no longer available.</div>
          </div>
        </div>
      </div>

      <div className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-er-text, #1e293b)" }}>
          Shift not found
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted, #64748b)" }}>
          This shift may have been removed or expired.
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={onFindShifts}
            style={{ background: "var(--wm-er-accent-shift, #16a34a)" }}
          >
            Find Shifts
          </button>
        </div>
      </div>
    </div>
  );
}
