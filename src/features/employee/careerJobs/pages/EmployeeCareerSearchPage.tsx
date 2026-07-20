// App name: Job Mitra
// File name: EmployeeCareerSearchPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerSearchPage.tsx

import { useState } from "react";
import { EmployeeCareerSearchFilters } from "../components/EmployeeCareerSearchFilters";
import { EmployeeCareerSearchNotice } from "../components/EmployeeCareerSearchNotice";
import { EmployeeCareerSearchResults } from "../components/EmployeeCareerSearchResults";
import { useEmployeeCareerSearchPageState } from "../hooks/useEmployeeCareerSearchPageState";

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_TEXT = "#0f172a";
const CAREER_MUTED = "#475569";

type CareerSearchMainTab = "search" | "recent" | "saved" | "applied";

const MAIN_TABS: { id: CareerSearchMainTab; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "recent", label: "Recent" },
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
];

export function EmployeeCareerSearchPage() {
  const state = useEmployeeCareerSearchPageState();
  const [activeTab, setActiveTab] = useState<CareerSearchMainTab>("search");
  const [showFilters, setShowFilters] = useState(false);

  const hasSearchText = state.query.trim().length > 0 || state.locationQuery.trim().length > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        paddingBottom: 40,
        paddingTop: 10,
      }}
    >
      {/* Premium Header Section */}
      <section
        style={{
          padding: "22px 18px",
          borderRadius: 28,
          border: "1px solid rgba(255, 255, 255, 0.9)",
          background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(241,245,249,0.75))",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255,255,255,1)",
          backdropFilter: "blur(20px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -40,
            top: -60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0) 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              color: CAREER_BLUE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 8px 16px rgba(37,99,235,0.12), inset 0 2px 4px rgba(255,255,255,0.8)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: "inline-block",
                padding: "5px 12px",
                borderRadius: 20,
                background: "rgba(37, 99, 235, 0.08)",
                border: "1px solid rgba(37, 99, 235, 0.12)",
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: 0.6,
                color: "#1e40af",
                textTransform: "uppercase",
              }}
            >
              Career Search
            </div>

            <h1
              style={{
                margin: "10px 0 0",
                fontSize: 22,
                fontWeight: 800,
                color: CAREER_TEXT,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              Find your next career
            </h1>

            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: CAREER_MUTED,
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              Search, save, and review career jobs from one clean workspace.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Search Container */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          background: "rgba(255, 255, 255, 0.65)",
          padding: 16,
          borderRadius: 24,
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
            <div style={{ fontSize: 14, fontWeight: 800, color: CAREER_TEXT }}>
              Search workspace
            </div>
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
              borderRadius: 20,
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

        <SearchInput
          icon="search"
          placeholder="Job title, skill, or company"
          value={state.query}
          onChange={state.setQuery}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SearchInput
              icon="location"
              placeholder="Location"
              value={state.locationQuery}
              onChange={state.setLocationQuery}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            style={{
              padding: "0 16px",
              borderRadius: 16,
              background:
                state.hasFilters || showFilters
                  ? "rgba(37, 99, 235, 0.08)"
                  : "rgba(255,255,255,0.8)",
              color: state.hasFilters || showFilters ? CAREER_BLUE : CAREER_MUTED,
              border:
                state.hasFilters || showFilters
                  ? `1px solid rgba(37, 99, 235, 0.2)`
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

      {/* Clean Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "0 4px",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          overflowX: "auto",
        }}
      >
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 14px",
              background: "transparent",
              border: "none",
              borderBottom:
                activeTab === tab.id ? `2px solid ${CAREER_BLUE}` : "2px solid transparent",
              color: activeTab === tab.id ? CAREER_BLUE : CAREER_MUTED,
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: 14,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results Section */}
      <section style={{ padding: "0 4px" }}>
        {activeTab === "search" && (
          <EmployeeCareerSearchResults
            posts={state.visiblePosts}
            savedPosts={state.savedPosts}
            recentPosts={state.recentPosts}
            appliedPosts={state.appliedPosts}
            savedJobIds={state.savedJobIds}
            applicationStatusByPostId={state.applicationStatusByPostId}
            activeTab={state.activeTab}
            resultTitle={hasSearchText ? "Search results" : "Recommended for you"}
            hasFilters={state.hasFilters}
            query={state.query}
            onOpen={state.openDetails}
            onOpenApplications={state.openApplications}
            onToggleSaved={state.toggleSaved}
            onClearFilters={state.clearFilters}
          />
        )}

        {activeTab === "recent" && (
          <EmployeeCareerSearchResults
            posts={state.recentPosts}
            savedPosts={[]}
            recentPosts={[]}
            appliedPosts={[]}
            savedJobIds={state.savedJobIds}
            applicationStatusByPostId={state.applicationStatusByPostId}
            activeTab="recent"
            resultTitle={`Recently viewed (${state.recentPosts.length})`}
            hasFilters={false}
            query=""
            onOpen={state.openDetails}
            onOpenApplications={state.openApplications}
            onToggleSaved={state.toggleSaved}
            onClearFilters={state.clearFilters}
          />
        )}

        {activeTab === "saved" && (
          <EmployeeCareerSearchResults
            posts={state.savedPosts}
            savedPosts={[]}
            recentPosts={[]}
            appliedPosts={[]}
            savedJobIds={state.savedJobIds}
            applicationStatusByPostId={state.applicationStatusByPostId}
            activeTab="saved"
            resultTitle={`Saved jobs (${state.savedPosts.length})`}
            hasFilters={false}
            query=""
            onOpen={state.openDetails}
            onOpenApplications={state.openApplications}
            onToggleSaved={state.toggleSaved}
            onClearFilters={state.clearFilters}
          />
        )}

        {activeTab === "applied" && (
          <EmployeeCareerSearchResults
            posts={state.appliedPosts}
            savedPosts={[]}
            recentPosts={[]}
            appliedPosts={[]}
            savedJobIds={state.savedJobIds}
            applicationStatusByPostId={state.applicationStatusByPostId}
            activeTab="applied"
            resultTitle={`Applied jobs (${state.appliedPosts.length})`}
            hasFilters={false}
            query=""
            onOpen={state.openDetails}
            onOpenApplications={state.openApplications}
            onToggleSaved={state.toggleSaved}
            onClearFilters={state.clearFilters}
          />
        )}
      </section>

      <EmployeeCareerSearchNotice notice={state.notice} />
    </div>
  );
}

function SearchInput({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: "search" | "location";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon === "search" ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        )}
      </span>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          padding: "14px 14px 14px 42px",
          borderRadius: 16,
          border: "1px solid rgba(15, 23, 42, 0.08)",
          fontSize: 14,
          fontWeight: 600,
          color: "#0f172a",
          outline: "none",
          boxSizing: "border-box",
          background: "rgba(255,255,255,0.85)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)",
          transition: "border-color 0.2s ease",
        }}
      />
    </div>
  );
}
