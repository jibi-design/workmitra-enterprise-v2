// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffAvailabilityRequestFields.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\staffAvailability\StaffAvailabilityRequestFields.tsx

import type { CSSProperties } from "react";
import { MAX_REQUIRED_COUNT, MIN_REQUIRED_COUNT } from "../../helpers/staffAvailabilityConstants";

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
  title: string;
  description: string;
  dateNeeded: string;
  timeNeeded: string;
  location: string;
  requiredCount: number;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDateNeededChange: (value: string) => void;
  onTimeNeededChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRequiredCountChange: (value: number) => void;
};

export function StaffAvailabilityRequestFields({
  title,
  description,
  dateNeeded,
  timeNeeded,
  location,
  requiredCount,
  onTitleChange,
  onDescriptionChange,
  onDateNeededChange,
  onTimeNeededChange,
  onLocationChange,
  onRequiredCountChange,
}: Props) {
  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="e.g. Saturday Extra Shift, Emergency Cover"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Details about the work, expectations, etc..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Date Needed *</label>
          <input
            type="date"
            value={dateNeeded}
            onChange={(event) => onDateNeededChange(event.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Time *</label>
          <input
            type="text"
            value={timeNeeded}
            onChange={(event) => onTimeNeededChange(event.target.value)}
            placeholder="e.g. 9:00 AM - 5:00 PM"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Location / Site</label>
          <input
            type="text"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="Work location name"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>People Needed *</label>
          <input
            type="number"
            value={requiredCount}
            onChange={(event) => {
              const value = parseInt(event.target.value, 10);

              if (
                !Number.isNaN(value) &&
                value >= MIN_REQUIRED_COUNT &&
                value <= MAX_REQUIRED_COUNT
              ) {
                onRequiredCountChange(value);
              }
            }}
            min={MIN_REQUIRED_COUNT}
            max={MAX_REQUIRED_COUNT}
            style={inputStyle}
          />
        </div>
      </div>
    </>
  );
}
