/** Job Mitra | EmployerInsightsCard.tsx | src/features/employer/home/components/EmployerInsightsCard.tsx */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { HomeGlassCardShell } from "../../../../shared/components/layout/HomeGlassCardShell";
import { IconChart } from "./employerHomeIcons";

export function InsightsCard() {
  const nav = useNavigate();

  return (
    <HomeGlassCardShell
      audience="employer"
      tone="dark"
      title="Analytics Dashboard"
      subtitle="Full business insights"
      ariaLabel="Open Analytics Dashboard"
      onClick={() => nav(ROUTE_PATHS.employerAnalytics)}
      icon={<IconChart />}
      iconStyle={{
        background: "rgba(37, 99, 235, 0.15)",
        color: "#3B82F6",
      }}
      trailing={
        <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.35)", fontSize: 18 }}>
          →
        </span>
      }
    />
  );
}
