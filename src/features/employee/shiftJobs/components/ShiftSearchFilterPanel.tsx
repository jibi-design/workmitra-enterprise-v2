// App name: Job Mitra
// File name: ShiftSearchFilterPanel.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftSearchFilterPanel.tsx

import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from "react";
import type { DurOpt, ExpOpt, TimeOpt } from "../types/shiftSearch.types";

type Props = {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  timeOpt: TimeOpt;
  setTimeOpt: Dispatch<SetStateAction<TimeOpt>>;
  exp: ExpOpt;
  setExp: Dispatch<SetStateAction<ExpOpt>>;
  categories: string[];
  catFilter: string;
  setCatFilter: Dispatch<SetStateAction<string>>;
  dur: DurOpt;
  setDur: Dispatch<SetStateAction<DurOpt>>;
  hasFilters: boolean;
  onClearFilters: () => void;
};

const PANEL_STYLE: CSSProperties = {
  marginTop: 12,
  padding: "8px 4px" /* Removed heavy padding */,
  /* Single Plain Layer UI: Removed heavy borders, background gradients, and shadows */
  background: "transparent",
};

const INPUT_WRAP_STYLE: CSSProperties = {
  padding: 0,
  marginBottom: 10,
  background: "transparent",
};

const NOTE_STYLE: CSSProperties = {
  marginTop: 16,
  padding: "10px 12px",
  borderRadius: 16,
  background: "rgba(248,250,252,0.6)",
  border: "1px solid rgba(226,232,240,0.8)",
  fontSize: 11,
  color: "var(--wm-er-muted)",
  fontWeight: 600,
  lineHeight: 1.5,
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.5)",
};

export function ShiftSearchFilterPanel(props: Props) {
  const visibleCategories = getVisibleCategories(props.categories);
  const shouldShowCategoryFilter = visibleCategories.length > 1;

  return (
    <section className="wm-ee-vShift" style={PANEL_STYLE}>
      <div className="wm-ee-headTint" style={INPUT_WRAP_STYLE}>
        <input
          className="wm-input"
          value={props.searchQuery}
          onChange={(event) => props.setSearchQuery(event.target.value)}
          placeholder="Search job, company, area, or keyword..."
          aria-label="Search shifts"
          style={{
            minHeight: 44,
            borderRadius: 16,
            border: "1px solid rgba(203,213,225,0.95)",
            background: "rgba(255,255,255,0.94)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        />
      </div>

      <FilterGroup title="Date">
        <button
          className={`wm-chipBtn ${props.timeOpt === "any" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setTimeOpt("any")}
        >
          All dates
        </button>
        <button
          className={`wm-chipBtn ${props.timeOpt === "today" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setTimeOpt("today")}
        >
          Today
        </button>
        <button
          className={`wm-chipBtn ${props.timeOpt === "next3" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setTimeOpt("next3")}
        >
          Next 3 days
        </button>
        <button
          className={`wm-chipBtn ${props.timeOpt === "week" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setTimeOpt("week")}
        >
          This week
        </button>
        <button
          className={`wm-chipBtn ${props.timeOpt === "weekend" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setTimeOpt("weekend")}
        >
          Weekend
        </button>
      </FilterGroup>

      <FilterGroup title="Worker type">
        <button
          className={`wm-chipBtn ${props.exp === "any" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setExp("any")}
        >
          Any level
        </button>
        <button
          className={`wm-chipBtn ${props.exp === "fresher_ok" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setExp("fresher_ok")}
        >
          No experience needed
        </button>
        <button
          className={`wm-chipBtn ${props.exp === "helper" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setExp("helper")}
        >
          Helper work
        </button>
        <button
          className={`wm-chipBtn ${props.exp === "experienced" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setExp("experienced")}
        >
          Experienced
        </button>
      </FilterGroup>

      {shouldShowCategoryFilter && (
        <FilterGroup title="Category">
          <button
            className={`wm-chipBtn ${props.catFilter === "any" ? "isActive" : ""}`}
            type="button"
            onClick={() => props.setCatFilter("any")}
          >
            All categories
          </button>
          {visibleCategories.map((category) => (
            <button
              key={category}
              className={`wm-chipBtn ${props.catFilter === category ? "isActive" : ""}`}
              type="button"
              onClick={() => props.setCatFilter(category)}
            >
              {category}
            </button>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Duration">
        <button
          className={`wm-chipBtn ${props.dur === "any" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setDur("any")}
        >
          Any duration
        </button>
        <button
          className={`wm-chipBtn ${props.dur === "oneday" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setDur("oneday")}
        >
          1 day
        </button>
        <button
          className={`wm-chipBtn ${props.dur === "multiday" ? "isActive" : ""}`}
          type="button"
          onClick={() => props.setDur("multiday")}
        >
          Multi-day
        </button>
        {props.hasFilters && (
          <button
            className="wm-chipBtn"
            type="button"
            onClick={props.onClearFilters}
            style={{ marginLeft: "auto", color: "var(--wm-error)", fontWeight: 950 }}
          >
            Clear all
          </button>
        )}
      </FilterGroup>

      <div style={NOTE_STYLE}>
        Pay is shown on each job card. Compare pay before opening or applying.
      </div>
    </section>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 950,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.55,
          marginBottom: 6,
        }}
      >
        {title}
      </div>

      <div className="wm-chipRow" style={{ marginTop: 0, gap: 7 }}>
        {children}
      </div>
    </div>
  );
}

function getVisibleCategories(categories: string[]): string[] {
  const uniqueCategories = new Set<string>();

  for (const category of categories) {
    const cleaned = category.trim();
    if (cleaned) uniqueCategories.add(cleaned);
  }

  return Array.from(uniqueCategories).sort();
}
