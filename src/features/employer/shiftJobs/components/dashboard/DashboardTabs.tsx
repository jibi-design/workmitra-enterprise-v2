// App name: Job Mitra
// File name: DashboardTabs.tsx
// Luxury L2 — one-line scroll tabs (no auto-fill grid wrap)

import { PulseNode } from "../../../../pulse/PulseNode";
import type { DashboardTab } from "../../helpers/shiftDashboardHelpers";

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
      <div
        className="wm-ent-tab-row"
        role="tablist"
        aria-label="Application status"
        data-testid="shift-dashboard-tabs-grid"
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

          if (tab === "applied") {
            return (
              <PulseNode
                key={tab}
                className="wm-ent-tab-cell"
                id="shift-dashboard-applications"
                variant="button"
                style={{ "--wm-pulse-node-radius": "14px" }}
              >
                {button}
              </PulseNode>
            );
          }

          if (tab === "selected") {
            return (
              <PulseNode
                key={tab}
                className="wm-ent-tab-cell"
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
                className="wm-ent-tab-cell"
                id="employer-shift-replacement-needed"
                variant="button"
                style={{ "--wm-pulse-node-radius": "14px" }}
              >
                {button}
              </PulseNode>
            );
          }

          return (
            <div key={tab} className="wm-ent-tab-cell">
              {button}
            </div>
          );
        })}
      </div>
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
      role="tab"
      onClick={onClick}
      className={`wm-ent-tab-btn${isActive ? " is-active" : ""}`}
      aria-selected={isActive}
    >
      <span className="wm-ent-tab-stack">
        <span className="wm-ent-tab-label">{label}</span>
        <span
          className="wm-ent-tab-count"
          data-empty={count > 0 ? "false" : "true"}
          aria-hidden={count <= 0}
        >
          {count > 0 ? count : 0}
        </span>
      </span>
    </button>
  );
}
