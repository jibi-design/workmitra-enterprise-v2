// src/features/employee/employment/components/WorkDiaryDayEntry.tsx
//
// Day entry popover for Work Diary — all-in-one edit.
// Status + Punch In/Out + Location + Notes in single view.

import { useState } from "react";
import type { WorkDayStatus, WorkDiaryFormData } from "../helpers/workDiary.types";
import { workDiaryStorage } from "../storage/workDiary.storage";
import { WD_STATUS_CONFIG, WD_STATUS_LIST } from "../helpers/workDiaryConstants";
import { formatDiaryDateDisplay } from "../helpers/workDiaryCalendarUtils";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";

type Props = {
  dateKey: string;
  employmentId: string;
  currentStatus?: WorkDayStatus;
  onClose: () => void;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-emp-text, var(--wm-er-text))",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--wm-emp-muted, var(--wm-er-muted))",
  display: "block",
  marginBottom: 3,
};

function getInitialEntry(employmentId: string, dateKey: string) {
  const entry = workDiaryStorage.getDayEntry(employmentId, dateKey);
  return {
    status: entry?.status ?? ("worked" as WorkDayStatus),
    punchIn: entry?.punchInTime ?? "",
    punchOut: entry?.punchOutTime ?? "",
    location: entry?.location ?? "",
    notes: entry?.notes ?? "",
  };
}

export function WorkDiaryDayEntry({ dateKey, employmentId, currentStatus, onClose }: Props) {
  const initial = getInitialEntry(employmentId, dateKey);

  const [status, setStatus] = useState<WorkDayStatus>(initial.status);
  const [punchIn, setPunchIn] = useState(initial.punchIn);
  const [punchOut, setPunchOut] = useState(initial.punchOut);
  const [location, setLocation] = useState(initial.location);
  const [notes, setNotes] = useState(initial.notes);
  const [clearConfirm, setClearConfirm] = useState<ConfirmData | null>(null);

  const calculatedHours = workDiaryStorage.calculateHours(punchIn, punchOut);

  const handleSave = () => {
    const form: WorkDiaryFormData = {
      status,
      punchInTime: punchIn,
      punchOutTime: punchOut,
      location,
      notes,
    };
    workDiaryStorage.saveDayDetail(employmentId, dateKey, form);
    onClose();
  };

  const handleClearRequest = () => {
    setClearConfirm({
      title: "Clear Diary Entry",
      message: "This will permanently delete this day's entry including times, location and notes. This action cannot be undone.",
      tone: "danger",
      confirmLabel: "Clear Entry",
      cancelLabel: "Keep It",
    });
  };

  const handleClearConfirm = () => {
    workDiaryStorage.deleteDayEntry(employmentId, dateKey);
    setClearConfirm(null);
    onClose();
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
        {formatDiaryDateDisplay(dateKey)}
      </div>

      {/* Status */}
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {WD_STATUS_LIST.map((s) => {
          const cfg = WD_STATUS_CONFIG[s];
          const isActive = status === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 4, padding: "8px 6px",
                border: isActive ? `2px solid ${cfg.color}` : "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
                borderRadius: 8, background: isActive ? cfg.bg : "#fff",
                cursor: "pointer", fontSize: 12, fontWeight: isActive ? 800 : 600, color: cfg.color,
              }}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Times */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Punch In</label>
          <input type="time" value={punchIn} onChange={(e) => setPunchIn(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Punch Out</label>
          <input type="time" value={punchOut} onChange={(e) => setPunchOut(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {calculatedHours !== undefined && (
        <div style={{
          marginTop: 6, padding: "6px 10px", borderRadius: 6,
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          fontSize: 12, fontWeight: 700, color: "#15803d",
        }}>
          Total: {calculatedHours}h
        </div>
      )}

      {/* Location */}
      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Location / Site</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Main Office, Site B" style={inputStyle} />
      </div>

      {/* Notes */}
      <div style={{ marginTop: 10 }}>
        <label style={labelStyle}>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="What work did you do today?" rows={3}
          style={{ ...inputStyle, resize: "vertical" }} />
      </div>

      <button className="wm-primarybtn" type="button" onClick={handleSave}
        style={{ width: "100%", marginTop: 14 }}>
        Save
      </button>

      {currentStatus && (
        <button type="button" onClick={handleClearRequest}
          style={{
            width: "100%", marginTop: 6, padding: "8px 0",
            border: "none", borderRadius: 8, background: "none",
            cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#dc2626",
          }}>
          Clear Entry
        </button>
      )}

      <ConfirmModal confirm={clearConfirm} onConfirm={handleClearConfirm}
        onCancel={() => setClearConfirm(null)} />
    </div>
  );
}