// App name: Job Mitra
// File name: DashboardTabs.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\dashboard\DashboardTabs.tsx

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
    <div
      style={{
        marginTop: 12,
        padding: 6,
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gap: 6,
        borderRadius: 18,
        border: "1px solid rgba(226,232,240,0.95)",
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
      }}
    >
      {ALL_TABS.map((tab) => {
        const button = (
          <DashboardTabButton
            key={tab}
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
      style={{
        minHeight: 44,
        padding: "7px 6px",
        borderRadius: 14,
        border: isActive ? "1px solid rgba(22,163,74,0.22)" : "1px solid transparent",
        background: isActive ? "rgba(22,163,74,0.08)" : "transparent",
        cursor: "pointer",
        color: isActive ? "var(--wm-er-accent-shift)" : "var(--wm-er-muted)",
        fontSize: 11,
        fontWeight: isActive ? 950 : 750,
      }}
    >
      <div>{label}</div>

      {count > 0 && (
        <span
          style={{
            marginTop: 4,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 20,
            height: 18,
            padding: "0 6px",
            borderRadius: 999,
            background: isActive ? "var(--wm-er-accent-shift)" : "rgba(226,232,240,0.95)",
            color: isActive ? "#fff" : "var(--wm-er-muted)",
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
