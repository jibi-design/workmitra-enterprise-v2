// App name: Job Mitra
// File name: MyShiftApplicationsKpiTiles.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\MyShiftApplicationsKpiTiles.tsx

import type { KpiCounts } from "../../shiftJobs/helpers/shiftApplicationHelpers";

const MUTED = "#94a3b8";

type MyShiftApplicationsKpiTilesProps = {
  kpi: KpiCounts;
  domain?: "shift" | "planner";
};

const PLANNER_TEAL = "#0891b2";
const SHIFT_GREEN = "#16a34a";

export function MyShiftApplicationsKpiTiles({
  kpi,
  domain = "shift",
}: MyShiftApplicationsKpiTilesProps) {
  const accent = domain === "planner" ? PLANNER_TEAL : SHIFT_GREEN;
  const kpiDefs = [
    { label: "Applied", field: "applied" as const },
    { label: "Shortlisted", field: "shortlisted" as const },
    { label: "Confirmed", field: "confirmed" as const },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10,
        marginBottom: 14,
      }}
    >
      {kpiDefs.map((definition) => {
        const count = kpi[definition.field];
        const isZero = count === 0;
        const color = isZero ? MUTED : accent;

        return (
          <div
            key={definition.label}
            style={{
              minHeight: 78,
              borderRadius: 18,
              padding: "12px 10px",
              textAlign: "center",
              border: isZero ? "1px solid rgba(226,232,240,0.95)" : `1px solid ${accent}26`,
              background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
              boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, color, letterSpacing: 0.2 }}>
              {definition.label}
            </div>

            <div style={{ fontSize: 22, lineHeight: 1, fontWeight: 950, color, marginTop: 7 }}>
              {count}
            </div>
          </div>
        );
      })}
    </div>
  );
}
