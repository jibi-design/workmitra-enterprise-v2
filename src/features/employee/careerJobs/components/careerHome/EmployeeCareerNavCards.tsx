// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerNavCards.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\careerHome\EmployeeCareerNavCards.tsx

import type { ReactNode } from "react";

type Props = {
  activeJobCount: number;
  activeApplicationCount: number;
  onSearchJobs: () => void;
  onMyApplications: () => void;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
const INACTIVE_BADGE_BG = "rgba(15,23,42,0.055)";
const INACTIVE_BADGE_TEXT = "rgba(15,23,42,0.58)";

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6Z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9.5 4a5.5 5.5 0 0 1 4.36 8.86l.31.31h.83l4.25 4.24-1.84 1.84L13.17 15v-.83l-.31-.31A5.5 5.5 0 1 1 9.5 4Zm0 2A3.5 3.5 0 1 0 13 9.5 3.5 3.5 0 0 0 9.5 6Z"
      />
    </svg>
  );
}

function IconApplications() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-.8 2.4L17.6 8h-4.4V4.4ZM6 20V4h5v6h7v10H6Zm2-7h8v2H8v-2Zm0 4h6v2H8v-2Z"
      />
    </svg>
  );
}

function NavCard({
  icon,
  title,
  subtitle,
  label,
  metric,
  primary,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  label: string;
  metric: number;
  primary?: boolean;
  onClick: () => void;
}) {
  const hasMetric = metric > 0;

  return (
    <button
      type="button"
      className="wm-press-card"
      onClick={onClick}
      aria-label={title}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "var(--wm-card-padding)",
        borderRadius: "var(--wm-radius-employee-card)",
        border: primary ? "1px solid rgba(29,78,216,0.24)" : "1px solid rgba(29,78,216,0.11)",
        background: primary
          ? "linear-gradient(135deg, rgba(255,255,255,1), rgba(239,246,255,0.94))"
          : "linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
        boxShadow: primary
          ? "0 16px 34px rgba(29,78,216,0.085)"
          : "0 12px 26px rgba(15,23,42,0.05)",
        cursor: "pointer",
        display: "grid",
        gridTemplateColumns: "48px 1fr",
        gap: "var(--wm-stack-gap)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--wm-radius-chip)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: primary ? "rgba(29,78,216,0.11)" : "rgba(29,78,216,0.055)",
          color: primary ? CAREER_BLUE : CAREER_BLUE_DEEP,
          border: primary ? "1px solid rgba(29,78,216,0.14)" : "1px solid rgba(29,78,216,0.08)",
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div className="wm-typeCardTitle">{title}</div>
            <div className="wm-typeHelper" style={{ marginTop: 5 }}>
              {subtitle}
            </div>
          </div>

          <div
            style={{
              flexShrink: 0,
              minWidth: 34,
              height: 28,
              padding: "0 10px",
              borderRadius: 999,
              background: hasMetric ? CAREER_BLUE : INACTIVE_BADGE_BG,
              color: hasMetric ? "#fff" : INACTIVE_BADGE_TEXT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 950,
            }}
          >
            {metric}
          </div>
        </div>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 950, color: CAREER_BLUE_DEEP }}>{label}</span>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              background: "rgba(29,78,216,0.055)",
              color: CAREER_BLUE_DEEP,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronIcon />
          </span>
        </div>
      </div>
    </button>
  );
}

export function EmployeeCareerNavCards({
  activeJobCount,
  activeApplicationCount,
  onSearchJobs,
  onMyApplications,
}: Props) {
  return (
    <section style={{ display: "grid", gap: 10 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 950, color: CAREER_TEXT }}>Career actions</div>
        <div style={{ marginTop: 3, fontSize: 11.5, fontWeight: 750, color: CAREER_MUTED }}>
          Continue from the right long-term work step.
        </div>
      </div>

      <NavCard
        icon={<IconSearch />}
        title="Find Career Jobs"
        subtitle="Browse active long-term roles and choose where to apply."
        label="Start discovery"
        metric={activeJobCount}
        primary
        onClick={onSearchJobs}
      />

      <NavCard
        icon={<IconApplications />}
        title="My Applications"
        subtitle="Track applications, interviews, offers, and next steps."
        label="Review progress"
        metric={activeApplicationCount}
        onClick={onMyApplications}
      />
    </section>
  );
}
