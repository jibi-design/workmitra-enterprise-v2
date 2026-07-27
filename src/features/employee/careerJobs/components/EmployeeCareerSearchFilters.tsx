// App name: Job Mitra
// File name: EmployeeCareerSearchFilters.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\EmployeeCareerSearchFilters.tsx

import type { ReactNode } from "react";
import { fmtJobType, fmtWorkMode } from "../helpers/careerSearchHelpers";
import type {
  ExperienceFilter,
  JobTypeFilter,
  WorkModeFilter,
} from "../helpers/careerSearchHelpers";

type EmployeeCareerSearchFiltersProps = {
  query: string;
  resultCount: number;
  jobType: JobTypeFilter;
  workMode: WorkModeFilter;
  experience: ExperienceFilter;
  hasFilters: boolean;
  onQueryChange: (value: string) => void;
  onJobTypeChange: (value: JobTypeFilter) => void;
  onWorkModeChange: (value: WorkModeFilter) => void;
  onExperienceChange: (value: ExperienceFilter) => void;
  onClearFilters: () => void;
  onSavePreference: () => void;
};

const JOB_TYPE_OPTIONS: JobTypeFilter[] = ["any", "full-time", "part-time", "contract"];
const WORK_MODE_OPTIONS: WorkModeFilter[] = ["any", "on-site", "remote", "hybrid"];
const EXPERIENCE_OPTIONS: ExperienceFilter[] = ["any", "0-1", "1-3", "3-7", "7+"];

const CAREER_ACCENT = "var(--wm-er-accent-career, #1d4ed8)";

export function EmployeeCareerSearchFilters({
  resultCount,
  jobType,
  workMode,
  experience,
  hasFilters,
  onJobTypeChange,
  onWorkModeChange,
  onExperienceChange,
  onClearFilters,
}: EmployeeCareerSearchFiltersProps) {
  // Note: The main search bar has been moved to the parent component.
  // This component now strictly handles the advanced filtering UI.

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "4px 0" }}>
      {hasFilters && resultCount > 0 && (
        <div
          style={{
            padding: "6px 10px",
            borderRadius: "var(--wm-radius-8)",
            background: "rgba(29,78,216,0.05)",
            border: "1px solid rgba(29,78,216,0.1)",
            color: CAREER_ACCENT,
            fontSize: 11.5,
            fontWeight: 800,
          }}
        >
          {resultCount} {resultCount === 1 ? "role" : "roles"} matching filters
        </div>
      )}

      <FilterRow>
        {JOB_TYPE_OPTIONS.map((value) => (
          <FilterChip
            key={value}
            label={value === "any" ? "All types" : fmtJobType(value)}
            active={jobType === value}
            onClick={() => onJobTypeChange(value)}
          />
        ))}
      </FilterRow>

      <FilterRow>
        {WORK_MODE_OPTIONS.map((value) => (
          <FilterChip
            key={value}
            label={value === "any" ? "All modes" : fmtWorkMode(value)}
            active={workMode === value}
            onClick={() => onWorkModeChange(value)}
          />
        ))}
      </FilterRow>

      <FilterRow>
        {EXPERIENCE_OPTIONS.map((value) => (
          <FilterChip
            key={value}
            label={fmtExperienceFilter(value)}
            active={experience === value}
            onClick={() => onExperienceChange(value)}
          />
        ))}
      </FilterRow>

      {hasFilters && (
        <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="wm-career-tap"
            onClick={onClearFilters}
            style={{
              fontSize: 12,
              fontWeight: 800,
              padding: "0 14px",
              borderRadius: "var(--wm-radius-pill)",
              border: "1px solid rgba(220,38,38,0.18)",
              background: "rgba(254,242,242,0.82)",
              color: "var(--wm-error, #dc2626)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterRow({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 7,
        overflowX: "auto",
        paddingBottom: 2,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {children}
    </div>
  );
}

function FilterChip({
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
      className={
        active
          ? "wm-career-filter-chip wm-career-filter-chip--active"
          : "wm-career-filter-chip wm-career-filter-chip--idle"
      }
      onClick={onClick}
      style={{
        fontSize: 12,
        border: active ? undefined : "1px solid rgba(148,163,184,0.22)",
      }}
    >
      {label}
    </button>
  );
}

function fmtExperienceFilter(value: ExperienceFilter): string {
  if (value === "any") return "Any exp";
  if (value === "0-1") return "0-1 yr";
  if (value === "1-3") return "1-3 yrs";
  if (value === "3-7") return "3-7 yrs";
  return "7+ yrs";
}
