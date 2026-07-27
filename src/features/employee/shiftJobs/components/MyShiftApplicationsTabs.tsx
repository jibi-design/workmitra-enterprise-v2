// App name: Job Mitra | MyShiftApplicationsTabs.tsx — seg-tab (Wave A)

import type { ApplicationTab } from "../../shiftJobs/types/shiftApplicationTypes";
import type { TabCounts } from "../../shiftJobs/helpers/shiftApplicationHelpers";

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
  const isPlanner = domain === "planner";

  return (
    <div
      className={
        isPlanner
          ? "wm-chipRow wm-animateIn"
          : "wm-shift-surface-glass wm-shift-seg-tab-row wm-animateIn"
      }
      role="tablist"
      aria-label={isPlanner ? "Project application filters" : "Shift application filters"}
      data-testid="shift-applications-tabs"
      style={{
        animationDelay: "90ms",
        ...(isPlanner ? undefined : { padding: "8px 10px" }),
      }}
    >
      {TABS.map((item) => {
        const isActive = tab === item.key;
        const count = counts[item.key];

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
            onClick={() => onChange(item.key)}
          >
            {item.label}
            {count > 0 ? (
              <span
                className="wm-shiftApplicationsTabCount"
                style={{
                  marginLeft: 4,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 18,
                  height: 16,
                  padding: "0 5px",
                  borderRadius: "var(--wm-radius-pill)",
                  fontSize: 10,
                  fontWeight: 900,
                  background: isActive ? "rgba(255,255,255,0.92)" : "rgba(22,163,74,0.12)",
                  color: isActive
                    ? "var(--wm-shift-accent, #16a34a)"
                    : "var(--wm-shift-accent, #16a34a)",
                }}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
