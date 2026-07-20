// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AttendanceQuickMarkForm.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\attendanceQuickMark\AttendanceQuickMarkForm.tsx

import type { AttendanceDayStatus } from "../../types/attendanceLog.types";
import { ATT_STATUS_CONFIG, ATT_STATUS_LIST } from "../../helpers/attendanceConstants";
import { formatDateKeyDisplay } from "../../helpers/attendanceCalendarUtils";
import { inputStyle, labelStyle } from "./attendanceQuickMarkStyles";

type Props = {
  dateKey: string;
  currentStatus?: AttendanceDayStatus;
  status: AttendanceDayStatus;
  signIn: string;
  signOut: string;
  location: string;
  note: string;
  calculatedHours: number | undefined;
  onStatusChange: (status: AttendanceDayStatus) => void;
  onSignInChange: (value: string) => void;
  onSignOutChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSave: () => void;
  onClearRequest: () => void;
};

export function AttendanceQuickMarkForm({
  dateKey,
  currentStatus,
  status,
  signIn,
  signOut,
  location,
  note,
  calculatedHours,
  onStatusChange,
  onSignInChange,
  onSignOutChange,
  onLocationChange,
  onNoteChange,
  onSave,
  onClearRequest,
}: Props) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>
        {formatDateKeyDisplay(dateKey)}
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {ATT_STATUS_LIST.map((item) => {
          const config = ATT_STATUS_CONFIG[item];
          const isActive = status === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onStatusChange(item)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 12px",
                border: isActive
                  ? `2px solid ${config.color}`
                  : "1px solid var(--wm-er-border, #e5e7eb)",
                borderRadius: 8,
                background: isActive ? config.bg : "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isActive ? 800 : 600,
                color: config.color,
              }}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Sign In</label>
          <input
            type="time"
            value={signIn}
            onChange={(event) => onSignInChange(event.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Sign Out</label>
          <input
            type="time"
            value={signOut}
            onChange={(event) => onSignOutChange(event.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {calculatedHours !== undefined && (
        <div
          style={{
            marginTop: 6,
            padding: "6px 10px",
            borderRadius: 6,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            fontSize: 12,
            fontWeight: 700,
            color: "#15803d",
          }}
        >
          Total: {calculatedHours}h
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Location / Site</label>
        <input
          type="text"
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          placeholder="e.g. Main Office, Site B"
          style={inputStyle}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <label style={labelStyle}>Note</label>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Optional note..."
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <button
        className="wm-primarybtn"
        type="button"
        onClick={onSave}
        style={{ width: "100%", marginTop: 14 }}
      >
        Save
      </button>

      {currentStatus && (
        <button
          type="button"
          onClick={onClearRequest}
          style={{
            width: "100%",
            marginTop: 6,
            padding: "8px 0",
            border: "none",
            borderRadius: 8,
            background: "none",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            color: "#dc2626",
          }}
        >
          Clear Entry
        </button>
      )}
    </div>
  );
}
