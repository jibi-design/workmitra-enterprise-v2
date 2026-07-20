// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminAlertsFilters.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminAlertsFilters.tsx

type DomainFilter = "all" | "shift" | "career";
type DateFilter = "all" | "today" | "7d" | "30d";

type Props = {
  searchText: string;
  domainFilter: DomainFilter;
  kindFilter: string;
  dateFilter: DateFilter;
  allKinds: string[];
  getKindLabel: (kind: string) => string;
  onSearchChange: (value: string) => void;
  onDomainChange: (value: DomainFilter) => void;
  onKindChange: (value: string) => void;
  onDateChange: (value: DateFilter) => void;
};

export function AdminAlertsFilters({
  searchText,
  domainFilter,
  kindFilter,
  dateFilter,
  allKinds,
  getKindLabel,
  onSearchChange,
  onDomainChange,
  onKindChange,
  onDateChange,
}: Props) {
  return (
    <>
      <input
        type="text"
        className="wm-ad-searchInput"
        placeholder="Search events by title, body, or kind..."
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <div className="wm-ad-filterBar">
        {(["all", "shift", "career"] as DomainFilter[]).map((value) => (
          <button
            key={value}
            type="button"
            className="wm-ad-filterChip"
            data-active={domainFilter === value}
            onClick={() => onDomainChange(value)}
          >
            {value === "all" ? "All Domains" : value === "shift" ? "Shift Jobs" : "Career Jobs"}
          </button>
        ))}
      </div>

      {allKinds.length > 0 && (
        <div className="wm-ad-filterBar">
          <button
            type="button"
            className="wm-ad-filterChip"
            data-active={kindFilter === "all"}
            onClick={() => onKindChange("all")}
          >
            All Types
          </button>

          {allKinds.map((kind) => (
            <button
              key={kind}
              type="button"
              className="wm-ad-filterChip"
              data-active={kindFilter === kind}
              onClick={() => onKindChange(kind)}
            >
              {getKindLabel(kind)}
            </button>
          ))}
        </div>
      )}

      <div className="wm-ad-filterBar" style={{ marginBottom: 18 }}>
        {[
          { value: "all" as DateFilter, label: "All Time" },
          { value: "today" as DateFilter, label: "Today" },
          { value: "7d" as DateFilter, label: "Last 7 Days" },
          { value: "30d" as DateFilter, label: "Last 30 Days" },
        ].map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className="wm-ad-filterChip"
            data-active={dateFilter === value}
            onClick={() => onDateChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
