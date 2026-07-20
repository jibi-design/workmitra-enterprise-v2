// App name: Job Mitra
// File name: CareerApplicationFilterTabs.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\careerApplications\CareerApplicationFilterTabs.tsx

import type { Tab, TabCounts } from "../../types/careerApplicationTypes";

const CAREER_MUTED = "#64748b";

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
          marginTop: 18,
          marginBottom: 16,
          display: "flex",
          gap: 8,
          overflowX: "auto",
          flexWrap: "nowrap",
          paddingBottom: "4px",
          scrollbarWidth: "none",
        }}
      >
        {TAB_DEFS.map((tabDef) => {
          const isActive = tab === tabDef.key;
          const count = counts[tabDef.key];
          const hasItems = count > 0;

          return (
            <button
              key={tabDef.key}
              type="button"
              onClick={() => onChange(tabDef.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: isActive ? 800 : 700,
                padding: "8px 16px",
                borderRadius: "999px",
                border: "none",
                background: isActive
                  ? "linear-gradient(135deg, #1d4ed8, #3b82f6)" // Rich blue gradient
                  : hasItems
                    ? "#f1f5f9" // Light gray for items
                    : "transparent",
                color: isActive ? "#ffffff" : hasItems ? "#0f172a" : CAREER_MUTED,
                cursor: "pointer",
                flexShrink: 0,
                whiteSpace: "nowrap",
                boxShadow: isActive ? "0 4px 12px rgba(29,78,216,0.3)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {tabDef.label}

              {/* Premium Badge for count */}
              {hasItems && (
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "999px",
                    background: isActive ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                    color: isActive ? "#ffffff" : "#475569",
                    fontSize: "11px",
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
