// App name: Job Mitra | EmployerShiftWorkspacesFilters.tsx — seg-tab filters (Step 3)

import { EMPLOYER_WORKSPACE_FILTERS } from "../helpers/employerShiftWorkspaces.helpers";
import type {
  EmployerWorkspaceCounts,
  EmployerWorkspaceFilter,
} from "../types/employerShiftWorkspaces.types";

type EmployerShiftWorkspacesFiltersProps = {
  query: string;
  filter: EmployerWorkspaceFilter;
  counts: EmployerWorkspaceCounts;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: EmployerWorkspaceFilter) => void;
};

export function EmployerShiftWorkspacesFilters({
  query,
  filter,
  counts,
  onQueryChange,
  onFilterChange,
}: EmployerShiftWorkspacesFiltersProps) {
  return (
    <section
      className="wm-shift-surface-glass"
      style={{ padding: "10px 12px" }}
      data-testid="employer-shift-workspaces-filters"
    >
      <input
        className="wm-input"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by company, job, or location..."
        aria-label="Search work groups"
        data-testid="employer-shift-workspaces-search"
      />

      <div
        className="wm-shift-seg-tab-row"
        role="tablist"
        aria-label="Work group status filters"
        style={{ marginTop: 10 }}
      >
        {EMPLOYER_WORKSPACE_FILTERS.map((item) => {
          const isActive = filter === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`wm-shift-seg-tab ${isActive ? "isActive" : ""}`}
              onClick={() => onFilterChange(item)}
            >
              {getFilterLabel(item)} {counts[item]}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function getFilterLabel(filter: EmployerWorkspaceFilter): string {
  if (filter === "all") return "All";
  return filter.charAt(0).toUpperCase() + filter.slice(1);
}
