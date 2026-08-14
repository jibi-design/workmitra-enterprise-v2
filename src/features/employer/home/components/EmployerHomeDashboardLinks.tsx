/** Employer home — Employer Dashboard only (no cross-role Employee switch). */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DomainCard, HomeSectionPanel } from "../../../../shared/components/layout/designDna";
import { IconChart } from "./employerHomeIcons";

export function EmployerHomeDashboardLinks() {
  const nav = useNavigate();

  return (
    <HomeSectionPanel eyebrow="Command" title="Dashboards">
      <div className="wm-homeStack" data-testid="employer-home-dashboard-links">
        <DomainCard
          domain="dashboard"
          audience="employer"
          stack
          className="wm-erExecCard"
          title="Employer Dashboard"
          subtitle="Hiring, operations, and utilities"
          ariaLabel="Open Employer Dashboard"
          onClick={() => nav(ROUTE_PATHS.employerDashboard)}
          icon={<IconChart />}
          iconStyle={{
            background: "color-mix(in srgb, var(--wm-dashboard-accent, #0f766e) 12%, transparent)",
            color: "var(--wm-dashboard-accent, #0f766e)",
          }}
        >
          <span className="wm-erDomainBadge" aria-hidden="true">
            <span className="wm-erDomainBadge__dot" />
            Command center
          </span>
        </DomainCard>
      </div>
    </HomeSectionPanel>
  );
}
