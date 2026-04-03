// src/features/employer/hrManagement/components/AttendanceDayDetailModal.tsx
//
// Full day detail edit modal for Employer Attendance Log.
// Root Map: "Full detail: Tap date → edit sign in/out, location, note"
// Fields: Status, Sign In, Sign Out, Total hours (auto), Location, Note.

import { useState, useEffect } from "react";
import type { AttendanceDayStatus, AttendanceDayFormData } from "../types/attendanceLog.types";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";
import { ATT_STATUS_CONFIG, ATT_STATUS_LIST } from "../helpers/attendanceConstants";
import { formatDateKeyLong } from "../helpers/attendanceCalendarUtils";
import { CenterModal } from "../../../../shared/components/CenterModal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type DayDetailModalProps = {
  open: boolean;
  dateKey: string;
  hrCandidateId: string;
  onClose: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles (reusable within this modal)
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
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

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  display: "block",
  marginBottom: 4,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AttendanceDayDetailModal({ open, dateKey, hrCandidateId, onClose }: DayDetailModalProps) {
  const getEntry = () => (open && dateKey) ? attendanceLogStorage.getDayEntry(hrCandidateId, dateKey) : null;

  const [status, setStatus] = useState<AttendanceDayStatus>(() => getEntry()?.status ?? "present");
  const [signIn, setSignIn] = useState(() => getEntry()?.signInTime ?? "");
  const [signOut, setSignOut] = useState(() => getEntry()?.signOutTime ?? "");
  const [location, setLocation] = useState(() => getEntry()?.location ?? "");
  const [note, setNote] = useState(() => getEntry()?.note ?? "");

  // Reset form when modal opens / dateKey changes
  useEffect(() => {
    if (!open || !dateKey) return;

    const entry = attendanceLogStorage.getDayEntry(hrCandidateId, dateKey);
    const s = entry?.status ?? "present";
    const si = entry?.signInTime ?? "";
    const so = entry?.signOutTime ?? "";
    const l = entry?.location ?? "";
    const n = entry?.note ?? "";

    // Batch updates via unstable but lint-safe approach
    requestAnimationFrame(() => {
      setStatus(s);
      setSignIn(si);
      setSignOut(so);
      setLocation(l);
      setNote(n);
    });
  }, [open, dateKey, hrCandidateId]);

  const calculatedHours = attendanceLogStorage.calculateHours(signIn, signOut);

  const handleSave = () => {
    const form: AttendanceDayFormData = {
      status,
      signInTime: signIn,
      signOutTime: signOut,
      location,
      note,
    };
    attendanceLogStorage.saveDayDetail(hrCandidateId, dateKey, form);
    onClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Attendance Day Detail" maxWidth={440}>
      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>Day Detail</div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
          {dateKey ? formatDateKeyLong(dateKey) : ""}
        </div>

        {/* Status Selection */}
        <div style={{ marginTop: 16 }}>
          <div style={labelStyle}>Status</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ATT_STATUS_LIST.map((s) => {
              const cfg = ATT_STATUS_CONFIG[s];
              const isActive = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 10px",
                    border: isActive
                      ? `2px solid ${cfg.color}`
                      : "1px solid var(--wm-er-border, #e5e7eb)",
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
        </div>

        {/* Sign In / Sign Out */}
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Sign In</label>
            <input
              type="time"
              value={signIn}
              onChange={(e) => setSignIn(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Sign Out</label>
            <input
              type="time"
              value={signOut}
              onChange={(e) => setSignOut(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Auto-calculated hours */}
        {calculatedHours !== undefined && (
          <div
            style={{
              marginTop: 8,
              padding: "8px 12px",
              borderRadius: 8,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              fontSize: 12,
              fontWeight: 700,
              color: "#15803d",
            }}
          >
            Total Hours: {calculatedHours}h
          </div>
        )}

        {/* Location */}
        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Location / Site</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Main Office, Site B"
            style={inputStyle}
          />
        </div>

        {/* Note */}
        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Actions */}
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="wm-primarybtn" type="button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </CenterModal>
  );
}