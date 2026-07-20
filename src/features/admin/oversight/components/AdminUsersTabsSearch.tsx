// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminUsersTabsSearch.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminUsersTabsSearch.tsx

export type AdminUsersTab = "employers" | "employees";

type Props = {
  tab: AdminUsersTab;
  search: string;
  employerCount: number;
  employeeCount: number;
  onTabChange: (tab: AdminUsersTab) => void;
  onSearchChange: (value: string) => void;
};

export function AdminUsersTabsSearch({
  tab,
  search,
  employerCount,
  employeeCount,
  onTabChange,
  onSearchChange,
}: Props) {
  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 16,
          background: "var(--wm-ad-card-inner)",
          borderRadius: "var(--wm-ad-ri)",
          border: "1px solid var(--wm-ad-border)",
          padding: 3,
        }}
      >
        {(["employers", "employees"] as AdminUsersTab[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onTabChange(item)}
            style={{
              flex: 1,
              padding: "10px 0",
              fontSize: 13,
              fontWeight: tab === item ? 800 : 600,
              color: tab === item ? "var(--wm-ad-navy)" : "var(--wm-ad-navy-400)",
              background: tab === item ? "var(--wm-ad-white)" : "transparent",
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              boxShadow: tab === item ? "var(--wm-ad-sh)" : "none",
              transition: "all 0.15s",
            }}
          >
            {item === "employers" ? `Employers (${employerCount})` : `Employees (${employeeCount})`}
          </button>
        ))}
      </div>

      <input
        type="text"
        className="wm-ad-searchInput"
        placeholder={
          tab === "employers"
            ? "Search by company, name, email..."
            : "Search by name, ID, city, skills..."
        }
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </>
  );
}
