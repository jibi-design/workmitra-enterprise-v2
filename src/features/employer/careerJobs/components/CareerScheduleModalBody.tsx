import type { InterviewMode } from "../types/careerTypes";
import { PhoneNumberField } from "../../../../shared/phone";
import {
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  inputStyle,
  labelStyle,
  MODE_OPTIONS,
} from "./careerScheduleModal.styles";
import { getTodayInputValue } from "./careerScheduleModal.validation";

type CareerScheduleModalBodyProps = {
  date: string;
  time: string;
  mode: InterviewMode;
  location: string;
  meetingLink: string;
  scheduleValidationMessage: string;
  canSubmit: boolean;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onModeChange: (value: InterviewMode) => void;
  onLocationChange: (value: string) => void;
  onMeetingLinkChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export function CareerScheduleModalBody({
  date,
  time,
  mode,
  location,
  meetingLink,
  scheduleValidationMessage,
  canSubmit,
  onDateChange,
  onTimeChange,
  onModeChange,
  onLocationChange,
  onMeetingLinkChange,
  onCancel,
  onSubmit,
}: CareerScheduleModalBodyProps) {
  return (
    <>
      <div
        style={{
          marginTop: "var(--wm-space-28)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--wm-space-20)",
        }}
      >
        <div>
          <label style={labelStyle}>
            Date <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="date"
            value={date}
            min={getTodayInputValue()}
            onChange={(event) => onDateChange(event.target.value)}
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
            onChange={(event) => onTimeChange(event.target.value)}
            className="wm-schedule-input"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginTop: "var(--wm-space-24)" }}>
        <label style={labelStyle}>Interview mode</label>

        <div
          style={{
            display: "flex",
            padding: "var(--wm-space-6)",
            background: "rgba(241, 245, 249, 0.8)",
            borderRadius: "var(--wm-radius-employee-card)",
            border: "1px solid rgba(0,0,0,0.04)",
            gap: "var(--wm-space-4)",
          }}
        >
          {MODE_OPTIONS.map((option) => {
            const selected = mode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onModeChange(option.value)}
                className="wm-segment-btn"
                style={{
                  flex: 1,
                  minHeight: 44,
                  fontSize: 13,
                  fontWeight: 800,
                  borderRadius: "var(--wm-radius-chip)",
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
        <div style={{ marginTop: "var(--wm-space-24)" }}>
          <label style={labelStyle}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="Office address, floor, or room"
            className="wm-schedule-input"
            style={inputStyle}
          />
        </div>
      )}

      {mode === "phone" && (
        <div style={{ marginTop: "var(--wm-space-24)" }}>
          <label style={labelStyle}>Phone number or contact note</label>
          <PhoneNumberField
            value={location}
            onChange={onLocationChange}
            placeholder="Mobile number"
            className="wm-schedule-input"
            testId="career-schedule-phone"
          />
          <div
            style={{
              marginTop: "var(--wm-space-10)",
              padding: "10px 14px",
              borderRadius: "var(--wm-radius-button)",
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
        <div style={{ marginTop: "var(--wm-space-24)" }}>
          <label style={labelStyle}>Meeting link</label>
          <input
            type="url"
            value={meetingLink}
            onChange={(event) => onMeetingLinkChange(event.target.value)}
            placeholder="Paste meeting link (e.g., Zoom, Meet)"
            className="wm-schedule-input"
            style={inputStyle}
          />
        </div>
      )}

      {!canSubmit && (
        <div
          style={{
            marginTop: "var(--wm-space-20)",
            padding: "14px 18px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(239,246,255,0.6)",
            border: "1px solid rgba(219,234,254,0.8)",
            color: "#1e40af",
            fontSize: 13,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "var(--wm-space-10)",
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

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "var(--wm-space-12)",
          marginTop: "var(--wm-space-32)",
        }}
      >
        <button className="wm-outlineBtn" type="button" onClick={onCancel}>
          Cancel
        </button>

        <button className="wm-primarybtn" type="button" onClick={onSubmit} disabled={!canSubmit}>
          Confirm Schedule
        </button>
      </div>
    </>
  );
}
