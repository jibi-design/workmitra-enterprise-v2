import { getStatusLabel } from "../../../../../shared/employment/employmentDisplayHelpers";
import type { EmploymentRecord } from "../../../../../shared/employment/employmentTypes";
import {
  CAREER_BLUE,
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
  WARNING,
  formatDateLabel,
  getNoticeDaysLeft,
} from "./CareerWorkspaceEmploymentPanels.helpers";

export function CareerStatusBadge({ record }: { record: EmploymentRecord }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 11px",
        borderRadius: "var(--wm-radius-pill)",
        border: "1px solid rgba(29,78,216,0.16)",
        background: "rgba(29,78,216,0.08)",
        color: CAREER_BLUE_DEEP,
        fontSize: 10.8,
        fontWeight: 950,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "var(--wm-radius-pill)",
          background: CAREER_BLUE,
        }}
      />
      {getStatusLabel(record)}
    </span>
  );
}

export function NoticeCountdownPanel({ record }: { record: EmploymentRecord }) {
  if (record.status !== "notice" && record.status !== "resigned") return null;

  const hasNoticePeriod = record.noticePeriodDays > 0 && !!record.lastWorkingDay;
  const daysLeft = hasNoticePeriod ? getNoticeDaysLeft(record.lastWorkingDay) : null;
  const countdownLabel = !hasNoticePeriod
    ? "No notice period"
    : daysLeft === null
      ? "Notice period active"
      : daysLeft <= 0
        ? "Notice period completed"
        : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;

  const lastWorkingDateLabel = hasNoticePeriod
    ? formatDateLabel(record.lastWorkingDay)
    : "Can close now";

  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 12px",
        borderRadius: "var(--wm-radius-chip)",
        background: "linear-gradient(135deg, rgba(255,251,235,0.92), rgba(255,255,255,0.96))",
        border: "1px solid rgba(217,119,6,0.18)",
      }}
    >
      <div style={{ fontSize: 12.8, fontWeight: 950, color: WARNING }}>
        {hasNoticePeriod ? "Notice period countdown" : "Resignation submitted"}
      </div>

      <div
        style={{
          marginTop: 9,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        <div
          style={{
            padding: "10px 11px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(217,119,6,0.08)",
            border: "1px solid rgba(217,119,6,0.14)",
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED }}>
            {hasNoticePeriod ? "Days left" : "Notice status"}
          </div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 950, color: WARNING }}>
            {countdownLabel}
          </div>
        </div>

        <div
          style={{
            padding: "10px 11px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(15,23,42,0.035)",
            border: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED }}>
            {hasNoticePeriod ? "Last working date" : "Employer action"}
          </div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 950, color: CAREER_TEXT }}>
            {lastWorkingDateLabel}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 9,
          fontSize: 11.6,
          color: CAREER_MUTED,
          lineHeight: 1.45,
          fontWeight: 750,
        }}
      >
        {hasNoticePeriod
          ? "Your employment stays active during notice period. The employer should close the record on or after the last working date."
          : "Your employer can review and close this employment record now because no notice period is required."}
      </div>
    </div>
  );
}
