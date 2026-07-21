/** Job Mitra | PlannerApplicationsKpiTiles.tsx */

import type { PlannerKpiCounts } from "../helpers/plannerApplicationList.helpers";

const MUTED = "#94a3b8";
const ACCENT = "#0891b2";

type Props = {
  kpi: PlannerKpiCounts;
};

export function PlannerApplicationsKpiTiles({ kpi }: Props) {
  const tiles = [
    { label: "Applied", value: kpi.applied },
    { label: "Shortlisted", value: kpi.shortlisted },
    { label: "Confirmed", value: kpi.confirmed },
  ] as const;

  return (
    <div
      data-testid="planner-applications-kpi"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10,
        marginBottom: 14,
      }}
    >
      {tiles.map((tile) => {
        const isZero = tile.value === 0;
        const color = isZero ? MUTED : ACCENT;
        return (
          <div
            key={tile.label}
            style={{
              minHeight: 78,
              borderRadius: 18,
              padding: "12px 10px",
              textAlign: "center",
              border: isZero ? "1px solid rgba(226,232,240,0.95)" : `1px solid ${ACCENT}26`,
              background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
              boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, color, letterSpacing: 0.2 }}>
              {tile.label}
            </div>
            <div style={{ fontSize: 22, lineHeight: 1, fontWeight: 950, color, marginTop: 7 }}>
              {tile.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
