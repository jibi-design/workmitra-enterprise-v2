// src/features/employee/shiftJobs/components/ShiftApplyJobCard.tsx
//
// Shift job search card — company, location, pay, experience.
// Includes EmployerTrustBadge for employer rating visibility.

import type { ShiftPostDemo } from "../helpers/shiftApplyHelpers";
import { cap, expLabel, fmtDateRange } from "../helpers/shiftApplyHelpers";
import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";

/* ── Constants ─────────────────────────────────── */

const SHIFT_GREEN = "var(--wm-er-accent-shift, #16a34a)";
const ICON_GREY = "#64748b";

const DETAIL_ROW: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10, fontSize: 12,
  color: "var(--wm-er-muted)",
};

const DETAIL_ICON: React.CSSProperties = {
  width: 18, height: 18, flexShrink: 0,
};

/* ── Props ─────────────────────────────────────── */

type Props = {
  post: ShiftPostDemo;
  isApplied: boolean;
  isWithdrawn: boolean;
};

/* ── Component ─────────────────────────────────── */

export function ShiftApplyJobCard({ post, isApplied, isWithdrawn }: Props) {
  const dateRange = fmtDateRange(post.startAt, post.endAt);

  return (
    <section className="wm-ee-card" style={{
      marginTop: 12,
      borderLeft: "4px solid var(--wm-er-accent-shift, #16a34a)",
    }}>
      {/* Title + Pay */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--wm-er-text)" }}>
            {cap(post.jobName)}
          </div>
          <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 2 }}>
            {cap(post.companyName)} · {cap(post.locationName)} · {dateRange}
          </div>

          {/* Employer Trust Badge */}
          <EmployerTrustBadge variant="compact" />
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", padding: "6px 14px",
          borderRadius: 999, background: "rgba(22,163,74,0.1)",
          color: SHIFT_GREEN, fontSize: 14, fontWeight: 700,
          border: "1px solid rgba(22,163,74,0.2)",
        }}>
          {post.payPerDay} / day
        </div>
      </div>

      {/* Status badge */}
      {(isApplied || isWithdrawn) && (
        <div style={{ marginTop: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 10,
            background: isApplied ? "rgba(22,163,74,0.1)" : "rgba(217,119,6,0.1)",
            color: isApplied ? "var(--wm-er-accent-shift, #16a34a)" : "#d97706",
          }}>
            {isApplied ? "Applied" : "Withdrawn"}
          </span>
        </div>
      )}

      {/* Structured details */}
      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div style={DETAIL_ROW}>
          <svg style={DETAIL_ICON} viewBox="0 0 24 24"><path fill={ICON_GREY} d="M14 6V4h-4v2h4ZM4 8v11h16V8H4Zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4Z" /></svg>
          <span><b>Company:</b> {cap(post.companyName)}</span>
        </div>
        <div style={DETAIL_ROW}>
          <svg style={DETAIL_ICON} viewBox="0 0 24 24"><path fill={ICON_GREY} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z" /></svg>
          <span><b>Location:</b> {cap(post.locationName)}{post.distanceKm > 0 ? ` · ${post.distanceKm} km` : ""}</span>
        </div>
        <div style={DETAIL_ROW}>
          <svg style={DETAIL_ICON} viewBox="0 0 24 24"><path fill={ICON_GREY} d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v14A2.5 2.5 0 0 1 19.5 23h-15A2.5 2.5 0 0 1 2 20.5v-14A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Z" /></svg>
          <span><b>Date:</b> {dateRange}</span>
        </div>
        <div style={DETAIL_ROW}>
          <svg style={DETAIL_ICON} viewBox="0 0 24 24"><path fill={ICON_GREY} d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" /></svg>
          <span><b>Experience:</b> {expLabel(post.experience)}</span>
        </div>
      </div>
    </section>
  );
}