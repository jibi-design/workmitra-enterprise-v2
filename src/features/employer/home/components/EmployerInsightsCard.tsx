/** Job Mitra | EmployerInsightsCard.tsx | src/features/employer/home/components/EmployerInsightsCard.tsx */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { IconChart } from "./employerHomeIcons";

export function InsightsCard() {
  const nav = useNavigate();
  return (
    <section
      role="button"
      tabIndex={0}
      onClick={() => nav(ROUTE_PATHS.employerAnalytics)}
      onKeyDown={(e) => {
        if (e.key === "Enter") nav(ROUTE_PATHS.employerAnalytics);
      }}
      style={{
        cursor: "pointer",
        padding: "var(--wm-card-padding)",
        borderRadius: "var(--wm-radius-employer-card)",
        /* Mandate: Rich Dark Tone with Data-Sparkline hint */
        background: "#0B1120",
        backgroundImage: "linear-gradient(to right, #0B1120 40%, rgba(37, 99, 235, 0.08) 100%)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 12px 24px rgba(0, 0, 0, 0.15)",
        transition: "transform var(--wm-motion-base) var(--wm-motion-spring)",
      }}
      onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(37, 99, 235, 0.15)",
            color: "#3B82F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconChart />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Analytics Dashboard</h3>
          <p style={{ margin: "2px 0 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            Full business insights
          </p>
        </div>
      </div>
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>→</div>
    </section>
  );
}
