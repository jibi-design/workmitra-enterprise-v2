/** Job Mitra | ShiftOpsManagerExecutiveHeader.tsx | Employer ShiftOps — light DomainHero + KPI stats */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio } from "lucide-react";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { DomainHero } from "../../../shared/components/layout/DomainHero";
import { listManagedSites } from "../services/groupDailyOtp.service";
import { listActiveGroupRoster } from "../services/rosterReassign.service";

type ShiftOpsManagerExecutiveHeaderProps = {
  pendingApprovalsCount: number;
};

export function ShiftOpsManagerExecutiveHeader({
  pendingApprovalsCount,
}: ShiftOpsManagerExecutiveHeaderProps) {
  const nav = useNavigate();
  const [groupsCount, setGroupsCount] = useState(0);
  const [onDutyCount, setOnDutyCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const sites = await listManagedSites();
        if (cancelled) return;
        setGroupsCount(sites.length);

        const rosters = await Promise.all(
          sites.map((site) => listActiveGroupRoster(site.id).catch(() => [])),
        );
        if (cancelled) return;
        setOnDutyCount(rosters.reduce((sum, rows) => sum + rows.length, 0));
      } catch {
        if (!cancelled) {
          setGroupsCount(0);
          setOnDutyCount(0);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div data-testid="shift-ops-manager-executive-header">
      <DomainHero
        variant="shift"
        audience="employer"
        icon={<Radio size={22} strokeWidth={2.25} />}
        title="Shift Operations Control Center"
        subtitle="Live workspace management, worker rosters & group access"
        trailing={
          <button
            type="button"
            className="wm-primarybtn wm-shiftHomeHeroButton"
            data-testid="shift-ops-manager-create-cta"
            onClick={() => nav(ROUTE_PATHS.employerShiftCreate)}
          >
            + Create New Shift / Group
          </button>
        }
      />

      <div
        className="wm-shiftHomeKpiWrap wm-shiftOpsManagerStats"
        data-testid="shift-ops-manager-stats"
        style={{ marginTop: "var(--wm-stack-gap)" }}
      >
        <div className="wm-shiftHomeKpiGrid wm-shiftOpsManagerStatsGrid">
          <MetricCard
            label="Active Groups / Sites"
            value={groupsCount}
            badge={groupsCount > 0 ? "Operational" : "None"}
            badgeTone={groupsCount > 0 ? "live" : "muted"}
            testId="shift-ops-stat-groups"
          />
          <MetricCard
            label="Live Workers On-Duty"
            value={onDutyCount}
            badge={onDutyCount > 0 ? "On duty" : "Idle"}
            badgeTone={onDutyCount > 0 ? "live" : "muted"}
            testId="shift-ops-stat-onduty"
          />
          <MetricCard
            label="Pending Approvals"
            value={pendingApprovalsCount}
            badge={pendingApprovalsCount > 0 ? "Action required" : "Clear"}
            badgeTone={pendingApprovalsCount > 0 ? "action" : "muted"}
            testId="shift-ops-stat-pending"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  badge,
  badgeTone,
  testId,
}: {
  label: string;
  value: number;
  badge: string;
  badgeTone: "live" | "action" | "muted";
  testId: string;
}) {
  return (
    <div
      className={["wm-shiftHomeKpiTile", value > 0 ? "isPositive" : ""].filter(Boolean).join(" ")}
      data-testid={testId}
    >
      <div className="wm-shiftHomeKpiLabel">{label}</div>
      <div className="wm-shiftHomeKpiValue">{value}</div>
      <span className={`wm-shiftOpsManagerStatBadge wm-shiftOpsManagerStatBadge--${badgeTone}`}>
        {badge}
      </span>
    </div>
  );
}
