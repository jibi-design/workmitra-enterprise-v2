// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerHomeHeader.tsx

import { PulseTargetButton } from "../../../../pulse/PulseTarget";
import { ActionPill, DomainHero } from "../../../../../shared/components/layout/designDna";

type Props = {
  activeJobCount: number;
  activeApplicationCount: number;
  nextStepCount: number;
  activeWorkspaceCount: number;
  onSearchJobs: () => void;
  onMyApplications: () => void;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";

function CareerBriefcaseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );
}

function MetricTile({
  label,
  value,
  helper,
  emphasis,
}: {
  label: string;
  value: number;
  helper: string;
  emphasis?: boolean;
}) {
  const active = value > 0;

  return (
    <div
      style={{
        minWidth: 0,
        padding: "var(--wm-card-padding)",
        borderRadius: "var(--wm-radius-chip)",
        border: emphasis
          ? "1px solid rgba(37, 99, 235, 0.15)"
          : "1px solid rgba(255, 255, 255, 0.7)",
        background: emphasis
          ? "linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(219, 234, 254, 0.6))"
          : "rgba(255, 255, 255, 0.96)",
        boxShadow: emphasis
          ? "0 8px 16px rgba(37, 99, 235, 0.08)"
          : "0 4px 12px rgba(0, 0, 0, 0.02)",
      }}
    >
      <div
        className="wm-typeHero"
        style={{ lineHeight: 1, color: active ? CAREER_BLUE : "rgba(15,23,42,0.4)" }}
      >
        {value}
      </div>
      <div
        className="wm-typeCardTitle"
        style={{
          marginTop: "var(--wm-space-8)",
          fontSize: "var(--wm-type-helper-size)",
          fontWeight: 700,
          color: CAREER_TEXT,
        }}
      >
        {label}
      </div>
      <div className="wm-typeHelper" style={{ marginTop: 3 }}>
        {helper}
      </div>
    </div>
  );
}

export function EmployeeCareerHomeHeader({
  activeJobCount,
  activeApplicationCount,
  nextStepCount,
  activeWorkspaceCount,
  onSearchJobs,
  onMyApplications,
}: Props) {
  return (
    <DomainHero
      variant="career"
      audience="employee"
      eyebrow="Career Jobs"
      icon={<CareerBriefcaseIcon />}
      title="Build your long-term work path"
      subtitle="Search stable roles, track applications, and open your hired workspace from one focused center."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--wm-stack-gap)" }}>
        <PulseTargetButton pulseId="career-search-cta" radius="16px">
          <ActionPill
            domain="career"
            onClick={onSearchJobs}
            style={{ width: "100%", minHeight: 48 }}
          >
            Find Career Jobs
          </ActionPill>
        </PulseTargetButton>

        <PulseTargetButton pulseId="career-dashboard-applications" radius="16px">
          <ActionPill
            bare
            domain="career"
            onClick={onMyApplications}
            className="wm-outlineBtn wm-press-btn"
            style={{ width: "100%", minHeight: 48 }}
          >
            My Applications
          </ActionPill>
        </PulseTargetButton>
      </div>

      <div
        style={{
          marginTop: "var(--wm-stack-gap)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--wm-stack-gap)",
        }}
      >
        <MetricTile label="Open roles" value={activeJobCount} helper="Available now" emphasis />
        <MetricTile label="Applications" value={activeApplicationCount} helper="In progress" />
        <MetricTile label="Next steps" value={nextStepCount} helper="Need action" />
        <MetricTile label="Workspace" value={activeWorkspaceCount} helper="Active records" />
      </div>
    </DomainHero>
  );
}
