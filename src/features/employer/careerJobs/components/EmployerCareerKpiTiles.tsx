// App name: Job Mitra
// File name: EmployerCareerKpiTiles.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\EmployerCareerKpiTiles.tsx

type EmployerCareerKpiData = {
  total: number;
  active: number;
  paused: number;
  totalApps: number;
  inInterview: number;
  offered: number;
  hired: number;
};

type EmployerCareerKpiTilesProps = {
  kpi: EmployerCareerKpiData;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
const INACTIVE_TEXT = "rgba(15,23,42,0.58)";

export function EmployerCareerKpiTiles({ kpi }: EmployerCareerKpiTilesProps) {
  return (
    <section
      style={{
        padding: 15,
        borderRadius: "var(--wm-radius-employer-card)",
        border: "1px solid rgba(29,78,216,0.14)",
        background:
          "radial-gradient(circle at 92% 4%, rgba(29,78,216,0.08), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.99))",
        boxShadow: "0 16px 34px rgba(15,23,42,0.06)",
        display: "grid",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 950, color: CAREER_TEXT }}>
          Hiring control summary
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 11.5,
            fontWeight: 750,
            color: CAREER_MUTED,
            lineHeight: 1.45,
          }}
        >
          Quick employer view of pipeline health, candidate movement, and hiring progress.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 9 }}>
        <ExecutivePanel
          title="Pipeline health"
          value={kpi.totalApps}
          label="total applications"
          lineOne={`${kpi.active} active posts`}
          lineTwo={`${kpi.paused} paused posts`}
          strong
        />

        <ExecutivePanel
          title="Hiring progress"
          value={kpi.hired}
          label="hired"
          lineOne={`${kpi.inInterview} interviews`}
          lineTwo={`${kpi.offered} offers`}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <SmallMetric label="Posts" value={kpi.total} helper="Total" />
        <SmallMetric label="Active" value={kpi.active} helper="Live" />
        <SmallMetric label="Paused" value={kpi.paused} helper="Hold" />
      </div>
    </section>
  );
}

function ExecutivePanel({
  title,
  value,
  label,
  lineOne,
  lineTwo,
  strong,
}: {
  title: string;
  value: number;
  label: string;
  lineOne: string;
  lineTwo: string;
  strong?: boolean;
}) {
  const isActive = value > 0;

  return (
    <div
      style={{
        minWidth: 0,
        padding: "13px 11px",
        borderRadius: "var(--wm-radius-employee-card)",
        border: strong ? "1px solid rgba(29,78,216,0.18)" : "1px solid rgba(29,78,216,0.12)",
        background: strong
          ? "linear-gradient(145deg, rgba(239,246,255,0.96), rgba(255,255,255,0.94))"
          : "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))",
        boxShadow: strong ? "0 12px 26px rgba(29,78,216,0.06)" : "0 8px 18px rgba(15,23,42,0.035)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 950, color: CAREER_BLUE_DEEP }}>{title}</div>

      <div
        style={{
          marginTop: 8,
          fontSize: 25,
          fontWeight: 950,
          lineHeight: 1,
          color: isActive ? CAREER_BLUE : INACTIVE_TEXT,
        }}
      >
        {value}
      </div>

      <div style={{ marginTop: 3, fontSize: 10.5, fontWeight: 850, color: CAREER_MUTED }}>
        {label}
      </div>

      <div style={{ marginTop: 10, display: "grid", gap: 5 }}>
        <div style={{ fontSize: 10.5, fontWeight: 900, color: CAREER_BLUE_DEEP }}>{lineOne}</div>
        <div style={{ fontSize: 10.5, fontWeight: 850, color: CAREER_MUTED }}>{lineTwo}</div>
      </div>
    </div>
  );
}

function SmallMetric({ label, value, helper }: { label: string; value: number; helper: string }) {
  const isActive = value > 0;

  return (
    <div
      style={{
        minWidth: 0,
        padding: "9px 8px",
        borderRadius: "var(--wm-radius-chip)",
        border: "1px solid rgba(29,78,216,0.09)",
        background: "rgba(255,255,255,0.72)",
      }}
    >
      <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED, lineHeight: 1.2 }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 5,
          fontSize: 17,
          fontWeight: 950,
          color: isActive ? CAREER_BLUE : INACTIVE_TEXT,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 3,
          fontSize: 10.5,
          fontWeight: 800,
          color: isActive ? CAREER_BLUE_DEEP : CAREER_MUTED,
        }}
      >
        {helper}
      </div>
    </div>
  );
}
