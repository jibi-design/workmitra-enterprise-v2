import type { AppLite } from "../../types/careerApplicationTypes";

export const CAREER_TEXT = "#0f172a";
export const CAREER_MUTED = "#64748b";

export const CARD_INTERACTIONS = `
  .wm-app-card {
    transition: transform 0.25s var(--wm-motion-spring), box-shadow 0.25s var(--wm-motion-spring) !important;
  }
  .wm-app-card:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 14px 32px rgba(29, 78, 216, 0.12) !important;
  }
  .wm-app-card:active {
    transform: scale(0.98) !important;
  }
  @media (prefers-reduced-motion: reduce) {
    .wm-app-card,
    .wm-app-card:hover,
    .wm-app-card:active {
      transition: none !important;
      transform: none !important;
      box-shadow: none !important;
    }
  }
`;

export function formatScheduleMode(mode: string): string {
  if (mode === "in-person") return "In-person";
  if (mode === "phone") return "Phone";
  if (mode === "video") return "Video call";
  return "Interview";
}

export function formatScheduleDate(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00`);

  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatScheduleTime(timeValue: string): string {
  const date = new Date(`2000-01-01T${timeValue}`);

  if (Number.isNaN(date.getTime())) return timeValue;

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isExternalMeetingLink(value: string | undefined): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function statusPillClass(stage: AppLite["stage"]): string {
  if (stage === "applied") return "wm-career-pill wm-career-pill--pending";
  if (stage === "shortlisted") return "wm-career-pill wm-career-pill--shortlisted";
  if (stage === "interview") return "wm-career-pill wm-career-pill--interview";
  if (stage === "offered" || stage === "offer_accepted") {
    return "wm-career-pill wm-career-pill--offered";
  }
  if (stage === "hired") return "wm-career-pill wm-career-pill--hired";
  return "wm-career-pill wm-career-pill--rejected";
}

export function cardLeftColor(stage: AppLite["stage"]): string {
  if (stage === "hired") return "var(--wm-career-success, #16a34a)";
  if (stage === "offer_accepted" || stage === "offered") return "var(--wm-career-accent, #1d4ed8)";
  if (stage === "interview") return "#7c3aed";
  if (stage === "shortlisted") return "#1d4ed8";
  if (stage === "rejected" || stage === "withdrawn" || stage === "offer_declined") return "#94a3b8";
  return "#f59e0b";
}
