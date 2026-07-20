// App name: Job Mitra
// File name: MyShiftWorkspacesTabs.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\MyShiftWorkspacesTabs.tsx

import type { MyShiftWorkspaceCounts, MyShiftWorkspaceTab } from "../types/myShiftWorkspaces.types";

const TABS: { key: MyShiftWorkspaceTab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
];

const TAB_COLORS_SHIFT = {
  activeBg: "rgba(22,163,74,0.12)",
  activeBorder: "rgba(22,163,74,0.28)",
  activeColor: "var(--wm-er-accent-shift, #16a34a)",
};

const TAB_COLORS_PLANNER = {
  activeBg: "rgba(8,145,178,0.12)",
  activeBorder: "rgba(8,145,178,0.28)",
  activeColor: "var(--wm-planner-accent, #0891b2)",
};

type MyShiftWorkspacesTabsProps = {
  tab: MyShiftWorkspaceTab;
  counts: MyShiftWorkspaceCounts;
  onTabChange: (tab: MyShiftWorkspaceTab) => void;
  domain?: "shift" | "planner";
};

export function MyShiftWorkspacesTabs({
  tab,
  counts,
  onTabChange,
  domain = "shift",
}: MyShiftWorkspacesTabsProps) {
  const tabColors = domain === "planner" ? TAB_COLORS_PLANNER : TAB_COLORS_SHIFT;

  return (
    <div className="wm-chipRow" style={{ marginTop: 12 }}>
      {TABS.map((item) => {
        const isActive = tab === item.key;
        return (
          <button
            key={item.key}
            className={`wm-chipBtn ${isActive ? "isActive" : ""}`}
            type="button"
            onClick={() => onTabChange(item.key)}
            style={
              isActive
                ? {
                    background: tabColors.activeBg,
                    borderColor: tabColors.activeBorder,
                    color: tabColors.activeColor,
                  }
                : undefined
            }
          >
            {item.label} ({counts[item.key]})
          </button>
        );
      })}
    </div>
  );
}
