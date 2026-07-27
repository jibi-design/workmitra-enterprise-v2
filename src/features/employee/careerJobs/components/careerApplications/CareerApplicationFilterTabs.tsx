// App name: Job Mitra
// File name: CareerApplicationFilterTabs.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\careerApplications\CareerApplicationFilterTabs.tsx

import type { Tab, TabCounts } from "../../types/careerApplicationTypes";

const TAB_CSS = `.wm-career-app-tabs::-webkit-scrollbar{display:none}`;

const TAB_DEFS: { key: Tab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "interview", label: "Interview" },
  { key: "offers", label: "Offers" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
];

export function FilterTabs({
  tab,
  counts,
  onChange,
}: {
  tab: Tab;
  counts: TabCounts;
  onChange: (tab: Tab) => void;
}) {
  return (
    <>
      <style>{TAB_CSS}</style>

      <section
        className="wm-career-app-tabs"
        style={{
          marginTop: 16,
          marginBottom: 16,
          display: "flex",
          gap: 8,
          overflowX: "auto",
          flexWrap: "nowrap",
          paddingBottom: 4,
          scrollbarWidth: "none",
        }}
      >
        {TAB_DEFS.map((tabDef) => {
          const isActive = tab === tabDef.key;
          const count = counts[tabDef.key];
          const hasItems = count > 0;
          const chipClass = isActive
            ? "wm-career-filter-chip wm-career-filter-chip--active"
            : hasItems
              ? "wm-career-filter-chip wm-career-filter-chip--idle"
              : "wm-career-filter-chip wm-career-filter-chip--empty";

          return (
            <button
              key={tabDef.key}
              type="button"
              className={chipClass}
              onClick={() => onChange(tabDef.key)}
            >
              {tabDef.label}

              {hasItems && (
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "var(--wm-radius-pill)",
                    background: isActive ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                    color: isActive ? "#ffffff" : "#475569",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </section>
    </>
  );
}
