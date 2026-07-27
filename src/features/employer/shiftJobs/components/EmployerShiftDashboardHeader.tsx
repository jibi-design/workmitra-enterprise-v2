// App name: Job Mitra | EmployerShiftDashboardHeader.tsx — DomainHero (Wave 2)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
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

export function EmployerShiftDashboardHeader({
  post,
  hasApplications,
  onEdit,
  onDelete,
  onClosePost,
  onNavigate,
}: EmployerShiftDashboardHeaderProps) {
  const showEdit = !hasApplications && post.status !== "completed" && post.status !== "cancelled";
  const showClose = hasApplications && post.status !== "completed" && post.status !== "cancelled";

  return (
    <DomainHero
      variant="shift"
      audience="employer"
      icon={<DashboardHeroIcon />}
      title={post.jobName}
      subtitle={`${post.companyName} · ${post.locationName}`}
      description="Manage applicants, vacancies, and post controls for this shift."
      trailing={
        <div
          style={{
            display: "flex",
            gap: 7,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {showEdit ? (
            <button
              className="wm-outlineBtn"
              type="button"
              style={{ fontSize: 11 }}
              onClick={onEdit}
            >
              Edit
            </button>
          ) : null}

          {!hasApplications ? (
            <button
              className="wm-outlineBtn"
              type="button"
              style={{ fontSize: 11, color: "var(--wm-error, #dc2626)" }}
              onClick={onDelete}
            >
              Delete
            </button>
          ) : null}

          {showClose ? (
            <button
              className="wm-outlineBtn"
              type="button"
              style={{ fontSize: 11, color: "#b45309" }}
              onClick={onClosePost}
            >
              Close Post
            </button>
          ) : null}

          <button
            className="wm-outlineBtn"
            type="button"
            style={{ fontSize: 11 }}
            onClick={() => onNavigate(ROUTE_PATHS.employerShiftPosts)}
          >
            All Posts
          </button>
        </div>
      }
    >
      {showClose ? (
        <div
          className="wm-shift-surface-glass wm-shift-surface-glass--inset"
          role="status"
          style={{
            border: "1px solid rgba(217,119,6,0.18)",
            background: "rgba(217,119,6,0.07)",
            color: "#92400e",
            fontSize: 11,
            fontWeight: 800,
            lineHeight: 1.45,
          }}
        >
          Applications exist. Key post details are locked to protect applicants.
        </div>
      ) : null}

      <div
        className="wm-shift-kpi-grid"
        style={{ marginTop: showClose ? 10 : 0, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
      >
        <HeaderMetric label="Vacancies" value={String(post.vacancies)} />
        <HeaderMetric label="Pay" value={formatShiftPayDisplay(post.payPerDay, post.payBasis)} />
        <HeaderMetric label="Status" value={formatStatus(post.status ?? "active")} accent />
      </div>
    </DomainHero>
  );
}

function HeaderMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="wm-shift-surface-glass wm-shift-surface-glass--inset" style={{ minWidth: 0 }}>
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
          color: accent ? "var(--wm-er-accent-shift, #16a34a)" : "var(--wm-er-text)",
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

function DashboardHeroIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
    </svg>
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
