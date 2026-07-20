// App: Job Mitra / WorkMitra_Enterprise_v2
// File: QuickReportsDateRangeFields.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\quickReports\QuickReportsDateRangeFields.tsx

import type { CSSProperties } from "react";

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-er-text)",
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  display: "block",
  marginBottom: 4,
};

type Props = {
  startDate: string;
  endDate: string;
  hasInvalidRange: boolean;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

export function QuickReportsDateRangeFields({
  startDate,
  endDate,
  hasInvalidRange,
  onStartDateChange,
  onEndDateChange,
}: Props) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {hasInvalidRange && (
        <div
          style={{
            marginTop: 8,
            padding: "6px 10px",
            borderRadius: 6,
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            fontSize: 12,
            color: "#dc2626",
            fontWeight: 600,
          }}
        >
          End date must be after start date.
        </div>
      )}
    </>
  );
}
