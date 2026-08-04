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
      title="Analytics Dashboard"
      subtitle="Full business insights"
      ariaLabel="Open Analytics Dashboard"
      onClick={() => nav(ROUTE_PATHS.employerAnalytics)}
      icon={<IconChart />}
      iconStyle={{
        background: "color-mix(in srgb, var(--wm-brand-600, #2563eb) 12%, transparent)",
        color: "var(--wm-brand-600, #2563eb)",
      }}
      trailing={
        <span className="wm-homeGlassCard__chevron" aria-hidden="true">
          →
        </span>
      }
    />
  );
}
