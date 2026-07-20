// App name: Job Mitra | MyShiftApplicationsHeader.tsx — shift + planner domains

import type { CSSProperties } from "react";

const SHIFT_GREEN = "#16a34a";
const PLANNER_TEAL = "#0891b2";

type Domain = "shift" | "planner";

type MyShiftApplicationsHeaderProps = {
  domain?: Domain;
  onFindShifts: () => void;
};

export function MyShiftApplicationsHeader({
  domain = "shift",
  onFindShifts,
}: MyShiftApplicationsHeaderProps) {
  const isPlanner = domain === "planner";
  const accent = isPlanner ? PLANNER_TEAL : SHIFT_GREEN;
  const heroStyle: CSSProperties = {
    marginTop: 2,
    marginBottom: 14,
    padding: "16px 16px",
    borderRadius: 22,
    border: isPlanner ? "1px solid rgba(8,145,178,0.18)" : "1px solid rgba(22,163,74,0.16)",
    background: isPlanner
      ? "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(255,255,255,0.98) 48%, rgba(236,254,255,0.86))"
      : "linear-gradient(135deg, rgba(22,163,74,0.13), rgba(255,255,255,0.98) 48%, rgba(240,253,244,0.86))",
    boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
  };

  return (
    <section style={heroStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: isPlanner
                ? "linear-gradient(180deg, rgba(8,145,178,0.16), rgba(8,145,178,0.07))"
                : "linear-gradient(180deg, rgba(22,163,74,0.16), rgba(22,163,74,0.07))",
              color: accent,
              boxShadow: isPlanner
                ? "inset 0 0 0 1px rgba(8,145,178,0.14)"
                : "inset 0 0 0 1px rgba(22,163,74,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Z"
              />
            </svg>
          </div>

          <div style={{ minWidth: 0 }}>
            <div className="wm-pageTitle">
              {isPlanner ? "My Project Applications" : "My Applications"}
            </div>
            <div className="wm-pageSub">
              {isPlanner
                ? "Multi-day Gig project bundles only"
                : "Single-day shift applications only"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onFindShifts}
          style={{
            padding: "8px 13px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 900,
            cursor: "pointer",
            border: isPlanner ? "1px solid rgba(8,145,178,0.22)" : "1px solid rgba(22,163,74,0.22)",
            color: accent,
            background: isPlanner ? "rgba(8,145,178,0.08)" : "rgba(22,163,74,0.08)",
            whiteSpace: "nowrap",
          }}
        >
          {isPlanner ? "Browse Projects" : "Find Shifts"}
        </button>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 12,
          lineHeight: 1.55,
          color: "var(--wm-er-muted)",
          maxWidth: 390,
        }}
      >
        {isPlanner
          ? "Track plan bundle status and per-day breakdown — never mixed with green shift applications."
          : "Review pending, shortlisted, confirmed, and closed shift applications from one place."}
      </div>
    </section>
  );
}
