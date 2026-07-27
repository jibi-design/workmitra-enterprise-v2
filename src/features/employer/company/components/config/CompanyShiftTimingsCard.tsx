// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CompanyShiftTimingsCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\company\components\config\CompanyShiftTimingsCard.tsx

import { useState, type CSSProperties } from "react";
import { companyConfigStorage, type CompanyConfig } from "../../storage/companyConfig.storage";

const PURPLE = "#7c3aed";
const FOCUS_COLOR = "var(--wm-er-accent-hr)";
const BORDER_COLOR = "#d1d5db";

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 15,
  fontWeight: 600,
  color: "#1e293b",
  border: `1.5px solid ${BORDER_COLOR}`,
  borderRadius: "var(--wm-radius-8)",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  display: "block",
  marginBottom: 4,
};

const sectionTitle: CSSProperties = {
  fontWeight: 900,
  fontSize: 13,
  color: "var(--wm-er-text)",
  marginBottom: 4,
};

const sectionHint: CSSProperties = {
  fontSize: 12,
  color: "var(--wm-er-muted)",
  lineHeight: 1.5,
  marginBottom: 12,
  paddingBottom: 10,
  borderBottom: `1px solid ${BORDER_COLOR}`,
};

const purpleBtnStyle: CSSProperties = {
  padding: "10px 20px",
  borderRadius: "var(--wm-radius-8)",
  fontSize: 13,
  fontWeight: 700,
  border: "none",
  background: PURPLE,
  color: "#fff",
  cursor: "pointer",
};

const purpleBtnDisabledStyle: CSSProperties = {
  ...purpleBtnStyle,
  opacity: 0.5,
  cursor: "default",
};

function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
  event.currentTarget.style.borderColor = FOCUS_COLOR;
}

function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
  event.currentTarget.style.borderColor = BORDER_COLOR;
}

type Props = {
  config: CompanyConfig;
};

export function CompanyShiftTimingsCard({ config }: Props) {
  const [start, setStart] = useState(config.shiftStartTime);
  const [end, setEnd] = useState(config.shiftEndTime);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    companyConfigStorage.setShiftTimings(start, end);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges = start !== config.shiftStartTime || end !== config.shiftEndTime;

  return (
    <div>
      <div style={sectionTitle}>Default Shift Timings</div>

      <div style={sectionHint}>
        Set your company&rsquo;s standard work hours. When you mark attendance, the sign in and sign
        out times will be pre-filled with these values. You can always change the time for
        individual employees if needed.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Start Time</label>
          <input
            type="time"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div>
          <label style={labelStyle}>End Time</label>
          <input
            type="time"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges}
          style={hasChanges ? purpleBtnStyle : purpleBtnDisabledStyle}
        >
          Save Timings
        </button>

        {saved && <span style={{ fontSize: 12, color: "#15803d", fontWeight: 700 }}>Saved!</span>}
      </div>
    </div>
  );
}
