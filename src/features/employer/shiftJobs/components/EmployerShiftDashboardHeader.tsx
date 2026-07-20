// App name: Job Mitra
// File name: EmployerShiftDashboardHeader.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftDashboardHeader.tsx

import type { CSSProperties } from "react";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";

type EmployerShiftDashboardHeaderProps = {
  post: ShiftPost;
  hasApplications: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClosePost: () => void;
  onNavigate: (path: string) => void;
};

const SHIFT_GREEN = "#16a34a";

const HERO_STYLE: CSSProperties = {
  marginTop: 2,
  padding: "16px 16px",
  borderRadius: 22,
  border: "1px solid rgba(22,163,74,0.16)",
  background:
    "linear-gradient(135deg, rgba(22,163,74,0.13), rgba(255,255,255,0.98) 48%, rgba(240,253,244,0.86))",
  boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
};

const HERO_TOP_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const TITLE_STYLE: CSSProperties = {
  fontSize: 18,
  fontWeight: 950,
  color: "var(--wm-er-text)",
  lineHeight: 1.25,
};

const SUB_STYLE: CSSProperties = {
  marginTop: 5,
  fontSize: 12,
  color: "var(--wm-er-muted)",
  lineHeight: 1.45,
};

const ACTION_ROW_STYLE: CSSProperties = {
  display: "flex",
  gap: 7,
  flexWrap: "wrap",
  justifyContent: "flex-end",
  flexShrink: 0,
};

const META_ROW_STYLE: CSSProperties = {
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
};

export function EmployerShiftDashboardHeader({
  post,
  hasApplications,
  onEdit,
  onDelete,
  onClosePost,
  onNavigate,
}: EmployerShiftDashboardHeaderProps) {
  return (
    <section style={HERO_STYLE}>
      <div style={HERO_TOP_STYLE}>
        <div style={{ minWidth: 0 }}>
          <div style={TITLE_STYLE}>{post.jobName}</div>

          <div style={SUB_STYLE}>
            {post.companyName} · {post.locationName}
          </div>
        </div>

        <div style={ACTION_ROW_STYLE}>
          {!hasApplications && post.status !== "completed" && post.status !== "cancelled" && (
            <button
              className="wm-outlineBtn"
              type="button"
              style={{ fontSize: 11 }}
              onClick={onEdit}
            >
              Edit
            </button>
          )}

          {!hasApplications && (
            <button
              className="wm-outlineBtn"
              type="button"
              style={{ fontSize: 11, color: "var(--wm-error, #dc2626)" }}
              onClick={onDelete}
            >
              Delete
            </button>
          )}

          {hasApplications && post.status !== "completed" && post.status !== "cancelled" && (
            <button
              className="wm-outlineBtn"
              type="button"
              style={{ fontSize: 11, color: "#b45309" }}
              onClick={onClosePost}
            >
              Close Post
            </button>
          )}

          <button
            className="wm-outlineBtn"
            type="button"
            style={{ fontSize: 11 }}
            onClick={() => onNavigate(ROUTE_PATHS.employerShiftPosts)}
          >
            All Posts
          </button>
        </div>
      </div>

      {hasApplications && post.status !== "completed" && post.status !== "cancelled" && (
        <div
          style={{
            marginTop: 10,
            padding: "9px 11px",
            borderRadius: 14,
            background: "rgba(217,119,6,0.07)",
            border: "1px solid rgba(217,119,6,0.18)",
            color: "#92400e",
            fontSize: 11,
            fontWeight: 800,
            lineHeight: 1.45,
          }}
        >
          Applications exist. Key post details are locked to protect applicants.
        </div>
      )}

      <div style={META_ROW_STYLE}>
        <HeaderMetric label="Vacancies" value={String(post.vacancies)} />
        <HeaderMetric label="Pay" value={formatShiftPayDisplay(post.payPerDay, post.payBasis)} />
        <HeaderMetric label="Status" value={formatStatus(post.status ?? "active")} />
      </div>
    </section>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "9px 10px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(226,232,240,0.9)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 3,
          fontSize: 12,
          fontWeight: 900,
          color: label === "Status" ? SHIFT_GREEN : "var(--wm-er-text)",
          lineHeight: 1.25,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatShiftPayDisplay(amount: number, payBasis: ShiftPost["payBasis"]): string {
  if (payBasis === "not_listed") return "Pay not listed";
  if (payBasis === "per_hour") return amount > 0 ? `${amount} / hour` : "Pay not listed";
  if (payBasis === "fixed_total") return amount > 0 ? `${amount} total` : "Pay not listed";

  return amount > 0 ? `${amount} / day` : "Not set";
}

function formatStatus(status: string): string {
  if (status === "cancelled") return "Closed";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
