// App name: Job Mitra | MyShiftWorkspacesTabs.tsx — shared seg-tab primitives

import type { MyShiftWorkspaceCounts, MyShiftWorkspaceTab } from "../types/myShiftWorkspaces.types";

const TABS: { key: MyShiftWorkspaceTab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
];

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
  const isPlanner = domain === "planner";

  return (
    <div
      className={isPlanner ? "wm-chipRow" : "wm-shift-seg-tab-row"}
      role="tablist"
      aria-label={isPlanner ? "Project workspace filters" : "Work group filters"}
      data-testid="shift-workspaces-tabs"
    >
      {TABS.map((item) => {
        const isActive = tab === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={
              isPlanner
                ? `wm-chipBtn ${isActive ? "isActive" : ""}`
                : `wm-shift-seg-tab ${isActive ? "isActive" : ""}`
            }
            onClick={() => onTabChange(item.key)}
          >
            {item.label} ({counts[item.key]})
          </button>
        );
      })}
    </div>
  );
}
