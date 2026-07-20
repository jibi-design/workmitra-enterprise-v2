// App name: Job Mitra
// File name: EmployerShiftWorkspacesFilters.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftWorkspacesFilters.tsx

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
    <section style={{ marginTop: 12 }}>
      <input
        className="wm-input"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by company, job, or location..."
        aria-label="Search work groups"
      />

      <div className="wm-chipRow" style={{ marginTop: 10 }}>
        {EMPLOYER_WORKSPACE_FILTERS.map((item) => (
          <button
            key={item}
            className={`wm-chipBtn ${filter === item ? "isActive" : ""}`}
            type="button"
            onClick={() => onFilterChange(item)}
          >
            {getFilterLabel(item)} {counts[item]}
          </button>
        ))}
      </div>
    </section>
  );
}

function getFilterLabel(filter: EmployerWorkspaceFilter): string {
  if (filter === "all") return "All";
  return filter.charAt(0).toUpperCase() + filter.slice(1);
}
