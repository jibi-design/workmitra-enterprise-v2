// App name: Job Mitra
// File name: EmployerCareerHomeHeader.tsx

import { EmployerCareerIconPlus } from "./EmployerCareerHomeIcons";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";

type EmployerCareerKpiData = {
  total: number;
  active: number;
  paused: number;
  totalApps: number;
  inInterview: number;
  offered: number;
  hired: number;
};

type EmployerCareerHomeHeaderProps = {
  onCreate: () => void;
  kpi: EmployerCareerKpiData;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #475569)";

function EmployerCommandIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function CommandMetric({
  label,
  value,
  helper,
  primary,
}: {
  label: string;
  value: number;
  helper: string;
  primary?: boolean;
}) {
  const isActive = value > 0;

  return (
    <div
      style={{
        minWidth: 0,
        padding: "12px 10px",
        borderRadius: 16,
        border: primary ? "1px solid rgba(37, 99, 235, 0.2)" : "1px solid rgba(255, 255, 255, 0.9)",
        background: primary
          ? "linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(219, 234, 254, 0.8))"
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.6))",
        boxShadow: primary
          ? "0 8px 16px rgba(37, 99, 235, 0.08), inset 0 2px 4px rgba(255,255,255,1)"
          : "0 4px 12px rgba(0, 0, 0, 0.02), inset 0 1px 2px rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          lineHeight: 1,
          color: isActive ? CAREER_BLUE : "rgba(15,23,42,0.4)",
          textShadow: primary ? "0 1px 2px rgba(37,99,235,0.1)" : "none",
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 6, fontSize: 11.5, fontWeight: 700, color: CAREER_TEXT }}>
        {label}
      </div>
      <div style={{ marginTop: 2, fontSize: 10.5, fontWeight: 500, color: CAREER_MUTED }}>
        {helper}
      </div>
    </div>
  );
}

export function EmployerCareerHomeHeader({ onCreate, kpi }: EmployerCareerHomeHeaderProps) {
  const hasPipeline = kpi.total > 0 || kpi.totalApps > 0 || kpi.hired > 0;
  const pipelineLabel = hasPipeline ? "Pipeline active" : "Ready to hire";

  return (
    <DomainHero
      variant="career"
      audience="employer"
      eyebrow={`Employer Career · ${pipelineLabel}`}
      icon={<EmployerCommandIcon />}
      title="Build long-term hiring pipelines"
      subtitle="Create stable roles, review candidate progress, and manage hired workspaces."
    >
      <button
        type="button"
        onClick={onCreate}
        className="wm-primarybtn"
        style={{
          width: "100%",
          minHeight: 46,
          borderRadius: 14,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <EmployerCareerIconPlus />
        Create Career Job
      </button>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <CommandMetric label="Active posts" value={kpi.active} helper="Visible now" primary />
        <CommandMetric label="Applications" value={kpi.totalApps} helper="Candidate interest" />
        <CommandMetric label="Interviews" value={kpi.inInterview} helper="In review flow" />
        <CommandMetric label="Hired" value={kpi.hired} helper="Hired records" />
      </div>
    </DomainHero>
  );
}
