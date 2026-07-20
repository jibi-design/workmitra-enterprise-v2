// App: Job Mitra / WorkMitra_Enterprise_v2
// File: HRCandidateCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\HRCandidateCard.tsx

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { HRCandidateAvatar } from "./hrCandidateCard/HRCandidateAvatar";
import { HRCandidateIdentity } from "./hrCandidateCard/HRCandidateIdentity";

type Props = {
  record: HRCandidateRecord;
  onClick: () => void;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function avatarColor(status: string): { bg: string; color: string } {
  switch (status) {
    case "active":
      return { bg: "rgba(22, 163, 74, 0.08)", color: "#15803d" };
    case "onboarding":
      return { bg: "rgba(124, 58, 237, 0.08)", color: "#7c3aed" };
    case "offered":
      return { bg: "rgba(124, 58, 237, 0.08)", color: "#7c3aed" };
    case "exit_processing":
      return { bg: "rgba(220, 38, 38, 0.08)", color: "#dc2626" };
    case "offer_pending":
      return { bg: "rgba(245, 158, 11, 0.08)", color: "#b45309" };
    case "hired":
      return { bg: "rgba(22, 163, 74, 0.08)", color: "#15803d" };
    default:
      return { bg: "rgba(124, 58, 237, 0.08)", color: "#7c3aed" };
  }
}

export function HRCandidateCard({ record, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const initials = getInitials(record.employeeName);
  const colors = avatarColor(record.status);
  const isExit = record.status === "exit_processing";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClick();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "12px 14px",
        background: "#fff",
        borderRadius: 12,
        border: isExit
          ? "1px solid rgba(220, 38, 38, 0.15)"
          : "1px solid var(--wm-er-border, #e5e7eb)",
        borderLeft: isExit ? "3px solid #dc2626" : undefined,
        cursor: "pointer",
        boxShadow: hovered ? "0 2px 8px rgba(0, 0, 0, 0.05)" : "none",
        transform: hovered ? "translateY(-1px)" : "none",
        transition: "box-shadow 0.15s ease, transform 0.15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <HRCandidateAvatar initials={initials} colors={colors} />

        <HRCandidateIdentity record={record} />
      </div>
    </div>
  );
}
