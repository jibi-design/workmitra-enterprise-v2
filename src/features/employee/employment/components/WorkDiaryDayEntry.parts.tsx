import { WD_STATUS_CONFIG, WD_STATUS_LIST } from "../helpers/workDiaryConstants";
import type { WorkDayStatus } from "../helpers/workDiary.types";
import { formatDiaryDateDisplay } from "../helpers/workDiaryCalendarUtils";
import { inputStyle, labelStyle } from "./WorkDiaryDayEntry.styles";

function ReadOnlyBlock({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "9px 11px",
        borderRadius: 10,
        background: "rgba(15,23,42,0.035)",
        border: "1px solid rgba(148,163,184,0.14)",
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 850,
          color: "var(--wm-emp-muted, var(--wm-er-muted))",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 3,
          fontSize: 12.5,
          fontWeight: 850,
          color: "var(--wm-emp-text, var(--wm-er-text))",
        }}
      >
        {value || "Not recorded"}
      </div>
    </div>
  );
}

function HoursBadge({ hours }: { hours: number }) {
  return (
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
      Total: {hours}h
    </div>
  );
}

type ReadOnlyViewProps = {
  dateKey: string;
  statusConfig: (typeof WD_STATUS_CONFIG)[WorkDayStatus];
  punchIn: string;
  punchOut: string;
  location: string;
  notes: string;
  calculatedHours?: number;
  onClose: () => void;
};

export function WorkDiaryDayReadOnlyView({
  dateKey,
  statusConfig,
  punchIn,
  punchOut,
  location,
  notes,
  calculatedHours,
  onClose,
}: ReadOnlyViewProps) {
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))" }}
      >
        {formatDiaryDateDisplay(dateKey)}
      </div>

      <div
        style={{
          marginTop: 10,
          padding: "8px 10px",
          borderRadius: 12,
          background: statusConfig.bg,
          color: statusConfig.color,
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        {statusConfig.icon} {statusConfig.label}
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <ReadOnlyBlock label="Punch In" value={punchIn} />
        <ReadOnlyBlock label="Punch Out" value={punchOut} />
      </div>

      {calculatedHours !== undefined && (
        <div style={{ marginTop: 8 }}>
          <HoursBadge hours={calculatedHours} />
        </div>
      )}

      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        <ReadOnlyBlock label="Location / Site" value={location} />
        <ReadOnlyBlock label="Notes" value={notes} />
      </div>

      <button
        className="wm-primarybtn"
        type="button"
        onClick={onClose}
        style={{ width: "100%", marginTop: 14 }}
      >
        Close
      </button>
    </div>
  );
}

type EditViewProps = {
  dateKey: string;
  status: WorkDayStatus;
  punchIn: string;
  punchOut: string;
  location: string;
  notes: string;
  calculatedHours?: number;
  currentStatus?: WorkDayStatus;
  onStatusChange: (status: WorkDayStatus) => void;
  onPunchInChange: (value: string) => void;
  onPunchOutChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSave: () => void;
  onClearRequest: () => void;
};

export function WorkDiaryDayEditView({
  dateKey,
  status,
  punchIn,
  punchOut,
  location,
  notes,
  calculatedHours,
  currentStatus,
  onStatusChange,
  onPunchInChange,
  onPunchOutChange,
  onLocationChange,
  onNotesChange,
  onSave,
  onClearRequest,
}: EditViewProps) {
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))" }}
      >
        {formatDiaryDateDisplay(dateKey)}
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {WD_STATUS_LIST.map((s) => {
          const cfg = WD_STATUS_CONFIG[s];
          const isActive = status === s;

          return (
            <button
              key={s}
              type="button"
              onClick={() => onStatusChange(s)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "8px 6px",
                border: isActive
                  ? `2px solid ${cfg.color}`
                  : "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
                borderRadius: 8,
                background: isActive ? cfg.bg : "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: isActive ? 800 : 600,
                color: cfg.color,
              }}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Punch In</label>
          <input
            type="time"
            value={punchIn}
            onChange={(e) => onPunchInChange(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Punch Out</label>
          <input
            type="time"
            value={punchOut}
            onChange={(e) => onPunchOutChange(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {calculatedHours !== undefined && <HoursBadge hours={calculatedHours} />}

      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Location / Site</label>
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="e.g. Main Office, Site B"
          style={inputStyle}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <label style={labelStyle}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="What work did you do today?"
          rows={3}
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
