// App name: Job Mitra
// File name: CareerScheduleModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerScheduleModal.tsx

import { useState } from "react";
import type { CSSProperties } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { InterviewMode, InterviewScheduleInput } from "../types/careerTypes";

type Props = {
  open: boolean;
  roundLabel: string;
  onClose: () => void;
  onSubmit: (data: InterviewScheduleInput) => void;
};

const MODE_OPTIONS: { value: InterviewMode; label: string }[] = [
  { value: "in-person", label: "In-person" },
  { value: "phone", label: "Phone" },
  { value: "video", label: "Video call" },
];

const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
const MIN_SCHEDULE_BUFFER_MINUTES = 30;
const MIN_SCHEDULE_BUFFER_MS = MIN_SCHEDULE_BUFFER_MINUTES * 60 * 1000;

const SCHEDULE_MODAL_INTERACTIONS = `
  .wm-schedule-input {
    transition: all var(--wm-motion-base) var(--wm-motion-spring) !important;
  }
  .wm-schedule-input:focus {
    border-color: #2563eb !important;
    background-color: #ffffff !important;
    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.12), inset 0 0 0 1px #2563eb !important;
  }

  .wm-segment-btn {
    transition: all var(--wm-motion-fast) var(--wm-motion-spring) !important;
  }
  .wm-segment-btn:active {
    transform: scale(0.96);
  }

  .wm-schedule-submit-btn {
    transition: all var(--wm-motion-base) var(--wm-motion-spring) !important;
    background-size: 200% auto !important;
  }
  .wm-schedule-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.25) !important;
    background-position: right center !important;
  }
  .wm-schedule-submit-btn:active:not(:disabled) {
    transform: scale(0.96) !important;
  }

  .wm-schedule-cancel-btn {
    transition: all var(--wm-motion-fast) var(--wm-motion-spring) !important;
  }
  .wm-schedule-cancel-btn:hover {
    background: #f1f5f9 !important;
    color: #0f172a !important;
  }
  .wm-schedule-cancel-btn:active {
    transform: scale(0.97) !important;
  }
`;

