// App: Job Mitra / WorkMitra_Enterprise_v2
// File: HRTabBar.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\hrPageSections\HRTabBar.tsx

import type { TabKey } from "../../helpers/hrPageHelpers";
import { TABS } from "../../helpers/hrPageHelpers";

type HRTabBarProps = {
  activeTab: TabKey;
  tabCounts: Record<string, number>;
  showFilters: boolean;
  onTabChange: (tab: TabKey) => void;
};

export function HRTabBar({ activeTab, tabCounts, showFilters, onTabChange }: HRTabBarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        overflowX: "auto",
        borderBottom: "2px solid var(--wm-er-border, #e5e7eb)",
        marginBottom: showFilters ? 8 : 12,
        WebkitOverflowScrolling: "touch",
      }}
      className="wm-hideScrollbar"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = tabCounts[tab.key] ?? 0;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            style={{
              flex: "0 0 auto",
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: isActive ? 900 : 600,
              color: isActive ? "var(--wm-er-accent-hr, #7c3aed)" : "var(--wm-er-muted, #b0b5bf)",
              background: isActive ? "rgba(124, 58, 237, 0.06)" : "transparent",
              border: "none",
              borderBottom: isActive
                ? "3px solid var(--wm-er-accent-hr, #7c3aed)"
                : "3px solid transparent",
              borderRadius: isActive ? "6px 6px 0 0" : "0",
              marginBottom: -2,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}

            {count > 0 && (
              <span
                style={{
                  marginLeft: 5,
                  fontSize: 9,
                  fontWeight: 900,
                  padding: "2px 6px",
                  borderRadius: 999,
                  background: isActive ? "rgba(124, 58, 237, 0.1)" : "rgba(107, 114, 128, 0.08)",
                  color: isActive
                    ? "var(--wm-er-accent-hr, #7c3aed)"
                    : "var(--wm-er-muted, #94a3b8)",
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
