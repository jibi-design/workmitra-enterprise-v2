import type { CSSProperties } from "react";
import type { InterviewMode } from "../types/careerTypes";

export const MODE_OPTIONS: { value: InterviewMode; label: string }[] = [
  { value: "in-person", label: "In-person" },
  { value: "phone", label: "Phone" },
  { value: "video", label: "Video call" },
];

export const CAREER_BLUE_DEEP = "#1e3a8a";
export const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
export const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

export const SCHEDULE_MODAL_INTERACTIONS = `
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

export const modalShellStyle: CSSProperties = {
  padding: 32,
  borderRadius: "var(--wm-radius-employer-card)",
  background: "linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.96) 100%)",
  border: "1px solid rgba(255,255,255,0.8)",
  boxShadow: "0 32px 64px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.6)",
  backdropFilter: "blur(40px)",
  width: "100%",
  maxWidth: "var(--wm-shell-max, 520px)",
  boxSizing: "border-box",
};

export const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: CAREER_MUTED,
  marginBottom: 8,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

export const inputStyle: CSSProperties = {
  width: "100%",
  fontSize: 15,
  fontWeight: 800,
  padding: "16px 18px",
  borderRadius: "var(--wm-radius-employee-card)",
  border: "1px solid rgba(203, 213, 225, 0.6)",
  background: "rgba(241, 245, 249, 0.5)",
  color: CAREER_TEXT,
  boxSizing: "border-box",
  outline: "none",
  colorScheme: "light",
};
