// App name: Job Mitra
// File name: CandidateReviewToolbar.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\candidateReview\CandidateReviewToolbar.tsx

import type { CSSProperties } from "react";
import type { CandidateReviewFilters, CandidateReviewSummary } from "./candidateReview.types";

type CandidateReviewToolbarProps = {
  readonly filters: CandidateReviewFilters;
  readonly summary: CandidateReviewSummary;
  readonly onChange: (filters: CandidateReviewFilters) => void;
  readonly onReset: () => void;
};

const PANEL_STYLE: CSSProperties = {
  padding: 13,
  borderRadius: "var(--wm-radius-employee-card)",
  border: "1px solid rgba(22,163,74,0.15)",
  background: "linear-gradient(180deg, rgba(240,253,244,0.72), rgba(255,255,255,0.98))",
  boxShadow: "0 12px 26px rgba(15,23,42,0.055)",
};

const TOP_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
};

const TITLE_STYLE: CSSProperties = {
  fontSize: 13,
  fontWeight: 950,
  color: "var(--wm-er-text)",
};

const SUB_STYLE: CSSProperties = {
  marginTop: 3,
  fontSize: 11,
  fontWeight: 750,
  color: "var(--wm-er-muted)",
};

const GRID_STYLE: CSSProperties = {
  marginTop: 12,
  display: "grid",
  gap: 9,
  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
};

const FIELD_STYLE: CSSProperties = {
  width: "100%",
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(148,163,184,0.28)",
  background: "#ffffff",
  color: "var(--wm-er-text)",
  fontSize: 12,
  fontWeight: 800,
  padding: "10px 11px",
  outline: "none",
};

const RESET_BUTTON_STYLE: CSSProperties = {
  border: "1px solid rgba(15,23,42,0.1)",
  background: "#ffffff",
  color: "var(--wm-er-muted)",
  borderRadius: "var(--wm-radius-pill)",
  padding: "8px 10px",
  fontSize: 11,
  fontWeight: 900,
  cursor: "pointer",
};

export function CandidateReviewToolbar({
  filters,
  summary,
  onChange,
  onReset,
}: CandidateReviewToolbarProps) {
  return (
    <section style={PANEL_STYLE}>
      <div style={TOP_STYLE}>
        <div>
          <div style={TITLE_STYLE}>Candidate review controls</div>
          <div style={SUB_STYLE}>
            Showing {summary.visible} of {summary.total} candidates · Strong {summary.strong} · Good{" "}
            {summary.good} · Review {summary.needsReview}
          </div>
        </div>

        <button type="button" onClick={onReset} style={RESET_BUTTON_STYLE}>
          Reset filters{summary.activeFilters > 0 ? ` (${summary.activeFilters})` : ""}
        </button>
      </div>

      <div style={GRID_STYLE}>
        <input
          type="search"
          value={filters.query}
          placeholder="Search name, city, ID, skill"
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          style={FIELD_STYLE}
          aria-label="Search candidates"
        />

        <select
          value={filters.match}
          onChange={(event) =>
            onChange({
              ...filters,
              match: event.target.value as CandidateReviewFilters["match"],
            })
          }
          style={FIELD_STYLE}
          aria-label="Filter by match strength"
        >
          <option value="all">All match levels</option>
          <option value="strong">Strong match</option>
          <option value="good">Good match</option>
          <option value="needs_review">Needs review</option>
        </select>

        <select
          value={filters.priority}
          onChange={(event) =>
            onChange({
              ...filters,
              priority: event.target.value as CandidateReviewFilters["priority"],
            })
          }
          style={FIELD_STYLE}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          <option value="priority">Priority</option>
          <option value="good">Good</option>
          <option value="review">Review</option>
          <option value="none">No tag</option>
        </select>

        <select
          value={filters.sort}
          onChange={(event) =>
            onChange({
              ...filters,
              sort: event.target.value as CandidateReviewFilters["sort"],
            })
          }
          style={FIELD_STYLE}
          aria-label="Sort candidates"
        >
          <option value="recommended">Recommended first</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
    </section>
  );
}