const modalShellStyle: CSSProperties = {
  padding: 32,
  borderRadius: 32,
  background: "linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.96) 100%)",
  border: "1px solid rgba(255,255,255,0.8)",
  boxShadow: "0 32px 64px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.6)",
  backdropFilter: "blur(40px)",
  width: "100%",
  maxWidth: 520,
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: CAREER_MUTED,
  marginBottom: 8,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const inputStyle: CSSProperties = {
  width: "100%",
  fontSize: 15,
  fontWeight: 800,
  padding: "16px 18px",
  borderRadius: 20,
  border: "1px solid rgba(203, 213, 225, 0.6)",
  background: "rgba(241, 245, 249, 0.5)",
  color: CAREER_TEXT,
  boxSizing: "border-box",
  outline: "none",
  colorScheme: "light",
};

function getTodayInputValue(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getScheduleValidationMessage(
  dateValue: string,
  timeValue: string,
  mode: InterviewMode,
  locationValue: string,
  meetingLinkValue: string,
): string {
  if (!dateValue.trim() || !timeValue.trim()) {
    return "Select both date and time to enable scheduling.";
  }

  const selectedDateTime = new Date(`${dateValue}T${timeValue}`);

  if (Number.isNaN(selectedDateTime.getTime())) {
    return "Enter a valid interview date and time.";
  }

  if (selectedDateTime.getTime() < Date.now() + MIN_SCHEDULE_BUFFER_MS) {
    return `Choose a future time at least ${MIN_SCHEDULE_BUFFER_MINUTES} minutes from now.`;
  }

  if (mode === "in-person" && locationValue.trim().length < 3) {
    return "Add the interview location for an in-person interview.";
  }

  if (mode === "phone" && locationValue.trim().length < 3) {
    return "Add a phone number or contact note for a phone interview.";
  }

  if (mode === "video" && !isValidHttpUrl(meetingLinkValue.trim())) {
    return "Add a valid meeting link for a video interview.";
  }

  return "";
}

export function CareerScheduleModal({ open, roundLabel, onClose, onSubmit }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<InterviewMode>("in-person");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const scheduleValidationMessage = getScheduleValidationMessage(
    date,
    time,
    mode,
    location,
    meetingLink,
  );
  const canSubmit = scheduleValidationMessage.length === 0;

  function handleSubmit() {
    if (!canSubmit) return;

    onSubmit({
      scheduledDate: date.trim(),
      scheduledTime: time.trim(),
      mode,
      location: mode === "in-person" || mode === "phone" ? location.trim() || undefined : undefined,
      meetingLink: mode === "video" ? meetingLink.trim() || undefined : undefined,
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
    <CenterModal open={open} onBackdropClose={() => {}} ariaLabel="Schedule Interview">
      <div className="wm-premium-modal" style={modalShellStyle}>
        <style>{SCHEDULE_MODAL_INTERACTIONS}</style>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{ fontSize: 24, fontWeight: 900, color: CAREER_TEXT, letterSpacing: "-0.5px" }}
            >
              Schedule Interview
            </div>
            <div
              style={{
                marginTop: 8,
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 12,
                background: "rgba(37,99,235,0.08)",
                color: CAREER_BLUE_DEEP,
                fontSize: 11,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              {roundLabel}
            </div>
          </div>

          <button
            type="button"
            onClick={resetAndClose}
            className="wm-schedule-cancel-btn"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              border: "none",
              background: "rgba(15,23,42,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: CAREER_MUTED,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={labelStyle}>
              Date <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="date"
              value={date}
              min={getTodayInputValue()}
              onChange={(event) => setDate(event.target.value)}
              className="wm-schedule-input"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Time <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="wm-schedule-input"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <label style={labelStyle}>Interview mode</label>

          {/* iOS Style Segmented Control */}
          <div
            style={{
              display: "flex",
              padding: 6,
              background: "rgba(241, 245, 249, 0.8)",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.04)",
              gap: 4,
            }}
          >
            {MODE_OPTIONS.map((option) => {
              const selected = mode === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className="wm-segment-btn"
                  style={{
                    flex: 1,
                    minHeight: 44,
                    fontSize: 13,
                    fontWeight: 800,
                    borderRadius: 16,
                    border: "none",
                    background: selected ? "#ffffff" : "transparent",
                    color: selected ? CAREER_BLUE_DEEP : CAREER_MUTED,
                    cursor: "pointer",
                    boxShadow: selected ? "0 4px 12px rgba(15, 23, 42, 0.08)" : "none",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {mode === "in-person" && (
          <div style={{ marginTop: 24 }}>
            <label style={labelStyle}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Office address, floor, or room"
              className="wm-schedule-input"
              style={inputStyle}
            />
          </div>
        )}

        {mode === "phone" && (
          <div style={{ marginTop: 24 }}>
            <label style={labelStyle}>Phone number or contact note</label>
            <input
              type="tel"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Enter phone number or contact note"
              className="wm-schedule-input"
              style={inputStyle}
            />
            <div
              style={{
                marginTop: 10,
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(241,245,249,0.8)",
                color: CAREER_MUTED,
                fontSize: 12,
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              Saves a local schedule note only. No real call is made from the app.
            </div>
          </div>
        )}

        {mode === "video" && (
          <div style={{ marginTop: 24 }}>
            <label style={labelStyle}>Meeting link</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(event) => setMeetingLink(event.target.value)}
              placeholder="Paste meeting link (e.g., Zoom, Meet)"
              className="wm-schedule-input"
              style={inputStyle}
            />
          </div>
        )}

        {!canSubmit && (
          <div
            style={{
              marginTop: 20,
              padding: "14px 18px",
              borderRadius: 16,
              background: "rgba(239,246,255,0.6)",
              border: "1px solid rgba(219,234,254,0.8)",
              color: "#1e40af",
              fontSize: 13,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            {scheduleValidationMessage}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
          <button
            className="wm-schedule-cancel-btn"
            type="button"
            onClick={resetAndClose}
            style={{
              fontSize: 14,
              fontWeight: 800,
              minHeight: 52,
              padding: "0 24px",
              borderRadius: 18,
              background: "transparent",
              border: "none",
              color: CAREER_MUTED,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            className="wm-schedule-submit-btn"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              fontSize: 14,
              fontWeight: 900,
              minHeight: 52,
              padding: "0 32px",
              borderRadius: 18,
              background: canSubmit
                ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 51%, #1e3a8a 100%)"
                : "#cbd5e1",
              border: "none",
              color: canSubmit ? "#ffffff" : "#94a3b8",
              opacity: canSubmit ? 1 : 0.6,
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit ? "0 8px 24px rgba(37,99,235,0.25)" : "none",
            }}
          >
            Confirm Schedule
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
