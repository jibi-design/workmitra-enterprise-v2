// App name: Job Mitra
// File name: EmployeeCareerDiscoveryTabs.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\EmployeeCareerDiscoveryTabs.tsx

import type { CareerDiscoveryTab, CareerDiscoveryTabId } from "../helpers/careerDiscoveryHelpers";

type EmployeeCareerDiscoveryTabsProps = {
  tabs: CareerDiscoveryTab[];
  activeTab: CareerDiscoveryTabId;
  onTabChange: (tab: CareerDiscoveryTabId) => void;
};

const CAREER_ACCENT = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_TEXT = "var(--wm-career-text, #111827)";
const CAREER_MUTED = "var(--wm-career-muted, #64748b)";

export function EmployeeCareerDiscoveryTabs({
  tabs,
  activeTab,
  onTabChange,
}: EmployeeCareerDiscoveryTabsProps) {
  const visibleTabs = tabs.filter((tab) => tab.id !== "recent");

  return (
    <section
      style={{
        marginTop: 12,
        padding: 10,
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(29,78,216,0.13)",
        background:
          "radial-gradient(circle at 96% 0%, rgba(29,78,216,0.08), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.99), rgba(248,250,252,0.98) 60%, rgba(239,246,255,0.7))",
        boxShadow: "0 14px 30px rgba(15,23,42,0.065)",
      }}
    >
      <div style={{ fontSize: 12.8, fontWeight: 950, color: CAREER_TEXT }}>Discovery mode</div>

      <div
        style={{
          marginTop: 9,
          display: "flex",
          gap: 7,
          overflowX: "auto",
          paddingBottom: 1,
          scrollbarWidth: "none",
        }}
      >
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-pressed={isActive}
              style={{
                flexShrink: 0,
                padding: "7px 10px",
                borderRadius: "var(--wm-radius-pill)",
                border: isActive
                  ? "1px solid rgba(29,78,216,0.3)"
                  : "1px solid rgba(148,163,184,0.22)",
                background: isActive
                  ? "linear-gradient(135deg, rgba(239,246,255,1), rgba(255,255,255,0.96))"
                  : "rgba(255,255,255,0.9)",
                color: isActive ? CAREER_ACCENT : CAREER_MUTED,
                cursor: "pointer",
                boxShadow: isActive ? "0 7px 14px rgba(29,78,216,0.08)" : "none",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 11.4, fontWeight: 950 }}>{getCompactTabLabel(tab.id)}</span>
              <span
                style={{
                  marginLeft: 5,
                  fontSize: 10.8,
                  fontWeight: 950,
                  opacity: 0.8,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function getCompactTabLabel(tabId: CareerDiscoveryTabId): string {
  if (tabId === "closing") return "Closing";

  return {
    best: "Best Match",
    new: "New Jobs",
    saved: "Saved",
    applied: "Applied",
    closing: "Closing",
    recent: "Recent",
  }[tabId];
}
