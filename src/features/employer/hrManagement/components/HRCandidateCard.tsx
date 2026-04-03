// src/features/employer/hrManagement/components/HRCandidateCard.tsx
//
// Enterprise-grade HR candidate card.
// Shows: avatar initials, name, role + department, status badge,
// contextual info (probation days, onboarding progress, notice period, etc.)

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { HRStatusBadge } from "./HRStatusBadge";

type Props = {
  record: HRCandidateRecord;
  onClick: () => void;
};

/* ── Helpers ── */

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

function formatShortDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

function daysFromNow(ts: number): number {
  return Math.max(0, Math.ceil((ts - Date.now()) / 86400000));
}

function formatDuration(ms: number): string {
  const days = Math.floor(ms / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

/* ── Contextual Info Line ── */

function ContextLine({ record }: { record: HRCandidateRecord }) {
  const [nowMs] = useState(() => Date.now());

  /* Active — show phase info */
  if (record.status === "active") {
    if (record.employmentPhase === "probation" && record.probationEndDate) {
      const daysLeft = daysFromNow(record.probationEndDate);
      const isUrgent = daysLeft <= 14;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
            Joined {formatShortDate(record.movedToHRAt)}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: isUrgent ? "#dc2626" : "#b45309",
            }}
          >
            Probation — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
          </span>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
          Joined {formatShortDate(record.movedToHRAt)}
        </span>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#15803d" }}>Confirmed</span>
      </div>
    );
  }

  /* Onboarding — show progress */
  if (record.status === "onboarding" && record.onboarding) {
    const total = record.onboarding.items.length;
    const done = record.onboarding.items.filter((i) => i.completedAt).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
          Started {formatShortDate(record.onboarding.startedAt)}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 36,
              height: 3,
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                borderRadius: 999,
                background: "#7c3aed",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 9, fontWeight: 800, color: "#7c3aed" }}>
            {done}/{total}
          </span>
        </div>
      </div>
    );
  }

  /* Exit — show notice period */
  if (record.status === "exit_processing" && record.exitData) {
    const notice = record.exitData.noticePeriod;
    if (notice?.endDate) {
      const daysLeft = daysFromNow(notice.endDate);
      const clearanceItems = record.exitData.clearanceItems ?? [];
      const clearanceDone = clearanceItems.filter((i: { completedAt?: number }) => i.completedAt).length;
      const clearanceTotal = clearanceItems.length;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626" }}>
            Notice: {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
          </span>
          {clearanceTotal > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 36,
                  height: 3,
                  borderRadius: 999,
                  background: "rgba(15, 23, 42, 0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: clearanceTotal > 0 ? `${Math.round((clearanceDone / clearanceTotal) * 100)}%` : "0%",
                    height: "100%",
                    borderRadius: 999,
                    background: "#dc2626",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: 9, fontWeight: 800, color: "#991b1b" }}>
                {clearanceDone}/{clearanceTotal}
              </span>
            </div>
          )}
        </div>
      );
    }
  }

  /* Offered — show waiting time */
  if (record.status === "offered" && record.offerLetter?.sentAt) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
          Offered {formatDuration(nowMs - record.offerLetter.sentAt)}
        </span>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#7c3aed" }}>Awaiting response</span>
      </div>
    );
  }

  /* Default — moved time */
  return (
    <div style={{ marginTop: 4 }}>
      <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
        Moved {formatDuration(nowMs - record.movedToHRAt)}
      </span>
    </div>
  );
}

/* ── Card Component ── */

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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
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
        {/* Avatar */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: colors.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 12,
            color: colors.color,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: "var(--wm-er-text, #0f172a)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {record.employeeName}
            </span>
            <HRStatusBadge status={record.status} />
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--wm-er-muted, #64748b)",
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {record.jobTitle}
            {record.department ? ` — ${record.department}` : ""}
          </div>
          <ContextLine record={record} />
        </div>

        {/* Chevron */}
        <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }} aria-hidden="true">
          <path
            fill="#cbd5e1"
            d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
          />
        </svg>
      </div>
    </div>
  );
}
