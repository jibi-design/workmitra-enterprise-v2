// src/features/employer/hrManagement/components/AttendanceQuickMark.tsx
//
// Quick Mark popover for Employer Attendance Log.
// Root Map: "Quick mark: Tap date → select status (one tap)"
// All-in-one: Status + Sign In/Out + Location + Note in single popover.
// Clear Entry shows confirmation warning before deleting.

import { useState } from "react";
import type { AttendanceDayStatus, AttendanceDayFormData } from "../types/attendanceLog.types";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";
import { ATT_STATUS_CONFIG, ATT_STATUS_LIST } from "../helpers/attendanceConstants";
import { formatDateKeyDisplay } from "../helpers/attendanceCalendarUtils";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type QuickMarkProps = {
  dateKey: string;
  hrCandidateId: string;
  currentStatus?: AttendanceDayStatus;
  onClose: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-er-text)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--wm-er-muted)",
  display: "block",
  marginBottom: 3,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — read existing entry at mount time (no useEffect needed)
// ─────────────────────────────────────────────────────────────────────────────

function getInitialEntry(hrCandidateId: string, dateKey: string) {
  const entry = attendanceLogStorage.getDayEntry(hrCandidateId, dateKey);
  return {
    status: entry?.status ?? ("present" as AttendanceDayStatus),
    signIn: entry?.signInTime ?? "",
    signOut: entry?.signOutTime ?? "",
    location: entry?.location ?? "",
    note: entry?.note ?? "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AttendanceQuickMark({
  dateKey,
  hrCandidateId,
  currentStatus,
  onClose,
}: QuickMarkProps) {
  const initial = getInitialEntry(hrCandidateId, dateKey);

  const [status, setStatus] = useState<AttendanceDayStatus>(initial.status);
  const [signIn, setSignIn] = useState(initial.signIn);
  const [signOut, setSignOut] = useState(initial.signOut);
  const [location, setLocation] = useState(initial.location);
  const [note, setNote] = useState(initial.note);
  const [clearConfirm, setClearConfirm] = useState<ConfirmData | null>(null);

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

  const handleClearRequest = () => {
    setClearConfirm({
      title: "Clear Attendance Entry",
      message: "This will permanently delete all attendance data for this date including sign in/out times, location and notes. This action cannot be undone.",
      tone: "danger",
      confirmLabel: "Clear Entry",
      cancelLabel: "Keep It",
    });
  };

  const handleClearConfirm = () => {
    attendanceLogStorage.deleteDayEntry(hrCandidateId, dateKey);
    setClearConfirm(null);
    onClose();
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Date Header */}
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>
        {formatDateKeyDisplay(dateKey)}
      </div>

      {/* Status Buttons — 2×2 grid */}
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
                padding: "9px 12px",
                border: isActive
                  ? `2px solid ${cfg.color}`
                  : "1px solid var(--wm-er-border, #e5e7eb)",
                borderRadius: 8,
                background: isActive ? cfg.bg : "#fff",
                cursor: "pointer",
                fontSize: 13,
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

      {/* Location */}
      <div style={{ marginTop: 12 }}>
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
      <div style={{ marginTop: 10 }}>
        <label style={labelStyle}>Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note..."
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* Save Button */}
      <button
        className="wm-primarybtn"
        type="button"
        onClick={handleSave}
        style={{ width: "100%", marginTop: 14 }}
      >
        Save
      </button>

      {/* Clear Entry — with confirmation warning */}
      {currentStatus && (
        <button
          type="button"
          onClick={handleClearRequest}
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

      {/* Confirm Modal for Clear Entry */}
      <ConfirmModal
        confirm={clearConfirm}
        onConfirm={handleClearConfirm}
        onCancel={() => setClearConfirm(null)}
      />
    </div>
  );
}