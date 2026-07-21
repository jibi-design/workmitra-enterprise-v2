/** Job Mitra | PlannerApplicationsTabs.tsx */

import type { CSSProperties } from "react";
import type {
  PlannerApplicationTab,
  PlannerTabCounts,
} from "../helpers/plannerApplicationList.helpers";

const ACCENT = "#0891b2";
const MUTED = "#94a3b8";

const TABS: { key: PlannerApplicationTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "confirmed", label: "Confirmed" },
  { key: "closed", label: "Closed" },
];

type Props = {
  tab: PlannerApplicationTab;
  counts: PlannerTabCounts;
  onChange: (tab: PlannerApplicationTab) => void;
};

export function PlannerApplicationsTabs({ tab, counts, onChange }: Props) {
  return (
    <div
      data-testid="planner-applications-tabs"
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
        const style = getTabStyle(isActive, count > 0);
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            data-testid={`planner-applications-tab-${item.key}`}
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
              minHeight: 44,
            }}
          >
            {item.label}
            {count > 0 ? (
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
                  background: isActive ? "#fff" : `${ACCENT}18`,
                  color: isActive ? ACCENT : style.color,
                  fontSize: 10,
                  fontWeight: 950,
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

function getTabStyle(
  isActive: boolean,
  hasItems: boolean,
): CSSProperties & { borderColor: string } {
  if (isActive) {
    return { background: ACCENT, color: "#fff", borderColor: ACCENT };
  }
  if (hasItems) {
    return { background: `${ACCENT}0F`, color: ACCENT, borderColor: `${ACCENT}36` };
  }
  return {
    background: "transparent",
    color: MUTED,
    borderColor: "rgba(226,232,240,0.95)",
  };
}
