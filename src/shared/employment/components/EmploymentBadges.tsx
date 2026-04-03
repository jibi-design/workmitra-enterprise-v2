// src/shared/employment/components/EmploymentBadges.tsx
// Session 17: Status badge, notice period display, duplicate employment warning.

import type { EmploymentRecord } from "../employmentTypes";
import {
  getStatusBadge,
  getNoticeCountdownText,
  getNoticeDaysRemaining,
  formatDate,
  getDuplicateWarning,
} from "../employmentDisplayHelpers";

/* ── Status Badge ── */
export function EmploymentStatusBadge({ record }: { record: EmploymentRecord }) {
  const badge = getStatusBadge(record);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        color: badge.color,
        background: badge.bgColor,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: badge.color,
          flexShrink: 0,
        }}
      />
      {badge.label}
    </span>
  );
}

/* ── Notice Period Card ── */
export function NoticePeriodCard({ record }: { record: EmploymentRecord }) {
  if (record.status !== "notice") return null;

  const daysLeft = getNoticeDaysRemaining(record);
  const countdownText = getNoticeCountdownText(record);
  const lastDay = formatDate(record.lastWorkingDay);
  const isExpired = daysLeft <= 0;

  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 16px",
        borderRadius: "var(--wm-radius-14, 14px)",
        border: `1px solid ${isExpired ? "rgba(220,38,38,0.2)" : "rgba(180,83,9,0.15)"}`,
        background: isExpired ? "rgba(220,38,38,0.04)" : "rgba(180,83,9,0.04)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-text-muted, #64748b)", letterSpacing: 0.3 }}>
        Notice period
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 15,
          fontWeight: 700,
          color: isExpired ? "var(--wm-error, #dc2626)" : "#b45309",
        }}
      >
        {countdownText}
      </div>
      {record.lastWorkingDay && (
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-text-muted, #64748b)" }}>
          Last working day: {lastDay}
        </div>
      )}
    </div>
  );
}

/* ── Duplicate Employment Warning ── */
export function DuplicateEmploymentBanner({ companyName }: { companyName: string }) {
  return (
    <div
      role="alert"
      style={{
        marginTop: 12,
        padding: "12px 16px",
        borderRadius: "var(--wm-radius-14, 14px)",
        border: "1px solid rgba(180,83,9,0.2)",
        background: "rgba(180,83,9,0.04)",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">⚠️</span>
      <div style={{ fontSize: 13, lineHeight: 1.5, color: "#92400e" }}>
        {getDuplicateWarning(companyName)}
      </div>
    </div>
  );
}