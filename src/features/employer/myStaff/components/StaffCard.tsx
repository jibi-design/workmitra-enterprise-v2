// src/features/employer/myStaff/components/StaffCard.tsx

import { useNavigate } from "react-router-dom";
import type { StaffRecord } from "../storage/myStaff.storage";
import { StatusBadge } from "./StatusBadge";

function formatDuration(joinedAt: number, now: number): string {
  const durationMs = now - joinedAt;
  const days = Math.floor(durationMs / 86400000);
  const months = Math.floor(days / 30);
  const remainDays = days % 30;
  if (months > 0) {
    return `${months} month${months !== 1 ? "s" : ""} ${remainDays} day${remainDays !== 1 ? "s" : ""}`;
  }
  return `${days} day${days !== 1 ? "s" : ""}`;
}

type Props = {
  staff: StaffRecord;
  nowMs: number;
};

export function StaffCard({ staff, nowMs }: Props) {
  const nav = useNavigate();

  return (
    <div
      className="wm-er-card"
      role="button"
      tabIndex={0}
      onClick={() => nav(`/employer/my-staff/${staff.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") nav(`/employer/my-staff/${staff.id}`);
      }}
      style={{ padding: 14, cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 1000, fontSize: 13, color: "var(--wm-er-text)" }}>
              {staff.employeeName}
            </span>
            <StatusBadge status={staff.status} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)", marginTop: 4 }}>
            {staff.jobTitle}
            {staff.category ? ` — ${staff.category}` : ""}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            Joined: {formatDuration(staff.joinedAt, nowMs)} ago
            {staff.employeeUniqueId ? ` | ID: ${staff.employeeUniqueId}` : ""}
          </div>
          <div style={{ marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {staff.addMethod === "via_app" && (
              <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 999, background: "rgba(55, 48, 163, 0.08)", color: "var(--wm-er-accent-career)" }}>
                Via App
              </span>
            )}
            {staff.addMethod === "manually_added" && (
              <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 999, background: "rgba(217, 119, 6, 0.08)", color: "#d97706" }}>
                Manually Added
              </span>
            )}
            {staff.employeeConfirmed && (
              <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 999, background: "rgba(22, 163, 74, 0.08)", color: "#16a34a" }}>
                Confirmed
              </span>
            )}
          </div>
        </div>
        <span style={{ fontSize: 18, color: "var(--wm-er-muted)", flexShrink: 0 }}>›</span>
      </div>
    </div>
  );
}