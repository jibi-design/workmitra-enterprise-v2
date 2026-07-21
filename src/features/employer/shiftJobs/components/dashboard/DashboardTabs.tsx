// App name: Job Mitra
// File name: DashboardTabs.tsx
// Luxury L2 — CLS-safe spring tab transitions via enterprise CSS classes

import { PulseNode } from "../../../../pulse/PulseNode";
import type { DashboardTab } from "../../helpers/shiftDashboardHelpers";
import { EnterpriseResponsiveGrid } from "../../../../../shared/components/enterprise";

type DashboardTabsProps = {
  activeTab: DashboardTab;
  counts: Record<DashboardTab, number>;
  onChange: (tab: DashboardTab) => void;
};

const ALL_TABS: DashboardTab[] = ["applied", "shortlisted", "backup", "selected", "rejected"];

const TAB_LABELS: Record<DashboardTab, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  backup: "Backup",
  selected: "Selected",
  rejected: "Rejected",
};

export function DashboardTabs({ activeTab, counts, onChange }: DashboardTabsProps) {
  return (
    <div className="wm-ent-tab-shell" data-testid="shift-dashboard-tabs">
      <EnterpriseResponsiveGrid
        minItemWidth={88}
        gap={6}
        collapseMobile
        testId="shift-dashboard-tabs-grid"
      >
        {ALL_TABS.map((tab) => {
          const button = (
            <DashboardTabButton
              label={TAB_LABELS[tab]}
              count={counts[tab]}
              isActive={activeTab === tab}
              onClick={() => onChange(tab)}
            />
          );

          if (tab === "selected") {
            return (
              <PulseNode
                key={tab}
                id="employer-shift-confirmed-roster"
                variant="button"
                style={{ "--wm-pulse-node-radius": "14px" }}
              >
                {button}
              </PulseNode>
            );
          }

          if (tab === "backup") {
            return (
              <PulseNode
                key={tab}
                id="employer-shift-replacement-needed"
                variant="button"
                style={{ "--wm-pulse-node-radius": "14px" }}
              >
                {button}
              </PulseNode>
            );
          }

          return <div key={tab}>{button}</div>;
        })}
      </EnterpriseResponsiveGrid>
    </div>
  );
}

function DashboardTabButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`wm-ent-tab-btn${isActive ? " is-active" : ""}`}
      aria-pressed={isActive}
    >
      <div>{label}</div>

      {count > 0 ? <span className="wm-ent-tab-count">{count}</span> : null}
    </button>
  );
}
