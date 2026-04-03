// src/features/employer/hrManagement/components/HREmptyState.tsx
//
// Professional empty state per tab.
// 10/10: Contextual icons per tab, no jargon, info only.

import type { HRCandidateStatus } from "../types/hrManagement.types";

type Props = {
  tab: HRCandidateStatus;
};

type EmptyConfig = {
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
  iconPath: string;
};

const CONFIG: Record<HRCandidateStatus, EmptyConfig> = {
  offer_pending: {
    title: "No candidates pending offer",
    description:
      "Candidates who clear all interview rounds will appear here automatically for offer review.",
    iconColor: "#b45309",
    iconBg: "rgba(245, 158, 11, 0.08)",
    iconPath: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  },
  offered: {
    title: "No offers sent",
    description:
      "Send an offer letter from the Pending tab to move candidates here.",
    iconColor: "#7c3aed",
    iconBg: "rgba(124, 58, 237, 0.08)",
    iconPath: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  },
  offer_rejected: {
    title: "No rejected offers",
    description: "Candidates who decline your offer will appear here.",
    iconColor: "#dc2626",
    iconBg: "rgba(220, 38, 38, 0.08)",
    iconPath: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z",
  },
  hired: {
    title: "No hired candidates",
    description: "Candidates who accept your offer will move here automatically.",
    iconColor: "#16a34a",
    iconBg: "rgba(22, 163, 74, 0.08)",
    iconPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  },
  onboarding: {
    title: "No one in onboarding",
    description: "Hired candidates will appear here when onboarding begins.",
    iconColor: "#7c3aed",
    iconBg: "rgba(124, 58, 237, 0.08)",
    iconPath: "M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  },
  active: {
    title: "No active employees",
    description: "Employees who complete onboarding will be shown here.",
    iconColor: "#15803d",
    iconBg: "rgba(22, 163, 74, 0.08)",
    iconPath: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  },
  exit_processing: {
    title: "No exit processing",
    description: "Employees who resign or are released will appear here.",
    iconColor: "#dc2626",
    iconBg: "rgba(220, 38, 38, 0.08)",
    iconPath: "M10.79 16.29c.39.39 1.02.39 1.41 0l3.59-3.59a.996.996 0 000-1.41L12.2 7.7a.996.996 0 10-1.41 1.41L12.67 11H4c-.55 0-1 .45-1 1s.45 1 1 1h8.67l-1.88 1.88c-.39.39-.38 1.03 0 1.41zM19 3H5c-1.11 0-2 .9-2 2v3c0 .55.45 1 1 1s1-.45 1-1V5h14v14H5v-3c0-.55-.45-1-1-1s-1 .45-1 1v3c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
  },
};

export function HREmptyState({ tab }: Props) {
  const cfg = CONFIG[tab];

  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 20px",
        borderRadius: 12,
        border: "1.5px dashed var(--wm-er-border, #e5e7eb)",
        background: "rgba(15, 23, 42, 0.01)",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          background: cfg.iconBg,
          border: `1px solid ${cfg.iconColor}12`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
          <path fill={cfg.iconColor} d={cfg.iconPath} />
        </svg>
      </div>
      <div
        style={{
          fontWeight: 900,
          fontSize: 14,
          color: "var(--wm-er-text, #0f172a)",
        }}
      >
        {cfg.title}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--wm-er-muted, #64748b)",
          marginTop: 6,
          lineHeight: 1.6,
          maxWidth: 260,
          margin: "6px auto 0",
        }}
      >
        {cfg.description}
      </div>
    </div>
  );
}
