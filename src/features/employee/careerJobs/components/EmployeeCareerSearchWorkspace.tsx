// App name: Job Mitra
// File name: EmployeeCareerSearchWorkspace.tsx

import { EmployeeCareerSearchFilters } from "./EmployeeCareerSearchFilters";
import { EmployeeCareerSearchInput } from "./EmployeeCareerSearchInput";
import type { useEmployeeCareerSearchPageState } from "../hooks/useEmployeeCareerSearchPageState";

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_TEXT = "#0f172a";
const CAREER_MUTED = "#475569";

type SearchState = ReturnType<typeof useEmployeeCareerSearchPageState>;

export function EmployeeCareerSearchWorkspace({
  state,
  showFilters,
  onToggleFilters,
  hasSearchText,
}: {
  state: SearchState;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasSearchText: boolean;
}) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: "rgba(255, 255, 255, 0.65)",
        padding: 16,
        borderRadius: "var(--wm-radius-employer-card)",
        border: "1px solid rgba(255, 255, 255, 0.9)",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: CAREER_TEXT }}>Search workspace</div>
          <div style={{ marginTop: 4, fontSize: 12, color: CAREER_MUTED, fontWeight: 500 }}>
            Search by job and location for cleaner results.
          </div>
        </div>

        <button
          type="button"
          onClick={state.saveSearch}
          style={{
            flexShrink: 0,
            padding: "8px 12px",
            borderRadius: "var(--wm-radius-employee-card)",
            background:
              hasSearchText || state.hasFilters
                ? "rgba(37, 99, 235, 0.08)"
                : "rgba(15, 23, 42, 0.04)",
            color: hasSearchText || state.hasFilters ? CAREER_BLUE : CAREER_MUTED,
            border:
              hasSearchText || state.hasFilters
                ? "1px solid rgba(37, 99, 235, 0.12)"
                : "1px solid transparent",
            cursor: "pointer",
            fontSize: 11.5,
            fontWeight: 700,
            transition: "all 0.2s ease",
          }}
        >
          Save Search
        </button>
      </div>

      <EmployeeCareerSearchInput
        icon="search"
        placeholder="Job title, skill, or company"
        value={state.query}
        onChange={state.setQuery}
      />

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <EmployeeCareerSearchInput
            icon="location"
            placeholder="Location"
            value={state.locationQuery}
            onChange={state.setLocationQuery}
          />
        </div>

        <button
          type="button"
          onClick={onToggleFilters}
          style={{
            padding: "0 16px",
            borderRadius: "var(--wm-radius-chip)",
            background:
              state.hasFilters || showFilters ? "rgba(37, 99, 235, 0.08)" : "rgba(255,255,255,0.8)",
            color: state.hasFilters || showFilters ? CAREER_BLUE : CAREER_MUTED,
            border:
              state.hasFilters || showFilters
                ? "1px solid rgba(37, 99, 235, 0.2)"
                : "1px solid rgba(15, 23, 42, 0.08)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filters
        </button>
      </div>

      {showFilters && (
        <div
          style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid rgba(15, 23, 42, 0.06)" }}
        >
          <EmployeeCareerSearchFilters
            query={state.query}
            resultCount={state.filtered.length}
            jobType={state.jobType}
            workMode={state.workMode}
            experience={state.experience}
            hasFilters={state.hasFilters}
            onQueryChange={state.setQuery}
            onJobTypeChange={state.setJobType}
            onWorkModeChange={state.setWorkMode}
            onExperienceChange={state.setExperience}
            onClearFilters={state.clearFilters}
            onSavePreference={state.saveSearch}
          />
        </div>
      )}
    </section>
  );
}
