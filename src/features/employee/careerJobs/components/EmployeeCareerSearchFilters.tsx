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
const CAREER_MUTED = "var(--wm-emp-muted, #64748b)";

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
            borderRadius: 8,
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
            onClick={onClearFilters}
            style={{
              fontSize: 11.5,
              fontWeight: 900,
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(220,38,38,0.18)",
              background: "rgba(254,242,242,0.82)",
              color: "var(--wm-error, #dc2626)",
              cursor: "pointer",
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
      onClick={onClick}
      style={{
        flexShrink: 0,
        fontSize: 11.2,
        fontWeight: active ? 950 : 850,
        padding: "6px 12px",
        borderRadius: 999,
        border: active ? "1px solid rgba(29,78,216,0.32)" : "1px solid rgba(148,163,184,0.22)",
        background: active
          ? "linear-gradient(135deg, rgba(239,246,255,1), rgba(255,255,255,0.96))"
          : "rgba(255,255,255,0.9)",
        color: active ? CAREER_ACCENT : CAREER_MUTED,
        cursor: "pointer",
        boxShadow: active ? "0 4px 10px rgba(29,78,216,0.06)" : "none",
        transition: "all 0.15s ease",
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
