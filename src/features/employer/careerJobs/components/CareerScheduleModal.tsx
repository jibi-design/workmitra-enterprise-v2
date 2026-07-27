// App name: Job Mitra
// File name: CareerScheduleModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerScheduleModal.tsx

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { InterviewMode, InterviewScheduleInput } from "../types/careerTypes";
import { CareerScheduleModalBody } from "./CareerScheduleModalBody";
import {
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
  modalShellStyle,
  SCHEDULE_MODAL_INTERACTIONS,
} from "./careerScheduleModal.styles";
import { getScheduleValidationMessage } from "./careerScheduleModal.validation";

type Props = {
  open: boolean;
  roundLabel: string;
  onClose: () => void;
  onSubmit: (data: InterviewScheduleInput) => void;
};

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
            gap: "var(--wm-stack-gap)",
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
                marginTop: "var(--wm-space-8)",
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: "var(--wm-radius-button)",
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
            className="wm-ghostBtn"
            aria-label="Close schedule interview"
            style={{
              width: 36,
              height: 36,
              padding: 0,
              borderRadius: "var(--wm-radius-chip)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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

        <CareerScheduleModalBody
          date={date}
          time={time}
          mode={mode}
          location={location}
          meetingLink={meetingLink}
          scheduleValidationMessage={scheduleValidationMessage}
          canSubmit={canSubmit}
          onDateChange={setDate}
          onTimeChange={setTime}
          onModeChange={setMode}
          onLocationChange={setLocation}
          onMeetingLinkChange={setMeetingLink}
          onCancel={resetAndClose}
          onSubmit={handleSubmit}
        />
      </div>
    </CenterModal>
  );
}
