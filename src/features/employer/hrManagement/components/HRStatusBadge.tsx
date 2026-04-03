// src/features/employer/hrManagement/components/HRStatusBadge.tsx
//
// Status badge for HR candidate records.
// Color-coded by lifecycle stage.

import type { HRCandidateStatus } from "../types/hrManagement.types";

type BadgeConfig = {
  label: string;
  color: string;
  bg: string;
  border: string;
};

const STATUS_MAP: Record<HRCandidateStatus, BadgeConfig> = {
  offer_pending: {
    label: "Offer Pending",
    color: "#d97706",
    bg: "rgba(217, 119, 6, 0.08)",
    border: "rgba(217, 119, 6, 0.2)",
  },
  offered: {
    label: "Offered",
    color: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.08)",
    border: "rgba(124, 58, 237, 0.2)",
  },
  offer_rejected: {
    label: "Offer Rejected",
    color: "#dc2626",
    bg: "rgba(220, 38, 38, 0.08)",
    border: "rgba(220, 38, 38, 0.2)",
  },
  hired: {
    label: "Hired",
    color: "#16a34a",
    bg: "rgba(22, 163, 74, 0.08)",
    border: "rgba(22, 163, 74, 0.2)",
  },
  onboarding: {
    label: "Onboarding",
    color: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.08)",
    border: "rgba(124, 58, 237, 0.2)",
  },
  active: {
    label: "Active",
    color: "#16a34a",
    bg: "rgba(22, 163, 74, 0.08)",
    border: "rgba(22, 163, 74, 0.2)",
  },
  exit_processing: {
    label: "Exit Processing",
    color: "#dc2626",
    bg: "rgba(220, 38, 38, 0.08)",
    border: "rgba(220, 38, 38, 0.2)",
  },
};

type Props = {
  status: HRCandidateStatus;
};

export function HRStatusBadge({ status }: Props) {
  const cfg = STATUS_MAP[status];

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 900,
        padding: "2px 8px",
        borderRadius: 999,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}
