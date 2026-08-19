// App name: Job Mitra
// File name: CareerApplicationKpiTiles.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\careerApplications\CareerApplicationKpiTiles.tsx

import type { KpiCounts } from "../../types/careerApplicationTypes";

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_TEXT = "#0f172a";
const CAREER_MUTED = "#64748b";

// PREMIUM UPGRADE: Added specific icons for each KPI
const KPI_DEFS: { label: string; field: keyof KpiCounts; helper: string; icon: React.ReactNode }[] =
  [
    {
      label: "Applied",
      field: "applied",
      helper: "Submitted",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      label: "Shortlisted",
      field: "shortlisted",
      helper: "In review",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      label: "Confirmed",
      field: "confirmed",
      helper: "Final stage",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
  ];

export function KpiTiles({ kpi }: { kpi: KpiCounts }) {
  return (
    <section
      className="wm-stable-row"
      style={{
        marginTop: "var(--wm-stack-gap)",
        gap: "var(--wm-space-10)",
      }}
    >
      {KPI_DEFS.map((definition) => {
        const count = kpi[definition.field];
        const isZero = count === 0;

        return (
          <div
            key={definition.label}
            style={{
              position: "relative",
              padding: "16px 14px",
              borderRadius: "var(--wm-radius-chip)",
              background: "#ffffff",
              border: "1px solid",
              borderColor: isZero ? "#e2e8f0" : "rgba(29,78,216,0.15)",
              boxShadow: isZero ? "none" : "0 4px 12px rgba(29,78,216,0.04)",
              overflow: "hidden",
            }}
          >
            {/* Top Accent Line for active tiles */}
            {!isZero && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: CAREER_BLUE,
                }}
              />
            )}

            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--wm-radius-8)",
                  background: isZero ? "#f1f5f9" : "rgba(29,78,216,0.08)",
                  color: isZero ? "#94a3b8" : CAREER_BLUE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {definition.icon}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: isZero ? CAREER_MUTED : CAREER_TEXT,
                  lineHeight: 1,
                }}
              >
                {count}
              </div>
            </div>

            <div
              style={{ marginTop: "14px", fontSize: "13px", fontWeight: 800, color: CAREER_TEXT }}
            >
              {definition.label}
            </div>

            <div
              style={{ marginTop: "2px", fontSize: "11px", fontWeight: 600, color: CAREER_MUTED }}
            >
              {definition.helper}
            </div>
          </div>
        );
      })}
    </section>
  );
}
