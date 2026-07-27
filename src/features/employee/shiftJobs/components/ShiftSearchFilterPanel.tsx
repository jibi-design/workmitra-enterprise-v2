// App name: Job Mitra | ShiftSearchFilterPanel.tsx — glass + seg-tabs (Wave B)

import type { Dispatch, ReactNode, SetStateAction } from "react";
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

export function ShiftSearchFilterPanel(props: Props) {
  const visibleCategories = getVisibleCategories(props.categories);
  const shouldShowCategoryFilter = visibleCategories.length > 1;

  return (
    <section
      className="wm-ee-vShift wm-shift-surface-glass"
      data-testid="shift-search-filter-panel"
      style={{ padding: "12px 12px 10px" }}
    >
      <input
        className="wm-input"
        value={props.searchQuery}
        onChange={(event) => props.setSearchQuery(event.target.value)}
        placeholder="Search job, company, area, or keyword..."
        aria-label="Search shifts"
        data-testid="shift-search-query"
        style={{ minHeight: 44, marginBottom: 10 }}
      />

      <FilterGroup title="Date">
        <SegTab active={props.timeOpt === "any"} onClick={() => props.setTimeOpt("any")}>
          All dates
        </SegTab>
        <SegTab active={props.timeOpt === "today"} onClick={() => props.setTimeOpt("today")}>
          Today
        </SegTab>
        <SegTab active={props.timeOpt === "next3"} onClick={() => props.setTimeOpt("next3")}>
          Next 3 days
        </SegTab>
        <SegTab active={props.timeOpt === "week"} onClick={() => props.setTimeOpt("week")}>
          This week
        </SegTab>
        <SegTab active={props.timeOpt === "weekend"} onClick={() => props.setTimeOpt("weekend")}>
          Weekend
        </SegTab>
      </FilterGroup>

      <FilterGroup title="Worker type">
        <SegTab active={props.exp === "any"} onClick={() => props.setExp("any")}>
          Any level
        </SegTab>
        <SegTab active={props.exp === "fresher_ok"} onClick={() => props.setExp("fresher_ok")}>
          No experience needed
        </SegTab>
        <SegTab active={props.exp === "helper"} onClick={() => props.setExp("helper")}>
          Helper work
        </SegTab>
        <SegTab active={props.exp === "experienced"} onClick={() => props.setExp("experienced")}>
          Experienced
        </SegTab>
      </FilterGroup>

      {shouldShowCategoryFilter ? (
        <FilterGroup title="Category">
          <SegTab active={props.catFilter === "any"} onClick={() => props.setCatFilter("any")}>
            All categories
          </SegTab>
          {visibleCategories.map((category) => (
            <SegTab
              key={category}
              active={props.catFilter === category}
              onClick={() => props.setCatFilter(category)}
            >
              {category}
            </SegTab>
          ))}
        </FilterGroup>
      ) : null}

      <FilterGroup title="Duration">
        <SegTab active={props.dur === "any"} onClick={() => props.setDur("any")}>
          Any duration
        </SegTab>
        <SegTab active={props.dur === "oneday"} onClick={() => props.setDur("oneday")}>
          1 day
        </SegTab>
        <SegTab active={props.dur === "multiday"} onClick={() => props.setDur("multiday")}>
          Multi-day
        </SegTab>
        {props.hasFilters ? (
          <button
            type="button"
            className="wm-shift-seg-tab wm-shift-pressable"
            onClick={props.onClearFilters}
            style={{ marginLeft: "auto", color: "var(--wm-error)", fontWeight: 900 }}
            data-testid="shift-search-clear-filters"
          >
            Clear all
          </button>
        ) : null}
      </FilterGroup>

      <div
        className="wm-shift-surface-glass wm-shift-surface-glass--shift"
        style={{
          marginTop: 12,
          padding: "10px 12px",
          fontSize: 11,
          color: "var(--wm-er-muted)",
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        Pay is shown on each job card. Compare pay before opening or applying.
      </div>
    </section>
  );
}

function SegTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`wm-shift-seg-tab ${active ? "isActive" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
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
      <div className="wm-shift-seg-tab-row" style={{ gap: 7 }}>
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
