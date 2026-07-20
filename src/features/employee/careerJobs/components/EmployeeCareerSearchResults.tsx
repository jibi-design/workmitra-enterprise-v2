// App name: Job Mitra
// File name: EmployeeCareerSearchResults.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\EmployeeCareerSearchResults.tsx

import type {
  CareerSearchApplicationState,
  CareerSearchPost,
} from "../helpers/careerSearchHelpers";
import { EmployeeCareerJobCard } from "./EmployeeCareerJobCard";

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
};

const CAREER_ACCENT = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_TEXT = "var(--wm-emp-text, #111827)";
const CAREER_MUTED = "var(--wm-emp-muted, #64748b)";

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
}: EmployeeCareerSearchResultsProps) {
  const cleanQuery = query.trim();

  function renderCard(post: CareerSearchPost) {
    return (
      <EmployeeCareerJobCard
        key={post.id}
        post={post}
        isSaved={savedJobIds.includes(post.id)}
        applicationStatus={applicationStatusByPostId[post.id]}
        variant="standard"
        onOpen={onOpen}
        onOpenApplications={onOpenApplications}
        onToggleSaved={onToggleSaved}
      />
    );
  }

  return (
    <>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
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
            onClick={onClearFilters}
            style={{
              padding: "7px 11px",
              borderRadius: 999,
              border: "1px solid rgba(29,78,216,0.16)",
              background: "rgba(239,246,255,0.9)",
              color: CAREER_ACCENT,
              fontSize: 11,
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: 10,
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
          />
        ) : (
          posts.map((post) => renderCard(post))
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
    return hasFilters ? "No active roles match these filters." : "No active career roles yet.";
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
};

function EmptyCareerResults({ hasFilters, query, onClearFilters }: EmptyCareerResultsProps) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "22px 18px",
        borderRadius: 22,
        border: "1px solid rgba(203,213,225,0.95)",
        background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
        boxShadow: "0 4px 10px rgba(15,23,42,0.02)",
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 14.5, color: CAREER_TEXT }}>
        {query ? "No matching roles found" : "No jobs found"}
      </div>
      <div style={{ marginTop: 7, fontSize: 12.5, color: CAREER_MUTED, lineHeight: 1.55 }}>
        {query
          ? `No results for "${query}". Please adjust your search.`
          : "No active jobs are available in this view."}
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          style={{
            marginTop: 13,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 700,
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            cursor: "pointer",
            color: CAREER_TEXT,
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
