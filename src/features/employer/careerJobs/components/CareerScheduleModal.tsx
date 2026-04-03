// src/features/employer/careerJobs/components/CareerScheduleModal.tsx
//
// Modal for scheduling an interview round.
// Inputs: date, time, mode (in-person/phone/video), location, meeting link.
// Uses shared CenterModal shell.

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { InterviewMode, InterviewScheduleInput } from "../types/careerTypes";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  roundLabel: string;
  onClose: () => void;
  onSubmit: (data: InterviewScheduleInput) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Mode Options
// ─────────────────────────────────────────────────────────────────────────────

const MODE_OPTIONS: { value: InterviewMode; label: string }[] = [
  { value: "in-person", label: "In-person" },
  { value: "phone", label: "Phone" },
  { value: "video", label: "Video call" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  marginBottom: 4,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 14,
  fontWeight: 700,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1.5px solid var(--wm-er-border)",
  background: "var(--wm-er-bg)",
  color: "var(--wm-er-text)",
  boxSizing: "border-box",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function CareerScheduleModal({ open, roundLabel, onClose, onSubmit }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<InterviewMode>("in-person");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const canSubmit = date.trim().length > 0 && time.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      scheduledDate: date.trim(),
      scheduledTime: time.trim(),
      mode,
      location: location.trim() || undefined,
      meetingLink: meetingLink.trim() || undefined,
    });
    resetAndClose();
  }

  function resetAndClose() {
    setDate("");
    setTime("");
    setMode("in-person");
    setLocation("");
    setMeetingLink("");
    onClose();
  }

  return (
    <CenterModal open={open} onBackdropClose={resetAndClose} ariaLabel="Schedule Interview">
      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ fontSize: 15, fontWeight: 1000, color: "var(--wm-er-accent-career)", marginBottom: 4 }}>
          Schedule Interview
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 16 }}>
          {roundLabel}
        </div>

        {/* Date */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Time */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Time *</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Mode */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Interview Mode</label>
          <div style={{ display: "flex", gap: 8 }}>
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: mode === opt.value ? 900 : 700,
                  padding: "8px 6px",
                  borderRadius: 8,
                  border: mode === opt.value
                    ? "1.5px solid var(--wm-er-accent-career)"
                    : "1.5px solid var(--wm-er-border)",
                  background: mode === opt.value
                    ? "var(--wm-er-career-wash)"
                    : "var(--wm-er-bg)",
                  color: mode === opt.value
                    ? "var(--wm-er-accent-career)"
                    : "var(--wm-er-muted)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location (for in-person) */}
        {mode === "in-person" && (
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Office address or room"
              style={inputStyle}
            />
          </div>
        )}

        {/* Meeting Link (for video/phone) */}
        {(mode === "video" || mode === "phone") && (
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Meeting Link</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.example.com/..."
              style={inputStyle}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={resetAndClose}
            style={{ fontSize: 13, height: 38, padding: "0 16px" }}
          >
            Cancel
          </button>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              fontSize: 13,
              padding: "8px 20px",
              opacity: canSubmit ? 1 : 0.5,
            }}
          >
            Schedule
          </button>
        </div>
      </div>
    </CenterModal>
  );
}