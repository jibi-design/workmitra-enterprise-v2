import type { CSSProperties } from "react";
import type { CareerJobType, CareerWorkMode } from "../types/careerTypes";

export const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
export const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
export const CAREER_MUTED = "var(--wm-er-muted, #475569)";

export const PREMIUM_INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: "var(--wm-radius-button)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "rgba(255, 255, 255, 0.8)",
  padding: "0 14px",
  color: CAREER_TEXT,
  fontSize: 13.5,
  fontWeight: 600,
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
  outline: "none",
  transition: "all var(--wm-motion-fast) var(--wm-motion-spring)",
};

export const PREMIUM_LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: CAREER_MUTED,
  marginBottom: 6,
  display: "block",
};

export const PREMIUM_CARD_STYLE: CSSProperties = {
  padding: 20,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
};

export type StepBasicData = {
  companyName: string;
  jobTitle: string;
  department: string;
  jobType: CareerJobType;
  workMode: CareerWorkMode;
  location: string;
  vacancies: string;
  probationPeriod: string;
};

export type CareerCreateStepBasicProps = {
  data: StepBasicData;
  onChange: (updates: Partial<StepBasicData>) => void;
};

export function jobTypeLabel(type: CareerJobType): string {
  if (type === "full-time") return "Full-time";
  if (type === "part-time") return "Part-time";
  return "Contract";
}

export function workModeLabel(mode: CareerWorkMode): string {
  if (mode === "on-site") return "On-site";
  if (mode === "remote") return "Remote";
  return "Hybrid";
}

function removeAutocompleteDuplicate(previousValue: string, nextValue: string): string {
  const previous = previousValue.trim();
  const next = nextValue.trim();
  if (previous.length < 2 || next.length <= previous.length) return nextValue;
  const previousLower = previous.toLowerCase();
  const nextLower = next.toLowerCase();
  if (!nextLower.startsWith(previousLower)) return nextValue;
  const appended = next.slice(previous.length);
  const appendedLower = appended.toLowerCase();
  if (appendedLower.startsWith(previousLower)) return appended;
  return nextValue;
}

function capitalizeFirstLetter(value: string): string {
  const firstLetterIndex = value.search(/[A-Za-z]/);
  if (firstLetterIndex === -1) return value;
  return `${value.slice(0, firstLetterIndex)}${value.charAt(firstLetterIndex).toUpperCase()}${value.slice(
    firstLetterIndex + 1,
  )}`;
}

export function normalizeTextInput(previousValue: string, nextValue: string): string {
  return capitalizeFirstLetter(removeAutocompleteDuplicate(previousValue, nextValue));
}
