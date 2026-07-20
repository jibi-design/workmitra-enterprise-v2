// App name: Job Mitra
// File name: MyShiftApplicationsTabs.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\MyShiftApplicationsTabs.tsx

import type { CSSProperties } from "react";
import type { ApplicationTab } from "../../shiftJobs/types/shiftApplicationTypes";
import type { TabCounts } from "../../shiftJobs/helpers/shiftApplicationHelpers";
const TAB_COLORS_SHIFT = {
  all: "#16a34a",
  active: "#16a34a",
  confirmed: "#16a34a",
  closed: "#16a34a",
};

const TAB_COLORS_PLANNER = {
  all: "#0891b2",
  active: "#0891b2",
  confirmed: "#0891b2",
  closed: "#0891b2",
};

const MUTED = "#94a3b8";
const TAB_CSS = `.wm-app-tabs::-webkit-scrollbar{display:none}`;

const TABS: { key: ApplicationTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "confirmed", label: "Confirmed" },
  { key: "closed", label: "Closed" },
];

type MyShiftApplicationsTabsProps = {
  tab: ApplicationTab;
  counts: TabCounts;
  domain?: "shift" | "planner";
  onChange: (tab: ApplicationTab) => void;
};

export function MyShiftApplicationsTabs({
  tab,
  counts,
  domain = "shift",
  onChange,
}: MyShiftApplicationsTabsProps) {
  const tabColors = domain === "planner" ? TAB_COLORS_PLANNER : TAB_COLORS_SHIFT;
  return (
    <>
      <style>{TAB_CSS}</style>

      <div
        className="wm-app-tabs"
        style={{
          display: "flex",
          gap: 7,
          overflowX: "auto",
          flexWrap: "nowrap",
          padding: 6,
          marginBottom: 14,
          scrollbarWidth: "none",
          borderRadius: 18,
          border: "1px solid rgba(226,232,240,0.95)",
          background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
          boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
        }}
      >
        {TABS.map((item) => {
          const isActive = tab === item.key;
          const count = counts[item.key];
          const hasItems = count > 0;
          const color = tabColors[item.key];
          const style = getTabStyle(isActive, hasItems, color);

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              style={{
                background: style.background,
                color: style.color,
                border: `1px solid ${style.borderColor}`,
                fontSize: 12,
                fontWeight: isActive ? 950 : 750,
                padding: "8px 12px",
                borderRadius: 14,
                cursor: "pointer",
                flexShrink: 0,
                whiteSpace: "nowrap",
                minHeight: 40,
              }}
            >
              {item.label}
              {count > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 20,
                    height: 18,
                    padding: "0 6px",
                    borderRadius: 999,
                    background: isActive ? "#fff" : `${color}18`,
                    color: isActive ? color : style.color,
                    fontSize: 10,
                    fontWeight: 950,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

function getTabStyle(
  isActive: boolean,
  hasItems: boolean,
  color: string,
): CSSProperties & {
  borderColor: string;
} {
  if (isActive) {
    return {
      background: color,
      color: "#fff",
      borderColor: color,
    };
  }

  if (hasItems) {
    return {
      background: `${color}0F`,
      color,
      borderColor: `${color}36`,
    };
  }

  return {
    background: "transparent",
    color: MUTED,
    borderColor: "rgba(226,232,240,0.95)",
  };
}
