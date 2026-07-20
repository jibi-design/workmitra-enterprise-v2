// App: Job Mitra / WorkMitra_Enterprise_v2
// File: MyStaffSearchFilters.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\MyStaffSearchFilters.tsx

type Props = {
  staffCount: number;
  categories: string[];
  searchQuery: string;
  filterCategory: string;
  onSearchChange: (value: string) => void;
  onFilterCategoryChange: (value: string) => void;
};

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 12px",
        borderRadius: 999,
        border: active
          ? "1.5px solid var(--wm-er-accent-console, #0369a1)"
          : "1px solid var(--wm-er-border)",
        background: active ? "rgba(3,105,161,0.08)" : "var(--wm-er-bg)",
        color: active ? "var(--wm-er-accent-console, #0369a1)" : "var(--wm-er-muted)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

export function MyStaffSearchFilters({
  staffCount,
  categories,
  searchQuery,
  filterCategory,
  onSearchChange,
  onFilterCategoryChange,
}: Props) {
  if (staffCount === 0) return null;

  return (
    <>
      <div style={{ marginTop: 12 }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, ID, or job title..."
          style={{
            width: "100%",
            height: 42,
            borderRadius: 12,
            border: "1.5px solid var(--wm-er-border)",
            background: "var(--wm-er-card)",
            padding: "0 14px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--wm-er-text)",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {categories.length > 0 && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          <FilterPill
            label="All"
            active={filterCategory === ""}
            onClick={() => onFilterCategoryChange("")}
          />

          {categories.map((category) => (
            <FilterPill
              key={category}
              label={category}
              active={filterCategory === category}
              onClick={() => onFilterCategoryChange(category === filterCategory ? "" : category)}
            />
          ))}
        </div>
      )}
    </>
  );
}
