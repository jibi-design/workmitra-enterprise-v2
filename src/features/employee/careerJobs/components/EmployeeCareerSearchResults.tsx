// App name: Job Mitra
// File name: EmployeeCareerSearchResults.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\EmployeeCareerSearchResults.tsx

import { CareerEmptyState } from "../../../career/components/CareerEmptyState";
import type {
  CareerSearchApplicationState,
  CareerSearchPost,
} from "../helpers/careerSearchHelpers";
import { EmployeeCareerSearchVirtualList } from "./EmployeeCareerSearchVirtualList";

type EmployeeCareerSearchResultsProps = {
  posts: CareerSearchPost[];
  savedPosts: CareerSearchPost[];
  recentPosts: CareerSearchPost[];
  appliedPosts: CareerSearchPost[];
  savedJobIds: string[];
  applicationStatusByPostId: Record<string, CareerSearchApplicationState>;
  activeTab: string;
  resultTitle: string;
  hasFilters: boolean;
  query: string;
  onOpen: (id: string) => void;
  onOpenApplications: () => void;
  onToggleSaved: (id: string) => void;
  onClearFilters: () => void;
  onOpenSaved: () => void;
};

const CAREER_ACCENT = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_TEXT = "var(--wm-career-text, #111827)";
const CAREER_MUTED = "var(--wm-career-muted, #64748b)";

export function EmployeeCareerSearchResults({
  posts,
  savedJobIds,
  applicationStatusByPostId,
  activeTab,
  resultTitle,
  hasFilters,
  query,
  onOpen,
  onOpenApplications,
  onToggleSaved,
  onClearFilters,
  onOpenSaved,
}: EmployeeCareerSearchResultsProps) {
  const cleanQuery = query.trim();

  return (
    <>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--wm-space-10)",
        }}
      >
        <div>
          <div style={{ fontSize: 15, color: CAREER_TEXT, fontWeight: 950 }}>
            {resultTitle || getFallbackTitle(activeTab)}
          </div>
          <div
            style={{
              marginTop: 3,
              fontSize: 11.6,
              color: CAREER_MUTED,
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            {getResultHelperText(posts.length, activeTab, hasFilters, cleanQuery)}
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            className="wm-career-tap"
            onClick={onClearFilters}
            style={{
              padding: "0 14px",
              borderRadius: "var(--wm-radius-pill)",
              border: "1px solid rgba(29,78,216,0.16)",
              background: "rgba(239,246,255,0.9)",
              color: CAREER_ACCENT,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: "var(--wm-space-10)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: 24,
        }}
      >
        {posts.length === 0 ? (
          <EmptyCareerResults
            hasFilters={hasFilters}
            query={cleanQuery}
            onClearFilters={onClearFilters}
            onOpenSaved={onOpenSaved}
          />
        ) : (
          <EmployeeCareerSearchVirtualList
            posts={posts}
            savedJobIds={savedJobIds}
            applicationStatusByPostId={applicationStatusByPostId}
            onOpen={onOpen}
            onOpenApplications={onOpenApplications}
            onToggleSaved={onToggleSaved}
          />
        )}
      </div>
    </>
  );
}

function getFallbackTitle(activeTab: string) {
  if (activeTab === "saved") return "Saved Jobs";
  if (activeTab === "applied") return "Applied Jobs";
  if (activeTab === "recent") return "Recently Viewed";
  return "Recommended for you";
}

function getResultHelperText(
  count: number,
  activeTab: string,
  hasFilters: boolean,
  query: string,
): string {
  if (count === 0) {
    if (query) return "No jobs matched this search. Try another title or location.";
    if (activeTab === "recent") return "Recently viewed jobs will appear here.";
    return hasFilters
      ? "No active roles match these filters."
      : "Empty catalog — no career jobs listed yet.";
  }
  if (activeTab === "saved") return "Open saved jobs and apply from the detail page.";
  if (activeTab === "applied") return "View submitted applications from here.";
  if (activeTab === "recent") return "Return to jobs you opened recently.";
  return "Sorted using your search criteria and job activity.";
}

type EmptyCareerResultsProps = {
  hasFilters: boolean;
  query: string;
  onClearFilters: () => void;
  onOpenSaved: () => void;
};

function EmptyCareerResults({
  hasFilters,
  query,
  onClearFilters,
  onOpenSaved,
}: EmptyCareerResultsProps) {
  return (
    <CareerEmptyState
      title={query ? "No matching roles found" : "Empty catalog"}
      subtitle={
        query
          ? `No results for "${query}". Try another title or location.`
          : "No career jobs are listed yet. When roles appear, save them from each card."
      }
      ctaLabel={hasFilters ? "Clear filters" : "Save Job"}
      onCta={hasFilters ? onClearFilters : onOpenSaved}
    />
  );
}
