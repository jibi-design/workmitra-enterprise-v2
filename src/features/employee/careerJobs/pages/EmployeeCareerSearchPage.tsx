// src/features/employee/careerJobs/pages/EmployeeCareerSearchPage.tsx
//
// Search & filter active career job posts.
// Navigate to job details (P2) on click.
// Indigo accent (career domain).

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

import {
  getCareerSearchSnapshot,
  subscribeCareerSearch,
  filterCareerPosts,
  fmtSalaryRange,
  fmtExperience,
  fmtJobType,
  fmtWorkMode,
} from "../helpers/careerSearchHelpers";

import { jobAlertStorage } from "../../../../shared/utils/jobAlertStorage";
import type { CareerAlertCriteria } from "../../../../shared/utils/jobAlertTypes";
import { SavedSearchCard } from "../../../../shared/components/SavedSearchCard";

import type {
  CareerSearchPost,
  JobTypeFilter,
  WorkModeFilter,
  ExperienceFilter,
} from "../helpers/careerSearchHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EmployeeCareerSearchPage() {
  const nav = useNavigate();

  const allPosts = useSyncExternalStore(
    subscribeCareerSearch,
    getCareerSearchSnapshot,
    getCareerSearchSnapshot,
  );

  // ── Filter State ──
  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState<JobTypeFilter>("any");
  const [workMode, setWorkMode] = useState<WorkModeFilter>("any");
  const [experience, setExperience] = useState<ExperienceFilter>("any");
  const [department, setDepartment] = useState("any");
  const [notice, setNotice] = useState("");

  // ── Dynamic departments from posts ──
  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const p of allPosts) {
      if (p.department && p.department.trim()) set.add(p.department.trim());
    }
    return Array.from(set).sort();
  }, [allPosts]);

  // ── Filtered Results ──
  const filtered = useMemo(
    () => filterCareerPosts(allPosts, query, jobType, workMode, experience, department),
    [allPosts, query, jobType, workMode, experience, department],
  );

  const hasFilters =
    query.trim().length > 0 ||
    jobType !== "any" ||
    workMode !== "any" ||
    experience !== "any" ||
    department !== "any";

  function clearFilters() {
    setQuery("");
    setJobType("any");
    setWorkMode("any");
    setExperience("any");
    setDepartment("any");
  }

  function openDetails(postId: string) {
    nav(ROUTE_PATHS.employeeCareerPostDetails.replace(":postId", postId));
  }

  return (
    <div>
      {/* Page Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Find Career Jobs</div>
          <div className="wm-pageSub">Search permanent positions and apply.</div>
        </div>
      </div>

      {/* Search + Filters */}
      <section className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <input
            className="wm-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, company, location, or skill..."
            aria-label="Search career jobs"
          />
        </div>

        {/* Job Type */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {(["any", "full-time", "part-time", "contract"] as JobTypeFilter[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setJobType(t)}
              style={{
                fontSize: 12,
                fontWeight: jobType === t ? 900 : 700,
                padding: "6px 12px",
                borderRadius: 999,
                border: jobType === t
                  ? "1.5px solid var(--wm-er-accent-career)"
                  : "1px solid var(--wm-emp-border, rgba(15,23,42,0.10))",
                background: jobType === t
                  ? "rgba(29,78,216,0.08)"
                  : "var(--wm-emp-bg, #fff)",
                color: jobType === t
                  ? "var(--wm-er-accent-career)"
                  : "var(--wm-emp-muted, #6b7280)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t === "any" ? "All types" : fmtJobType(t)}
            </button>
          ))}
        </div>

        {/* Work Mode */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {(["any", "on-site", "remote", "hybrid"] as WorkModeFilter[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setWorkMode(m)}
              style={{
                fontSize: 12,
                fontWeight: workMode === m ? 900 : 700,
                padding: "6px 12px",
                borderRadius: 999,
                border: workMode === m
                  ? "1.5px solid var(--wm-er-accent-career)"
                  : "1px solid var(--wm-emp-border, rgba(15,23,42,0.10))",
                background: workMode === m
                  ? "rgba(29,78,216,0.08)"
                  : "var(--wm-emp-bg, #fff)",
                color: workMode === m
                  ? "var(--wm-er-accent-career)"
                  : "var(--wm-emp-muted, #6b7280)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {m === "any" ? "All modes" : fmtWorkMode(m)}
            </button>
          ))}
        </div>

        {/* Experience */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {(["any", "0-1", "1-3", "3-7", "7+"] as ExperienceFilter[]).map((e) => {
            const labels: Record<ExperienceFilter, string> = {
              any: "Any experience",
              "0-1": "0-1 yr",
              "1-3": "1-3 yrs",
              "3-7": "3-7 yrs",
              "7+": "7+ yrs",
            };
            return (
              <button
                key={e}
                type="button"
                onClick={() => setExperience(e)}
                style={{
                  fontSize: 12,
                  fontWeight: experience === e ? 900 : 700,
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: experience === e
                    ? "1.5px solid var(--wm-er-accent-career)"
                    : "1px solid var(--wm-emp-border, rgba(15,23,42,0.10))",
                  background: experience === e
                    ? "rgba(29,78,216,0.08)"
                    : "var(--wm-emp-bg, #fff)",
                  color: experience === e
                    ? "var(--wm-er-accent-career)"
                    : "var(--wm-emp-muted, #6b7280)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {labels[e]}
              </button>
            );
          })}
        </div>

        {/* Department (dynamic) */}
        {departments.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => setDepartment("any")}
              style={{
                fontSize: 12,
                fontWeight: department === "any" ? 900 : 700,
                padding: "6px 12px",
                borderRadius: 999,
                border: department === "any"
                  ? "1.5px solid var(--wm-er-accent-career)"
                  : "1px solid var(--wm-emp-border, rgba(15,23,42,0.10))",
                background: department === "any"
                  ? "rgba(29,78,216,0.08)"
                  : "var(--wm-emp-bg, #fff)",
                color: department === "any"
                  ? "var(--wm-er-accent-career)"
                  : "var(--wm-emp-muted, #6b7280)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              All departments
            </button>
            {departments.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDepartment(d)}
                style={{
                  fontSize: 12,
                  fontWeight: department === d ? 900 : 700,
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: department === d
                    ? "1.5px solid var(--wm-er-accent-career)"
                    : "1px solid var(--wm-emp-border, rgba(15,23,42,0.10))",
                  background: department === d
                    ? "rgba(29,78,216,0.08)"
                    : "var(--wm-emp-bg, #fff)",
                  color: department === d
                    ? "var(--wm-er-accent-career)"
                    : "var(--wm-emp-muted, #6b7280)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Clear all */}
        {hasFilters && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={clearFilters}
              style={{
                fontSize: 12,
                fontWeight: 800,
                padding: "4px 10px",
                border: "none",
                background: "none",
                color: "var(--wm-error, #dc2626)",
                cursor: "pointer",
              }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* Save Search + Alerts */}
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            const criteria: CareerAlertCriteria = {
              domain: "career",
              query: query.trim() || undefined,
              jobType: jobType !== "any" ? jobType : undefined,
              workMode: workMode !== "any" ? workMode : undefined,
              experience: experience !== "any" ? experience : undefined,
              department: department !== "any" ? department : undefined,
            };
            const result = jobAlertStorage.save("career", criteria);
            setNotice(result.success
              ? "Search saved! You'll be notified of new matches."
              : result.reason ?? "Could not save alert.");
          }}
          style={{
            marginTop: 10, width: "100%", padding: "10px 16px", borderRadius: 10,
            border: "1px solid rgba(29,78,216,0.3)", background: "rgba(29,78,216,0.06)",
            color: "var(--wm-er-accent-career)", fontSize: 12, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          Save this search
        </button>
      )}
      <SavedSearchCard />

      {/* Results Count */}
      <div style={{ marginTop: 12, fontSize: 12, color: "var(--wm-emp-muted, #6b7280)", fontWeight: 900 }}>
        {filtered.length} {filtered.length === 1 ? "job" : "jobs"} found
      </div>

      {/* Result Cards */}
      <div style={{ marginTop: 10, display: "grid", gap: 10, marginBottom: 24 }}>
        {filtered.length === 0 && (
          <div className="wm-ee-card" style={{ textAlign: "center", padding: 24 }}>
            <div style={{ fontWeight: 900, fontSize: 14 }}>No jobs found</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-emp-muted, #6b7280)", lineHeight: 1.5 }}>
              {hasFilters
                ? "Try changing your filters or search query."
                : "No career jobs available right now. Check back later."}
            </div>
            {hasFilters && (
              <button
                className="wm-outlineBtn"
                type="button"
                onClick={clearFilters}
                style={{ marginTop: 12 }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {filtered.map((p) => (
          <JobCard key={p.id} post={p} onOpen={openDetails} />
        ))}
      </div>
      {notice && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", padding: "10px 20px", borderRadius: 10, background: "var(--wm-er-accent-career)", color: "#fff", fontSize: 13, fontWeight: 700, zIndex: 100, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {notice}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Job Card Sub-component
// ─────────────────────────────────────────────────────────────────────────────

function JobCard({
  post,
  onOpen,
}: {
  post: CareerSearchPost;
  onOpen: (id: string) => void;
}) {
  const salary = fmtSalaryRange(post.salaryMin, post.salaryMax, post.salaryPeriod);
  const exp = fmtExperience(post.experienceMin, post.experienceMax);

  return (
    <button
      type="button"
      onClick={() => onOpen(post.id)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 14,
        borderRadius: 14,
        border: "1px solid rgba(29,78,216,0.12)",
        background: "var(--wm-emp-surface, #fff)",
        cursor: "pointer",
        transition: "border-color 0.15s",
      }}
      aria-label={`Open ${post.jobTitle} at ${post.companyName}`}
    >
      {/* Title + Company */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 1000, color: "var(--wm-er-accent-career)" }}>
            {post.jobTitle}
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-emp-text, #111827)", marginTop: 2 }}>
            {post.companyName}
            {post.department ? ` — ${post.department}` : ""}
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--wm-er-accent-career)",
            whiteSpace: "nowrap",
          }}
        >
          View
        </span>
      </div>

      {/* Tags Row */}
      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <TagPill label={fmtJobType(post.jobType)} />
        <TagPill label={fmtWorkMode(post.workMode)} />
        {post.location && <TagPill label={post.location} />}
      </div>

      {/* Details Row */}
      <div
        style={{
          marginTop: 8,
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          fontSize: 12,
          color: "var(--wm-emp-muted, #6b7280)",
        }}
      >
        <span>Salary: {salary}</span>
        <span>Exp: {exp}</span>
        <span>Rounds: {post.interviewRounds}</span>
      </div>

      {/* Skills */}
      {post.skills.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {post.skills.slice(0, 5).map((s) => (
            <span
              key={s}
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 999,
                background: "rgba(29,78,216,0.08)",
                color: "var(--wm-er-accent-career)",
              }}
            >
              {s}
            </span>
          ))}
          {post.skills.length > 5 && (
            <span style={{ fontSize: 11, color: "var(--wm-emp-muted, #6b7280)" }}>
              +{post.skills.length - 5} more
            </span>
          )}
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tag Pill
// ─────────────────────────────────────────────────────────────────────────────

function TagPill({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 800,
        padding: "2px 8px",
        borderRadius: 999,
        background: "rgba(29,78,216,0.06)",
        border: "1px solid rgba(29,78,216,0.12)",
        color: "var(--wm-emp-muted, #6b7280)",
      }}
    >
      {label}
    </span>
  );
}