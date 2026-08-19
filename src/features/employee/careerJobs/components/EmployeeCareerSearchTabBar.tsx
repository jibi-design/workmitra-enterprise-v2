// App name: Job Mitra
// File name: EmployeeCareerSearchTabBar.tsx

export type CareerSearchMainTab = "search" | "recent" | "saved" | "applied";

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_MUTED = "#475569";

const MAIN_TABS: { id: CareerSearchMainTab; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "recent", label: "Recent" },
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
];

export function EmployeeCareerSearchTabBar({
  activeTab,
  onChange,
}: {
  activeTab: CareerSearchMainTab;
  onChange: (tab: CareerSearchMainTab) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "0 4px",
        borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
        overflowX: "auto",
      }}
    >
      {MAIN_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          data-testid={`career-search-tab-${tab.id}`}
          onClick={() => onChange(tab.id)}
          style={{
            padding: "10px 14px",
            background: "transparent",
            border: "none",
            borderBottom:
              activeTab === tab.id ? `2px solid ${CAREER_BLUE}` : "2px solid transparent",
            color: activeTab === tab.id ? CAREER_BLUE : CAREER_MUTED,
            fontWeight: activeTab === tab.id ? 800 : 600,
            fontSize: 14,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s ease",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
